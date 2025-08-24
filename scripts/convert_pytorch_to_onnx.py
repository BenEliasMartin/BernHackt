#!/usr/bin/env python3
"""
Convert PyTorch Fin-O models to ONNX format for browser inference.
This script loads your trained PyTorch models and converts them to ONNX format.
"""

import torch
import torch.nn as nn
import json
import pickle
import numpy as np
from pathlib import Path
import argparse
import os

# Define the model architecture to match your training
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

            # For ONNX export, always use teacher forcing to avoid dynamic control flow
            decoder_input = trg[:, t, :]

        return outputs_amount, outputs_category, outputs_merchant

def load_model_weights(model_path: str, model: nn.Module, device: torch.device):
    """Load model weights from the PyTorch checkpoint."""
    try:
        if os.path.exists(model_path):
            # Try loading as state dict
            checkpoint = torch.load(model_path, map_location=device)
            if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
                model.load_state_dict(checkpoint['state_dict'])
            else:
                model.load_state_dict(checkpoint)
            print(f"✅ Loaded model weights from {model_path}")
            return True
        else:
            print(f"❌ Model file not found: {model_path}")
            return False
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def convert_model_to_onnx(model_path: str, model_type: str, output_dir: str):
    """Convert PyTorch model to ONNX format."""
    
    # Model configuration - CORRECTED to match actual trained model
    VOCAB_SIZE_CAT = 41  # Actual number from vocab.json
    VOCAB_SIZE_MERCH = 230  # Actual number from vocab.json
    EMBEDDING_DIM = 128
    HIDDEN_DIM = 512  # Both models use 512
    NUM_LAYERS = 4  # Both models use 4 layers
    DROPOUT_PROB = 0.2
    SEQUENCE_LENGTH = 50
    FORECAST_HORIZON = 10
    
    device = torch.device('cpu')
    
    # Create model architecture
    encoder = Encoder(VOCAB_SIZE_CAT, VOCAB_SIZE_MERCH, EMBEDDING_DIM, HIDDEN_DIM, NUM_LAYERS, DROPOUT_PROB)
    decoder = Decoder(VOCAB_SIZE_CAT, VOCAB_SIZE_MERCH, EMBEDDING_DIM, HIDDEN_DIM, NUM_LAYERS, DROPOUT_PROB)
    model = Seq2Seq(encoder, decoder, device)
    
    # Load trained weights
    weights_loaded = load_model_weights(model_path, model, device)
    
    if not weights_loaded:
        print("⚠️  Using random weights for ONNX export")
    
    model.eval()
    
    # Create dummy input for ONNX export with valid indices
    dummy_input = torch.randn(1, SEQUENCE_LENGTH, 14)  # batch_size=1, seq_len=50, features=14
    
    # Set category and merchant IDs to valid ranges
    dummy_input[:, :, 2] = torch.randint(0, VOCAB_SIZE_CAT, (1, SEQUENCE_LENGTH))  # category_id
    dummy_input[:, :, 3] = torch.randint(0, VOCAB_SIZE_MERCH, (1, SEQUENCE_LENGTH))  # merchant_id
    
    dummy_target = torch.randn(1, FORECAST_HORIZON, 4)  # batch_size=1, forecast_horizon=10, features=4
    
    # Set target category and merchant IDs to valid ranges
    dummy_target[:, :, 1] = torch.randint(0, VOCAB_SIZE_CAT, (1, FORECAST_HORIZON))  # category_id
    dummy_target[:, :, 2] = torch.randint(0, VOCAB_SIZE_MERCH, (1, FORECAST_HORIZON))  # merchant_id
    
    # Export to ONNX
    output_path = Path(output_dir) / f"fin-o-{model_type}.onnx"
    
    print(f"🔄 Exporting model to {output_path}...")
    
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
    
    print(f"✅ Model exported to {output_path}")
    return output_path

def create_scaler_json(scaler_path: str, output_dir: str):
    """Convert pickle scaler to JSON format."""
    if Path(scaler_path).exists():
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Convert scaler to JSON-serializable format
        scaler_json = {
            'scale_': [float(x) for x in scaler.scale_.tolist()],
            'mean_': [float(x) for x in scaler.mean_.tolist()],
            'var_': [float(x) for x in scaler.var_.tolist()],
            'n_samples_seen_': int(scaler.n_samples_seen_)
        }
        
        output_path = Path(output_dir) / "scaler.json"
        with open(output_path, 'w') as f:
            json.dump(scaler_json, f, indent=2)
        
        print(f"✅ Scaler exported to {output_path}")
        print(f"   Scale values: {scaler_json['scale_'][:3]}... (showing first 3)")
        print(f"   Mean values: {scaler_json['mean_'][:3]}... (showing first 3)")
    else:
        print(f"⚠️  Scaler file {scaler_path} not found, creating default scaler")
        # Create default scaler
        scaler_json = {
            'scale_': [1.0] * 12,
            'mean_': [0.0] * 12,
            'var_': [1.0] * 12,
            'n_samples_seen_': 1000
        }
        
        output_path = Path(output_dir) / "scaler.json"
        with open(output_path, 'w') as f:
            json.dump(scaler_json, f, indent=2)
        
        print(f"✅ Default scaler created at {output_path}")

def copy_vocab_json(vocab_path: str, output_dir: str):
    """Copy vocab.json to output directory."""
    if Path(vocab_path).exists():
        output_path = Path(output_dir) / "vocab.json"
        import shutil
        shutil.copy2(vocab_path, output_path)
        print(f"✅ Vocab file copied to {output_path}")
    else:
        print(f"❌ Vocab file {vocab_path} not found")

def main():
    parser = argparse.ArgumentParser(description='Convert PyTorch Fin-O models to ONNX format')
    parser.add_argument('--model-type', choices=['small', 'large'], required=True,
                       help='Type of model to convert')
    parser.add_argument('--model-path', type=str, required=True,
                       help='Path to the PyTorch model file')
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
    
    print(f"🚀 Converting Fin-O {args.model_type} model to ONNX format...")
    
    # Convert model to ONNX
    convert_model_to_onnx(args.model_path, args.model_type, str(output_dir))
    
    # Create scaler JSON
    create_scaler_json(args.scaler_path, str(output_dir))
    
    # Copy vocab JSON
    copy_vocab_json(args.vocab_path, str(output_dir))
    
    print(f"\n✅ Conversion complete! Files saved to {output_dir}")
    print("🌐 You can now use these files with the TypeScript inference component.")

if __name__ == "__main__":
    main()
