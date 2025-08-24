#!/usr/bin/env python3
"""
Script to convert PyTorch Fin-O models to ONNX format for browser inference.
This script converts the trained PyTorch models to ONNX format and creates
necessary JSON files for the TypeScript inference component.
"""

import torch
import torch.nn as nn
import json
import pickle
import numpy as np
from pathlib import Path
import argparse

# Import your model classes (you'll need to adjust these based on your actual model structure)
class Encoder(nn.Module):
    def __init__(self, vocab_size_cat, vocab_size_merch, embedding_dim, hidden_dim, num_layers, dropout):
        super().__init__()
        self.category_embedding = nn.Embedding(vocab_size_cat, embedding_dim)
        self.merchant_embedding = nn.Embedding(vocab_size_merch, embedding_dim)

        self.lstm = nn.LSTM(
            input_size=12 + (embedding_dim * 2),
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )

    def forward(self, x):
        numerical_feats = x[:, :, [0,1,4,5,6,7,8,9,10,11,12,13]]
        cat_ids = x[:, :, 2].long()
        merch_ids = x[:, :, 3].long()

        cat_embeds = self.category_embedding(cat_ids)
        merch_embeds = self.merchant_embedding(merch_ids)

        lstm_input = torch.cat((numerical_feats, cat_embeds, merch_embeds), dim=2)

        _, (hidden, cell) = self.lstm(lstm_input)
        return hidden, cell

class Decoder(nn.Module):
    def __init__(self, vocab_size_cat, vocab_size_merch, embedding_dim, hidden_dim, num_layers, dropout):
        super().__init__()
        self.vocab_size_cat = vocab_size_cat
        self.vocab_size_merch = vocab_size_merch

        self.category_embedding = nn.Embedding(vocab_size_cat, embedding_dim)
        self.merchant_embedding = nn.Embedding(vocab_size_merch, embedding_dim)

        self.lstm = nn.LSTM(
            input_size=1 + (embedding_dim * 2),
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout
        )

        self.fc_amount = nn.Linear(hidden_dim, 1)
        self.fc_category = nn.Linear(hidden_dim, vocab_size_cat)
        self.fc_merchant = nn.Linear(hidden_dim, vocab_size_merch)

    def forward(self, x_t, hidden, cell):
        x_t = x_t.unsqueeze(1)

        numerical_feat = x_t[:, :, 0].unsqueeze(-1)
        cat_ids = x_t[:, :, 1].long()
        merch_ids = x_t[:, :, 2].long()

        cat_embeds = self.category_embedding(cat_ids)
        merch_embeds = self.merchant_embedding(merch_ids)

        lstm_input = torch.cat((numerical_feat, cat_embeds, merch_embeds), dim=2)

        output, (hidden, cell) = self.lstm(lstm_input, (hidden, cell))

        pred_amount = self.fc_amount(output.squeeze(1))
        pred_category = self.fc_category(output.squeeze(1))
        pred_merchant = self.fc_merchant(output.squeeze(1))

        return pred_amount, pred_category, pred_merchant, hidden, cell

