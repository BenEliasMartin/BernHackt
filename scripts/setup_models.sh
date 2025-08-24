#!/bin/bash

# Setup script for converting PyTorch models to ONNX format
# This script automates the conversion process for both Fin-O models

set -e  # Exit on any error

echo "🚀 Setting up Fin-O models for browser inference..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if PyTorch is installed
python3 -c "import torch" 2>/dev/null || {
    echo "❌ PyTorch is required but not installed."
    echo "Install it with: pip install torch"
    exit 1
}

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p public/model
mkdir -p scripts

# Check if model files exist
if [ ! -f "model/fin-o-small" ]; then
    echo "⚠️  Warning: model/fin-o-small not found"
fi

if [ ! -f "model/fin-o-large" ]; then
    echo "⚠️  Warning: model/fin-o-large not found"
fi

if [ ! -f "model/vocab.json" ]; then
    echo "❌ Error: model/vocab.json not found"
    exit 1
fi

# Convert Fin-O Small model
echo "🔄 Converting Fin-O Small model..."
if [ -f "model/fin-o-small" ]; then
    python3 scripts/convert_model_to_onnx.py \
        --model-type small \
        --model-path model/fin-o-small \
        --output-dir public/model
else
    echo "⚠️  Skipping Fin-O Small conversion (file not found)"
fi

# Convert Fin-O Large model
echo "🔄 Converting Fin-O Large model..."
if [ -f "model/fin-o-large" ]; then
    python3 scripts/convert_model_to_onnx.py \
        --model-type large \
        --model-path model/fin-o-large \
        --output-dir public/model
else
    echo "⚠️  Skipping Fin-O Large conversion (file not found)"
fi

# Copy vocab.json to public directory
echo "📋 Copying vocabulary file..."
cp model/vocab.json public/model/vocab.json

# Create a simple scaler.json if it doesn't exist
if [ ! -f "public/model/scaler.json" ]; then
    echo "📊 Creating default scaler configuration..."
    cat > public/model/scaler.json << 'EOF'
{
  "scale_": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "mean_": [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
  "var_": [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  "n_samples_seen_": 1000
}
EOF
fi

echo "✅ Model setup complete!"
echo ""
echo "📁 Files created in public/model/:"
ls -la public/model/
echo ""
echo "🌐 You can now access the model inference at:"
echo "   http://localhost:3000/model-inference"
echo "   http://localhost:3000/test-model"
echo ""
echo "📚 For more information, see the README.md file."
