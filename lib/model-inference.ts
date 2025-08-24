import * as ort from 'onnxruntime-web';

export interface TransactionData {
  amount: number;
  balance_before: number;
  category_id: number;
  merchant_id: number;
  time_delta: number;
  time_delta_category: number;
  time_delta_merchant: number;
  avg_amount_merchant: number;
  day_of_week_sin: number;
  day_of_week_cos: number;
  day_of_month_sin: number;
  day_of_month_cos: number;
  month_of_year_sin: number;
  month_of_year_cos: number;
}

export interface PredictionResult {
  amount: number;
  category: string;
  merchant: string;
  confidence: number;
}

export interface ModelConfig {
  sequenceLength: number;
  forecastHorizon: number;
  embeddingDim: number;
  hiddenDim: number;
  numLayers: number;
  vocabSizes: {
    categories: number;
    merchants: number;
  };
}

export class FinOModel {
  private session: ort.InferenceSession | null = null;
  private vocabMappings: any = null;
  private scaler: any = null;
  private config: ModelConfig;
  private modelPath: string;
  private mockMode: boolean = false;

  constructor(modelPath: string, config: ModelConfig) {
    this.modelPath = modelPath;
    this.config = config;
  }

  async loadModel(): Promise<void> {
    try {
      // Check if we're in mock mode (no actual model files)
      if (this.modelPath.includes('mock')) {
        this.mockMode = true;
        console.log('Running in mock mode for testing');
        await this.loadVocabMappings();
        return;
      }

      // Try to load the ONNX model
      console.log(`Loading model from: ${this.modelPath}`);
      console.log('Model path check:', this.modelPath);
      
      this.session = await ort.InferenceSession.create(this.modelPath);
      console.log('ONNX model loaded successfully');
      
      // Load vocab mappings and scaler
      await this.loadVocabMappings();
      await this.loadScaler();
      
      console.log('Model loading completed successfully - NOT in mock mode');
      
    } catch (error) {
      console.error('Error loading model:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        modelPath: this.modelPath
      });
      
      // Fall back to mock mode
      this.mockMode = true;
      console.log('Falling back to mock mode for testing');
      await this.loadVocabMappings();
    }
  }

  private async loadVocabMappings(): Promise<void> {
    try {
      const vocabResponse = await fetch('/model/vocab.json');
      this.vocabMappings = await vocabResponse.json();
      console.log('Vocab mappings loaded successfully');
    } catch (error) {
      console.warn('Vocab file not found, using default vocab');
      this.vocabMappings = {
        categories: [
          "GENERAL_EXPENSES_DAILY", "SHOPPING_JEWELRY", "INCOME_GENERAL",
          "HEALTHCARE_GENERAL", "P2P_TRANSFER", "BANK_FEE", "INSURANCE",
          "ENTERTAINMENT_STREAMING", "HEALTH_INSURANCE", "TRANSPORTATION_PUBLIC",
          "CASH_WITHDRAWAL", "HOUSING_GENERAL", "UTILITIES_GENERAL"
        ],
        merchants: [
          "Coop", "Swiss Company", "Local Bank Salary", "Swica Insurance",
          "Volg", "Online Bookstore", "YouTube Premium", "Local Bank Mobile",
          "Migros", "Swica", "Tram Monthly Pass", "Raiffeisen ATM", "Livit AG"
        ]
      };
    }
  }

  private async loadScaler(): Promise<void> {
    try {
      const scalerResponse = await fetch('/model/scaler.json');
      this.scaler = await scalerResponse.json();
      console.log('Scaler loaded successfully');
    } catch (error) {
      console.warn('Scaler file not found, using default scaling');
      this.scaler = {
        scale_: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        mean_: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
      };
    }
  }

  private preprocessSequence(transactions: TransactionData[]): Float32Array {
    const sequenceLength = this.config.sequenceLength;
    const inputFeatures = 14; // As defined in your model
    
    // Pad or truncate to sequence length
    const paddedTransactions = this.padOrTruncate(transactions, sequenceLength);
    
    // Convert to the format expected by the model
    const inputArray = new Float32Array(sequenceLength * inputFeatures);
    
    for (let i = 0; i < sequenceLength; i++) {
      const transaction = paddedTransactions[i];
      const baseIndex = i * inputFeatures;
      
      // Ensure category and merchant IDs are within valid ranges
      const categoryId = Math.max(0, Math.min(transaction.category_id, this.config.vocabSizes.categories - 1));
      const merchantId = Math.max(0, Math.min(transaction.merchant_id, this.config.vocabSizes.merchants - 1));
      
      inputArray[baseIndex + 0] = transaction.amount;
      inputArray[baseIndex + 1] = transaction.balance_before;
      inputArray[baseIndex + 2] = categoryId;
      inputArray[baseIndex + 3] = merchantId;
      inputArray[baseIndex + 4] = transaction.time_delta;
      inputArray[baseIndex + 5] = transaction.time_delta_category;
      inputArray[baseIndex + 6] = transaction.time_delta_merchant;
      inputArray[baseIndex + 7] = transaction.avg_amount_merchant;
      inputArray[baseIndex + 8] = transaction.day_of_week_sin;
      inputArray[baseIndex + 9] = transaction.day_of_week_cos;
      inputArray[baseIndex + 10] = transaction.day_of_month_sin;
      inputArray[baseIndex + 11] = transaction.day_of_month_cos;
      inputArray[baseIndex + 12] = transaction.month_of_year_sin;
      inputArray[baseIndex + 13] = transaction.month_of_year_cos;
    }
    
    return inputArray;
  }

  private padOrTruncate(transactions: TransactionData[], targetLength: number): TransactionData[] {
    if (transactions.length === targetLength) {
      return transactions;
    }
    
    if (transactions.length > targetLength) {
      return transactions.slice(-targetLength);
    }
    
    // Pad with the last transaction
    const lastTransaction = transactions[transactions.length - 1] || this.getDefaultTransaction();
    const padding = new Array(targetLength - transactions.length).fill(lastTransaction);
    return [...transactions, ...padding];
  }

  private getDefaultTransaction(): TransactionData {
    return {
      amount: 0,
      balance_before: 0,
      category_id: 0,
      merchant_id: 0,
      time_delta: 0,
      time_delta_category: 0,
      time_delta_merchant: 0,
      avg_amount_merchant: 0,
      day_of_week_sin: 0,
      day_of_week_cos: 0,
      day_of_month_sin: 0,
      day_of_month_cos: 0,
      month_of_year_sin: 0,
      month_of_year_cos: 0,
    };
  }

  async predict(transactions: TransactionData[]): Promise<PredictionResult[]> {
    if (this.mockMode) {
      return this.generateMockPredictions();
    }

    if (!this.session) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      console.log('Running real model inference...');
      
      // Preprocess input
      const inputArray = this.preprocessSequence(transactions);
      
      // Create input tensor
      const inputTensor = new ort.Tensor('float32', inputArray, [1, this.config.sequenceLength, 14]);
      
      // Create dummy target tensor for the model
      const dummyTarget = new ort.Tensor('float32', new Float32Array(this.config.forecastHorizon * 4), [1, this.config.forecastHorizon, 4]);
      
      // Run inference
      const feeds = { 
        input: inputTensor,
        target: dummyTarget
      };
      
      console.log('Running ONNX inference...');
      const results = await this.session.run(feeds);
      console.log('ONNX inference completed');
      
      // Process outputs
      const predictions: PredictionResult[] = [];
      const forecastHorizon = this.config.forecastHorizon;
      
      // Extract predictions from model outputs
      const amountOutput = results.amount_output?.data as Float32Array;
      const categoryOutput = results.category_output?.data as Float32Array;
      const merchantOutput = results.merchant_output?.data as Float32Array;
      
      if (!amountOutput || !categoryOutput || !merchantOutput) {
        throw new Error('Model outputs not found in results');
      }
      
      console.log(`Processing ${forecastHorizon} predictions...`);
      
      for (let i = 0; i < forecastHorizon; i++) {
        const amount = amountOutput[i];
        const categoryId = this.argmax(categoryOutput.slice(i * this.config.vocabSizes.categories, (i + 1) * this.config.vocabSizes.categories));
        const merchantId = this.argmax(merchantOutput.slice(i * this.config.vocabSizes.merchants, (i + 1) * this.config.vocabSizes.merchants));
        
        console.log(`Raw model output ${i + 1}: amount=${amount}, category=${categoryId}, merchant=${merchantId}`);
        
        const scaledAmount = this.inverseTransformAmount(amount);
        
        predictions.push({
          amount: scaledAmount,
          category: this.vocabMappings.categories[categoryId] || 'Unknown',
          merchant: this.vocabMappings.merchants[merchantId] || 'Unknown',
          confidence: 0.8, // You can calculate actual confidence if needed
        });
      }
      
      console.log(`Generated ${predictions.length} predictions`);
      return predictions;
      
    } catch (error) {
      console.error('Error during prediction:', error);
      throw error;
    }
  }


  private argmax(array: Float32Array): number {
    let maxIndex = 0;
    let maxValue = array[0];
    
    for (let i = 1; i < array.length; i++) {
      if (array[i] > maxValue) {
        maxValue = array[i];
        maxIndex = i;
      }
    }
    
    return maxIndex;
  }

  private inverseTransformAmount(normalizedAmount: number): number {
    // Apply inverse scaling transformation using the real scaler parameters
    if (this.scaler && this.scaler.scale_ && this.scaler.mean_) {
      // Use the first scale and mean values for amount scaling
      // Based on the scaler.json, this corresponds to the amount feature
      const scale = this.scaler.scale_[0]; // 1050.17
      const mean = this.scaler.mean_[0];   // -55.32
      
      const scaledAmount = normalizedAmount * scale + mean;
      console.log(`Real scaling: ${normalizedAmount} -> ${scaledAmount} (scale: ${scale}, mean: ${mean})`);
      return scaledAmount;
    }
    
    console.log(`No scaler available, using raw amount: ${normalizedAmount}`);
    return normalizedAmount;
  }

  private generateMockPredictions(): PredictionResult[] {
    const predictions: PredictionResult[] = [];
    const categories = this.vocabMappings.categories;
    const merchants = this.vocabMappings.merchants;
    
    for (let i = 0; i < this.config.forecastHorizon; i++) {
      const isIncome = Math.random() > 0.8;
      const amount = isIncome ? 
        Math.random() * 5000 + 1000 : 
        -(Math.random() * 200 + 10);
      
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const merchantIndex = Math.floor(Math.random() * merchants.length);
      
      predictions.push({
        amount: parseFloat(amount.toFixed(2)),
        category: categories[categoryIndex],
        merchant: merchants[merchantIndex],
        confidence: 0.7 + Math.random() * 0.2, // 0.7-0.9 confidence
      });
    }
    
    return predictions;
  }

  async dispose(): Promise<void> {
    if (this.session) {
      await this.session.release();
      this.session = null;
    }
  }
}