class Seq2Seq(nn.Module):
    def __init__(self, encoder, decoder, device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(self, src, trg, teacher_forcing_ratio=0.5):
        batch_size = src.shape[0]
        forecast_horizon = trg.shape[1]

        outputs_amount = torch.zeros(batch_size, forecast_horizon, 1).to(self.device)
        outputs_category = torch.zeros(batch_size, forecast_horizon, self.decoder.vocab_size_cat).to(self.device)
        outputs_merchant = torch.zeros(batch_size, forecast_horizon, self.decoder.vocab_size_merch).to(self.device)

        hidden, cell = self.encoder(src)

        decoder_input = trg[:, 0, :]

        for t in range(forecast_horizon):
            pred_amount, pred_category, pred_merchant, hidden, cell = self.decoder(decoder_input, hidden, cell)

            outputs_amount[:, t, :] = pred_amount
            outputs_category[:, t, :] = pred_category
            outputs_merchant[:, t, :] = pred_merchant

            teacher_force = torch.rand(1).item() < teacher_forcing_ratio

            if teacher_force:
                decoder_input = trg[:, t, :]
            else:
                top_category_id = pred_category.argmax(1).long()
                top_merchant_id = pred_merchant.argmax(1).long()

                decoder_input = torch.cat((pred_amount, top_category_id.unsqueeze(1).float(), top_merchant_id.unsqueeze(1).float()), dim=1)

        return outputs_amount, outputs_category, outputs_merchant

def convert_model_to_onnx(model_path: str, model_type: str, output_dir: str):
    """Convert PyTorch model to ONNX format."""
    
    # Model configuration
    VOCAB_SIZE_CAT = 42
    VOCAB_SIZE_MERCH = 277
    EMBEDDING_DIM = 128
    HIDDEN_DIM = 512 if model_type == 'large' else 256
    NUM_LAYERS = 4 if model_type == 'large' else 2
    DROPOUT_PROB = 0.2
    SEQUENCE_LENGTH = 50
    FORECAST_HORIZON = 10
    
    device = torch.device('cpu')
    
    # Create model architecture
    encoder = Encoder(VOCAB_SIZE_CAT, VOCAB_SIZE_MERCH, EMBEDDING_DIM, HIDDEN_DIM, NUM_LAYERS, DROPOUT_PROB)
    decoder = Decoder(VOCAB_SIZE_CAT, VOCAB_SIZE_MERCH, EMBEDDING_DIM, HIDDEN_DIM, NUM_LAYERS, DROPOUT_PROB)
    model = Seq2Seq(encoder, decoder, device)
    
    # Load trained weights
    if Path(model_path).exists():
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint)
        print(f"Loaded model weights from {model_path}")
    else:
        print(f"Warning: Model file {model_path} not found. Using random weights.")
    
    model.eval()
    
    # Create dummy input for ONNX export
    dummy_input = torch.randn(1, SEQUENCE_LENGTH, 14)  # batch_size=1, seq_len=50, features=14
    dummy_target = torch.randn(1, FORECAST_HORIZON, 4)  # batch_size=1, forecast_horizon=10, features=4
    
    # Export to ONNX
    output_path = Path(output_dir) / f"fin-o-{model_type}.onnx"
    
    torch.onnx.export(
        model,
        (dummy_input, dummy_target),
        output_path,
        export_params=True,
        opset_version=11,
        do_constant_folding=True,
        input_names=['input', 'target'],
        output_names=['amount_output', 'category_output', 'merchant_output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'target': {0: 'batch_size'},
            'amount_output': {0: 'batch_size'},
            'category_output': {0: 'batch_size'},
            'merchant_output': {0: 'batch_size'}
        }
    )
    
    print(f"Model exported to {output_path}")
    return output_path

def create_scaler_json(scaler_path: str, output_dir: str):
    """Convert pickle scaler to JSON format."""
    if Path(scaler_path).exists():
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Convert scaler to JSON-serializable format
        scaler_json = {
            'scale_': scaler.scale_.tolist(),
            'mean_': scaler.mean_.tolist(),
            'var_': scaler.var_.tolist(),
            'n_samples_seen_': scaler.n_samples_seen_
        }
        
        output_path = Path(output_dir) / "scaler.json"
        with open(output_path, 'w') as f:
            json.dump(scaler_json, f, indent=2)
        
        print(f"Scaler exported to {output_path}")
    else:
        print(f"Warning: Scaler file {scaler_path} not found.")

def copy_vocab_json(vocab_path: str, output_dir: str):
    """Copy vocab.json to output directory."""
    if Path(vocab_path).exists():
        output_path = Path(output_dir) / "vocab.json"
        import shutil
        shutil.copy2(vocab_path, output_path)
        print(f"Vocab file copied to {output_path}")
    else:
        print(f"Warning: Vocab file {vocab_path} not found.")

def main():
    parser = argparse.ArgumentParser(description='Convert PyTorch Fin-O models to ONNX format')
    parser.add_argument('--model-type', choices=['small', 'large'], required=True,
                       help='Type of model to convert')
    parser.add_argument('--model-path', type=str, required=True,
                       help='Path to the PyTorch model file (.pth)')
    parser.add_argument('--scaler-path', type=str, default='model/scaler.pkl',
                       help='Path to the scaler pickle file')
    parser.add_argument('--vocab-path', type=str, default='model/vocab.json',
                       help='Path to the vocab.json file')
    parser.add_argument('--output-dir', type=str, default='public/model',
                       help='Output directory for ONNX model and JSON files')
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert model to ONNX
    convert_model_to_onnx(args.model_path, args.model_type, str(output_dir))
    
    # Create scaler JSON
    create_scaler_json(args.scaler_path, str(output_dir))
    
    # Copy vocab JSON
    copy_vocab_json(args.vocab_path, str(output_dir))
    
    print(f"\nConversion complete! Files saved to {output_dir}")
    print("You can now use these files with the TypeScript inference component.")

if __name__ == "__main__":
    main()
