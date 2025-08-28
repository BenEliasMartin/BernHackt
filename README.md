<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/fe0e1dee-e43b-408c-90eb-67db5b3cb592" />

# Fin

Fin is a comprehensive financial AI platform, featuring voice interaction, financial analysis, and AI-powered transaction prediction.

## Features

- 🎤 **Voice Interaction**: Real-time voice input and output using ElevenLabs
- 🤖 **AI Financial Agent**: OpenAI-powered financial analysis and advice
- 📊 **Financial Dashboard**: Comprehensive financial overview and analytics
- 🧠 **Model Inference**: Fin-O AI models for transaction prediction
- 🎨 **Modern UI**: Beautiful, responsive design with animations
- 🔧 **Developer Tools**: Comprehensive tooling and API endpoints

## Model Inference Component

The platform includes a sophisticated TypeScript component for running inference on Fin-O AI models (both small and large variants) directly in the browser.

### Features

- **Dual Model Support**: Choose between Fin-O Small (61M) and Fin-O Large (298M) models
- **Real-time Inference**: Run predictions directly in the browser using ONNX.js
- **Interactive Dashboard**: User-friendly interface with model comparison and analytics
- **TypeScript Integration**: Fully typed for better development experience

### Setup Instructions

1. **Convert PyTorch Models to ONNX**:
   ```bash
   # Convert Fin-O Small model
   python scripts/convert_model_to_onnx.py \
     --model-type small \
     --model-path model/fin-o-small \
     --output-dir public/model

   # Convert Fin-O Large model  
   python scripts/convert_model_to_onnx.py \
     --model-type large \
     --model-path model/fin-o-large \
     --output-dir public/model
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Model Inference**:
   Navigate to `http://localhost:3000/model-inference` to test the models.

### Model Architecture

The Fin-O models use a Seq2Seq architecture with:
- **Encoder**: LSTM with embeddings for categories and merchants
- **Decoder**: LSTM with separate output heads for amount, category, and merchant prediction
- **Input Features**: 14 features per transaction (amount, balance, time deltas, cyclical encodings)
- **Output**: 10-step forecast horizon with amount, category, and merchant predictions

### Usage

```typescript
import { createFinOModel } from '@/lib/model-inference';

// Create model instance
const model = createFinOModel('small'); // or 'large'

// Load model
await model.loadModel();

// Run prediction
const predictions = await model.predict(transactionData);
```

### Component Integration

```tsx
import ModelInference from '@/components/ModelInference';

// Use in your component
<ModelInference 
  modelType="small" 
  onPredictionComplete={(predictions) => {
    console.log('Predictions:', predictions);
  }}
/>
```

## Project Structure

```
BernHackt/
├── app/                    # Next.js app directory
│   ├── model-inference/    # Model inference page
│   └── ...
├── components/             # React components
│   ├── ModelInference.tsx  # Main inference component
│   └── ...
├── lib/                    # Utility libraries
│   ├── model-inference.ts  # Model inference logic
│   └── ...
├── model/                  # AI models
│   ├── fin-o-small        # Small model file
│   ├── fin-o-large        # Large model file
│   └── vocab.json         # Vocabulary mappings
├── scripts/                # Python scripts
│   └── convert_model_to_onnx.py
└── public/model/           # ONNX models and JSON files
```

## API Endpoints

- `/api/clanker` - Clanker API integration
- `/api/openai-tools` - OpenAI tools integration
- `/api/tools/firebaseAccess` - Firebase access
- `/api/tools/makeDashboard` - Dashboard generation
- `/api/user-summary` - User summary generation

## Voice Features

The platform includes comprehensive voice interaction capabilities:

- **Voice Input**: Real-time speech-to-text
- **Voice Output**: AI-generated speech responses
- **Voice Context**: Persistent voice session management

## Development

### Prerequisites

- Node.js 18+
- Python 3.8+ (for model conversion)
- PyTorch (for model conversion)

### Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
FIREBASE_CONFIG=your_firebase_config
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with Next.js 15
- UI components from Radix UI
- Voice integration with ElevenLabs
- AI models trained on financial transaction data