// Factory function to create model instances
export function createFinOModel(modelType: 'small' | 'large'): FinOModel {
  const config: ModelConfig = {
    sequenceLength: 50,
    forecastHorizon: 10,
    embeddingDim: 128,
    hiddenDim: modelType === 'large' ? 1024 : 512, // Large: 1024, Small: 512
    numLayers: modelType === 'large' ? 5 : 4, // Large: 5 layers, Small: 4 layers
    vocabSizes: {
      categories: 41, // Actual number from vocab.json
      merchants: 230, // Actual number from vocab.json
    },
  };

  const modelPath = `/model/fin-o-${modelType}.onnx`;
  return new FinOModel(modelPath, config);
}

// Mock model for testing without actual files
export function createMockFinOModel(modelType: 'small' | 'large'): FinOModel {
  const config: ModelConfig = {
    sequenceLength: 50,
    forecastHorizon: 10,
    embeddingDim: 128,
    hiddenDim: modelType === 'large' ? 1024 : 512, // Large: 1024, Small: 512
    numLayers: modelType === 'large' ? 5 : 4, // Large: 5 layers, Small: 4 layers
    vocabSizes: {
      categories: 41, // Actual number from vocab.json
      merchants: 230, // Actual number from vocab.json
    },
  };

  const modelPath = `/model/mock-${modelType}.onnx`;
  return new FinOModel(modelPath, config);
}
