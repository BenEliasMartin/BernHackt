#!/bin/bash

# Convert PyTorch models to ONNX format for browser inference

echo "🚀 Converting Fin-O models to ONNX format..."

# Create output directory
mkdir -p public/model

# Convert Fin-O Small model
echo "🔄 Converting Fin-O Small model..."
python3 scripts/convert_pytorch_to_onnx.py \
  --model-type small \
  --model-path model/fin-o-small \
  --output-dir public/model

# Convert Fin-O Large model  
echo "🔄 Converting Fin-O Large model..."
python3 scripts/convert_pytorch_to_onnx.py \
  --model-type large \
  --model-path model/fin-o-large \
  --output-dir public/model

echo "✅ Model conversion complete!"
echo "📁 Files created in public/model/:"
ls -la public/model/
echo ""
echo "🌐 You can now test the models at: http://localhost:3000"
