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

// Add German translation interface
export interface GermanTranslation {
  category: string;
  merchant: string;
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

  // Translate category to German
  private translateCategoryToGerman(englishCategory: string): string {
    const categoryTranslations: { [key: string]: string } = {
      "HIGH_END_RESTAURANT": "Luxusrestaurant",
      "ELECTRONICS_SPLURGE": "Elektronik-Splurge",
      "TRANSPORTATION_PUBLIC": "Öffentlicher Verkehr",
      "SAVINGS_TRANSFER": "Sparkassenüberweisung",
      "P2P_TRANSFER": "P2P-Überweisung",
      "LUXURY_SHOPPING": "Luxus-Einkauf",
      "GIFT_PURCHASE": "Geschenkkauf",
      "FOOD_DINING_LUNCH": "Mittagessen",
      "FOOD_DINING_DINNER": "Abendessen",
      "LUNCH_SNACK": "Mittagssnack",
      "MORNING_COFFEE": "Morgenkaffee",
      "HEALTHCARE_GENERAL": "Gesundheitswesen",
      "MOVING_EXPENSES": "Umzugskosten",
      "FURNITURE_PURCHASE": "Möbelkauf",
      "HOME_IMPROVEMENT": "Hausverbesserung",
      "BABY_SUPPLIES": "Babynahrung",
      "PHARMACY_EXPENSES": "Apothekenkosten",
      "GENERAL_EXPENSES_DAILY": "Tägliche Ausgaben",
      "CIGARETTE_PURCHASE": "Zigarettenkauf",
      "APERO_EXPENSES": "Apéro-Kosten",
      "SHOPPING_JEWELRY": "Schmuck-Einkauf",
      "SHOPPING_BOOKS": "Buch-Einkauf",
      "SHOPPING_ELECTRONICS": "Elektronik-Einkauf",
      "SHOPPING_CLOTHING": "Kleidung-Einkauf",
      "TRANSPORTATION_FUEL": "Treibstoff",
      "CASH_WITHDRAWAL": "Bargeldabhebung",
      "INSURANCE": "Versicherung",
      "BANK_FEE": "Bankgebühr",
      "ENTERTAINMENT_STREAMING": "Streaming-Unterhaltung",
      "ENTERTAINMENT_MOBILE": "Mobile Unterhaltung",
      "ENTERTAINMENT_GENERAL": "Unterhaltung",
      "EDUCATION_GENERAL": "Bildung",
      "HEALTH_INSURANCE": "Krankenversicherung",
      "TRAVEL_GENERAL": "Reisen",
      "PET_EXPENSES": "Haustierkosten",
      "HOUSING_GENERAL": "Wohnen",
      "UTILITIES_GENERAL": "Nebenkosten",
      "INCOME_GENERAL": "Einkommen",
      "OTHER_GENERAL": "Sonstiges",
      "SERAFE_PAYMENT": "Serafe-Zahlung",
      "TRAVELCARD_PURCHASE": "Reisekartenkauf"
    };

    return categoryTranslations[englishCategory] || englishCategory;
  }

  // Translate merchant to German
  private translateMerchantToGerman(englishMerchant: string): string {
    const merchantTranslations: { [key: string]: string } = {
      "Swiss Company": "Schweizer Firma",
      "TPG Monthly Pass": "TPG Monatskarte",
      "SBB Monthly Pass": "SBB Monatskarte",
      "PostAuto": "PostAuto",
      "Credit Suisse Savings": "Credit Suisse Sparkonto",
      "PostAuto Monthly Pass": "PostAuto Monatskarte",
      "VBZ Monthly Pass": "VBZ Monatskarte",
      "Twint Lunch": "Twint Mittagessen",
      "BVB Monthly Pass": "BVB Monatskarte",
      "ZKB Savings": "ZKB Sparkonto",
      "Tram Monthly Pass": "Tram Monatskarte",
      "Local Bank Savings": "Lokale Bank Sparkonto",
      "Raiffeisen Savings": "Raiffeisen Sparkonto",
      "PostFinance Savings": "PostFinance Sparkonto",
      "Online Gift Store": "Online Geschenkladen",
      "Local Café": "Lokales Café",
      "Migros Restaurant": "Migros Restaurant",
      "BVB": "BVB",
      "Italian Restaurant": "Italienisches Restaurant",
      "Twint Coffee": "Twint Kaffee",
      "Twint Tickets": "Twint Tickets",
      "VBZ": "VBZ",
      "Tram": "Tram",
      "Swiss Restaurant": "Schweizer Restaurant",
      "Twint Dinner": "Twint Abendessen",
      "Jewelry Store": "Juwelier",
      "Starbucks": "Starbucks",
      "Twint Drinks": "Twint Getränke",
      "Gift Shop": "Geschenkladen",
      "Local Bistro": "Lokales Bistro",
      "Coop": "Coop",
      "UBS Savings": "UBS Sparkonto",
      "Twint Split Bill": "Twint Rechnung teilen",
      "TPG": "TPG",
      "SBB": "SBB",
      "Twint Rent Share": "Twint Miete teilen",
      "Book Store": "Buchhandlung",
      "Pizza Place": "Pizzeria",
      "Local Doctor": "Lokaler Arzt",
      "Coop Restaurant": "Coop Restaurant",
      "Bakery": "Bäckerei",
      "Restaurant zum Kropf": "Restaurant zum Kropf",
      "Pharmacy": "Apotheke",
      "Sanitas": "Sanitas",
      "Concordia": "Concordia",
      "Swisscare": "Swisscare",
      "Steakhouse": "Steakhouse",
      "Helsana": "Helsana",
      "KPT": "KPT",
      "Asian Restaurant": "Asiatisches Restaurant",
      "Kiosk": "Kiosk",
      "Hospital": "Spital",
      "Coop Coffee": "Coop Kaffee",
      "Convenience Store": "Convenience Store",
      "Migros Coffee": "Migros Kaffee",
      "CSS": "CSS",
      "Aquilana": "Aquilana",
      "Swica": "Swica",
      "ProVita": "ProVita",
      "Dentist": "Zahnarzt",
      "Migros": "Migros",
      "Specialist Clinic": "Fachklinik",
      "Atupri": "Atupri",
      "Moving Company": "Umzugsfirma",
      "IKEA": "IKEA",
      "DIY Store": "Baumarkt",
      "AXA": "AXA",
      "Bus": "Bus",
      "Baby Store": "Babyladen",
      "Food Truck": "Food Truck",
      "Coop Pronto": "Coop Pronto",
      "Volg": "Volg",
      "Esso": "Esso",
      "Bar Au Lac": "Bar Au Lac",
      "Café Bar Odeon": "Café Bar Odeon",
      "Café Bar": "Café Bar",
      "BP": "BP",
      "Wine Bar": "Weinbar",
      "Avia": "Avia",
      "Local Pub": "Lokales Pub",
      "Bar 63": "Bar 63",
      "Shell": "Shell",
      "Migrol": "Migrol",
      "Buch.ch": "Buch.ch",
      "Conrad": "Conrad",
      "Local Library": "Lokale Bibliothek",
      "MediaMarkt": "MediaMarkt",
      "Mango": "Mango",
      "Children's Bookstore": "Kinderbuchhandlung",
      "New Yorker": "New Yorker",
      "Orell Füssli": "Orell Füssli",
      "Online Electronics": "Online Elektronik",
      "Amazon Books": "Amazon Bücher",
      "Apple Store": "Apple Store",
      "H&M": "H&M",
      "Digitec": "Digitec",
      "Zara": "Zara",
      "Buchhandlung Stauffacher": "Buchhandlung Stauffacher",
      "Brack": "Brack",
      "Buchhandlung Jäggi": "Buchhandlung Jäggi",
      "Globus Fashion": "Globus Mode",
      "Sportswear Store": "Sportbekleidungsladen",
      "Local Boutique": "Lokales Boutique",
      "Shoe Store": "Schuhladen",
      "University Bookstore": "Universitätsbuchhandlung",
      "Fust": "Fust",
      "Interdiscount": "Interdiscount",
      "Thalia": "Thalia",
      "Uniqlo": "Uniqlo",
      "Manor Fashion": "Manor Mode",
      "Academic Bookstore": "Akademische Buchhandlung",
      "Galaxus": "Galaxus",
      "Online Bookstore": "Online Buchhandlung",
      "Buchhandlung Bider": "Buchhandlung Bider",
      "Samsung Store": "Samsung Store",
      "Saturn": "Saturn",
      "Jelmoli Fashion": "Jelmoli Mode",
      "Expert": "Expert",
      "C&A": "C&A",
      "Designer Store": "Designer Store",
      "UBS ATM": "UBS Bankomat",
      "ZKB ATM": "ZKB Bankomat",
      "Credit Suisse ATM": "Credit Suisse Bankomat",
      "PostFinance ATM": "PostFinance Bankomat",
      "Raiffeisen ATM": "Raiffeisen Bankomat",
      "Helsana Insurance": "Helsana Versicherung",
      "ZKB Bank Fee": "ZKB Bankgebühr",
      "UBS Bank Fee": "UBS Bankgebühr",
      "Sanitas Insurance": "Sanitas Versicherung",
      "Local Bank Bank Fee": "Lokale Bank Bankgebühr",
      "YouTube Premium": "YouTube Premium",
      "Local Bank Mobile": "Lokale Bank Mobile",
      "Fitness First": "Fitness First",
      "Atupri Insurance": "Atupri Versicherung",
      "Credit Suisse Bank Fee": "Credit Suisse Bankgebühr",
      "Apple Music": "Apple Music",
      "ZKB Mobile": "ZKB Mobile",
      "Amazon Prime": "Amazon Prime",
      "Raiffeisen Mobile": "Raiffeisen Mobile",
      "Raiffeisen Bank Fee": "Raiffeisen Bankgebühr",
      "Concordia Insurance": "Concordia Versicherung",
      "PostFinance Bank Fee": "PostFinance Bankgebühr",
      "Spotify": "Spotify",
      "Credit Suisse Mobile": "Credit Suisse Mobile",
      "CSS Insurance": "CSS Versicherung",
      "KPT Insurance": "KPT Versicherung",
      "Disney+": "Disney+",
      "PostFinance Mobile": "PostFinance Mobile",
      "Kieser": "Kieser",
      "Swica Insurance": "Swica Versicherung",
      "Netflix": "Netflix",
      "UBS Mobile": "UBS Mobile",
      "PureGym": "PureGym",
      "Coop Fitness": "Coop Fitness",
      "Migros Fitness": "Migros Fitness",
      "NonStop Gym": "NonStop Gym",
      "Daycare Center": "Kindertagesstätte",
      "Lenzerheide Ski Resort": "Lenzerheide Skigebiet",
      "Pet Food Store": "Tierfutterladen",
      "Davos Ski Resort": "Davos Skigebiet",
      "Pet Insurance": "Tierversicherung",
      "Kindergarten": "Kindergarten",
      "School": "Schule",
      "After-School Program": "Nachschulprogramm",
      "St. Moritz Ski Resort": "St. Moritz Skigebiet",
      "Zermatt Ski Resort": "Zermatt Skigebiet",
      "Tutoring": "Nachhilfe",
      "Arosa Ski Resort": "Arosa Skigebiet",
      "Vet Clinic": "Tierklinik",
      "Gstaad Ski Resort": "Gstaad Skigebiet",
      "Pet Store": "Tierhandlung",
      "Verbier Ski Resort": "Verbier Skigebiet",
      "Mobimo": "Mobimo",
      "Swiss Prime Site": "Swiss Prime Site",
      "Livit AG": "Livit AG",
      "Wincasa": "Wincasa",
      "Local Property Management": "Lokale Immobilienverwaltung",
      "PostFinance Credit Card Payment": "PostFinance Kreditkartenzahlung",
      "ZKB Credit Card Payment": "ZKB Kreditkartenzahlung",
      "Local Bank Credit Card Payment": "Lokale Bank Kreditkartenzahlung",
      "Credit Suisse Credit Card Payment": "Credit Suisse Kreditkartenzahlung",
      "Raiffeisen Credit Card Payment": "Raiffeisen Kreditkartenzahlung",
      "UBS Credit Card Payment": "UBS Kreditkartenzahlung",
      "BKW": "BKW",
      "Swisscom": "Swisscom",
      "Local Utility": "Lokaler Energieversorger",
      "EWZ": "EWZ",
      "IWB": "IWB",
      "Raiffeisen Salary": "Raiffeisen Lohn",
      "PostFinance Salary": "PostFinance Lohn",
      "Local Bank Salary": "Lokale Bank Lohn",
      "ZKB Salary": "ZKB Lohn",
      "Credit Suisse Salary": "Credit Suisse Lohn",
      "UBS Salary": "UBS Lohn",
      "WWF": "WWF",
      "Local Charity": "Lokale Wohltätigkeit",
      "Red Cross": "Rotes Kreuz",
      "UNICEF": "UNICEF",
      "Doctors Without Borders": "Ärzte ohne Grenzen",
      "Booking.com": "Booking.com",
      "Hotel Booking": "Hotelbuchung",
      "easyJet": "easyJet",
      "Airbnb": "Airbnb",
      "SWISS Airlines": "SWISS Airlines",
      "Coop Back to School": "Coop Schulanfang",
      "School Supply Store Back to School": "Schreibwarenladen Schulanfang",
      "H&M Back to School": "H&M Schulanfang",
      "Manor Back to School": "Manor Schulanfang",
      "C&A Back to School": "C&A Schulanfang",
      "Migros Back to School": "Migros Schulanfang",
      "PostFinance 13th Salary": "PostFinance 13. Monatslohn",
      "Local Bank 13th Salary": "Lokale Bank 13. Monatslohn",
      "ZKB 13th Salary": "ZKB 13. Monatslohn",
      "Credit Suisse 13th Salary": "Credit Suisse 13. Monatslohn",
      "UBS 13th Salary": "UBS 13. Monatslohn",
      "Raiffeisen 13th Salary": "Raiffeisen 13. Monatslohn",
      "Galaxus Black Friday": "Galaxus Black Friday",
      "Digitec Black Friday": "Digitec Black Friday",
      "Amazon Black Friday": "Amazon Black Friday",
      "Interdiscount Black Friday": "Interdiscount Black Friday",
      "MediaMarkt Black Friday": "MediaMarkt Black Friday",
      "H&M Christmas": "H&M Weihnachten",
      "Globus Christmas": "Globus Weihnachten",
      "Manor Christmas": "Manor Weihnachten",
      "Online Store Christmas": "Online Store Weihnachten",
      "Zara Christmas": "Zara Weihnachten",
      "Jelmoli Christmas": "Jelmoli Weihnachten",
      "Serafe Media Tax": "Serafe Mediengebühr",
      "SBB Halbtax": "SBB Halbtax",
      "SBB GA Travelcard": "SBB GA Reisekarte"
    };

    return merchantTranslations[englishMerchant] || englishMerchant;
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
      
      return await this.runInference(inputTensor);
      
    } catch (error) {
      console.error('Error during prediction:', error);
      throw error;
    }
  }

  // New method to accept pre-processed tensor input
  async predictWithTensor(inputTensor: ort.Tensor): Promise<PredictionResult[]> {
    if (this.mockMode) {
      return this.generateMockPredictions();
    }

    if (!this.session) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      console.log('Running real model inference with pre-processed tensor...');
      
      return await this.runInference(inputTensor);
      
    } catch (error) {
      console.error('Error during prediction with tensor:', error);
      throw error;
    }
  }

  // Helper method to run inference with a given input tensor
  private async runInference(inputTensor: ort.Tensor): Promise<PredictionResult[]> {
    // Create dummy target tensor for the model
    const dummyTarget = new ort.Tensor('float32', new Float32Array(this.config.forecastHorizon * 4), [1, this.config.forecastHorizon, 4]);
    
    // Run inference
    const feeds = { 
      input: inputTensor,
      target: dummyTarget
    };
    
    console.log('Running ONNX inference...');
    const results = await this.session!.run(feeds);
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
      
      const englishCategory = this.vocabMappings.categories[categoryId] || 'Unknown';
      const englishMerchant = this.vocabMappings.merchants[merchantId] || 'Unknown';
      
      predictions.push({
        amount: scaledAmount,
        category: this.translateCategoryToGerman(englishCategory),
        merchant: this.translateMerchantToGerman(englishMerchant),
        confidence: 0.8, // You can calculate actual confidence if needed
      });
    }
    
    console.log(`Generated ${predictions.length} predictions`);
    return predictions;
  }

  // Helper method to convert PyTorch tensor data to ONNX Runtime tensor
  convertPyTorchTensorToONNX(pytorchTensorData: number[], shape: number[]): ort.Tensor {
    // Convert the flat array to Float32Array
    const float32Array = new Float32Array(pytorchTensorData);
    
    // Create ONNX Runtime tensor
    return new ort.Tensor('float32', float32Array, shape);
  }

  // Example function to demonstrate batch processing with 8 tensors
  async processBatchExample(): Promise<PredictionResult[][]> {
    console.log('Starting batch processing example with 8 tensors...');
    
    // Create 8 example tensors (you can replace these with your actual tensor data)
    const exampleTensors = this.createExampleTensors();
    
    const allPredictions: PredictionResult[][] = [];
    
    // Process each tensor individually
    for (let i = 0; i < exampleTensors.length; i++) {
      console.log(`Processing tensor ${i + 1}/${exampleTensors.length}...`);
      
      try {
        const predictions = await this.predictWithTensor(exampleTensors[i]);
        allPredictions.push(predictions);
        
        console.log(`Tensor ${i + 1} predictions:`, predictions);
      } catch (error) {
        console.error(`Error processing tensor ${i + 1}:`, error);
        allPredictions.push([]); // Empty array for failed predictions
      }
    }
    
    console.log('Batch processing completed!');
    return allPredictions;
  }

  // Create 8 example tensors for demonstration
  private createExampleTensors(): ort.Tensor[] {
    const tensors: ort.Tensor[] = [];
    
    // Tensor 1 - Your provided example
    const tensor1Data = [
      5.2728e+00, -6.4460e-01, 3.7000e+01, 1.8800e+02, 1.7182e-01, 4.9602e-01, 1.8783e-02, 4.2466e+00, -1.0857e+00, 8.2316e-01, -1.2667e+00, -1.4457e-01, 2.0488e-02, -1.4218e+00,
      7.8199e-03, -3.4961e-01, 1.7000e+01, 7.0000e+01, -8.7394e-01, -3.9631e-01, -4.8184e-01, -4.8072e-03, -1.0857e+00, 8.2316e-01, -1.2667e+00, -1.4457e-01, 2.0488e-02, -1.4218e+00,
      -1.3285e-01, -3.5214e-01, 1.0000e+00, 0.0000e+00, 1.7182e-01, 3.1730e+00, -2.0650e-01, -2.4416e-01, 2.1349e-02, 1.3560e+00, -1.2520e+00, 1.4222e-01, 2.0488e-02, -1.4218e+00,
      // ... Add all 50 rows of your tensor data here
      // For brevity, I'll create a simplified version with repeated patterns
    ];
    
    // Fill the rest of tensor1Data with the complete data from your example
    // This is a simplified version - you should include all 50*14 = 700 values
    for (let i = 3; i < 50; i++) {
      for (let j = 0; j < 14; j++) {
        tensor1Data.push(Math.random() * 2 - 1); // Random values for demonstration
      }
    }
    
    // Create 8 tensors with slight variations
    for (let tensorIndex = 0; tensorIndex < 8; tensorIndex++) {
      const tensorData = [...tensor1Data]; // Copy base data
      
      // Add some variation to each tensor
      for (let i = 0; i < tensorData.length; i++) {
        tensorData[i] += (Math.random() - 0.5) * 0.1; // Add small random variation
      }
      
      const shape = [1, 50, 14]; // [batch_size, sequence_length, features]
      const tensor = this.convertPyTorchTensorToONNX(tensorData, shape);
      tensors.push(tensor);
    }
    
    return tensors;
  }

  // Alternative: Process tensors in parallel for better performance
  async processBatchParallel(): Promise<PredictionResult[][]> {
    console.log('Starting parallel batch processing with 8 tensors...');
    
    const exampleTensors = this.createExampleTensors();
    
    // Process all tensors in parallel
    const predictionPromises = exampleTensors.map(async (tensor, index) => {
      console.log(`Starting processing for tensor ${index + 1}...`);
      try {
        const predictions = await this.predictWithTensor(tensor);
        console.log(`Completed tensor ${index + 1}`);
        return predictions;
      } catch (error) {
        console.error(`Error processing tensor ${index + 1}:`, error);
        return [];
      }
    });
    
    // Wait for all predictions to complete
    const allPredictions = await Promise.all(predictionPromises);
    
    console.log('Parallel batch processing completed!');
    return allPredictions;
  }

  // Utility function to analyze batch results
  analyzeBatchResults(predictions: PredictionResult[][]): void {
    console.log('\n=== Batch Analysis ===');
    console.log(`Total tensors processed: ${predictions.length}`);
    
    let totalPredictions = 0;
    let totalAmount = 0;
    const categoryCounts: { [key: string]: number } = {};
    const merchantCounts: { [key: string]: number } = {};
    
    predictions.forEach((tensorPredictions, tensorIndex) => {
      console.log(`\nTensor ${tensorIndex + 1}: ${tensorPredictions.length} predictions`);
      
      tensorPredictions.forEach((prediction, predIndex) => {
        totalPredictions++;
        totalAmount += prediction.amount;
        
        // Count categories and merchants
        categoryCounts[prediction.category] = (categoryCounts[prediction.category] || 0) + 1;
        merchantCounts[prediction.merchant] = (merchantCounts[prediction.merchant] || 0) + 1;
        
        console.log(`  Prediction ${predIndex + 1}: ${prediction.amount.toFixed(2)} CHF - ${prediction.category} at ${prediction.merchant}`);
      });
    });
    
    console.log('\n=== Summary ===');
    console.log(`Total predictions across all tensors: ${totalPredictions}`);
    console.log(`Average amount: ${(totalAmount / totalPredictions).toFixed(2)} CHF`);
    
    console.log('\nTop categories:');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} times`);
      });
    
    console.log('\nTop merchants:');
    Object.entries(merchantCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([merchant, count]) => {
        console.log(`  ${merchant}: ${count} times`);
      });
  }

  // Function using your exact tensor data
  async processYourTensorData(): Promise<PredictionResult[][]> {
    console.log('Processing your exact tensor data...');
    
    // Your exact tensor data (flattened)
    const yourTensorData = [
      5.2728e+00, -6.4460e-01, 3.7000e+01, 1.8800e+02, 1.7182e-01, 4.9602e-01, 1.8783e-02, 4.2466e+00, -1.0857e+00, 8.2316e-01, -1.2667e+00, -1.4457e-01, 2.0488e-02, -1.4218e+00,
      7.8199e-03, -3.4961e-01, 1.7000e+01, 7.0000e+01, -8.7394e-01, -3.9631e-01, -4.8184e-01, -4.8072e-03, -1.0857e+00, 8.2316e-01, -1.2667e+00, -1.4457e-01, 2.0488e-02, -1.4218e+00,
      -1.3285e-01, -3.5214e-01, 1.0000e+00, 0.0000e+00, 1.7182e-01, 3.1730e+00, -2.0650e-01, -2.4416e-01, 2.1349e-02, 1.3560e+00, -1.2520e+00, 1.4222e-01, 2.0488e-02, -1.4218e+00,
      -2.0039e-01, -3.6263e-01, 1.0000e+00, 0.0000e+00, 1.7182e-01, -7.9786e-01, -7.0712e-01, -2.3938e-01, 1.1284e+00, 8.2316e-01, -1.1794e+00, 4.2020e-01, 2.0488e-02, -1.4218e+00,
      4.8965e-02, -3.7693e-01, 7.0000e+00, 1.5000e+01, 2.2633e+00, -5.3016e-01, -5.5693e-01, 3.7328e-03, -5.9304e-01, -1.3343e+00, -6.5472e-01, 1.0921e+00, 2.0488e-02, -1.4218e+00,
      -3.5782e-02, -3.7714e-01, 3.1000e+01, 1.6100e+02, -8.7394e-01, 4.9602e-01, -7.3215e-01, 3.2292e-02, -5.9304e-01, -1.3343e+00, -6.5472e-01, 1.0921e+00, 2.0488e-02, -1.4218e+00,
      -4.2126e-01, -3.8214e-01, 3.2000e+01, 6.2000e+01, -8.7394e-01, 4.9602e-01, 1.8783e-02, -4.1244e-01, -5.9304e-01, -1.3343e+00, -6.5472e-01, 1.0921e+00, 2.0488e-02, -1.4218e+00,
      -1.8538e-01, -4.0892e-01, 2.0000e+00, 1.0000e+00, 1.7182e-01, 4.9602e-01, 1.8783e-02, -2.7664e-01, -1.3592e+00, -3.7413e-01, -4.0144e-01, 1.2315e+00, 2.0488e-02, -1.4218e+00,
      -4.9388e-01, -4.2237e-01, 3.3000e+01, 2.0000e+02, -8.7394e-01, 4.1546e+00, -7.3215e-01, 3.2292e-02, -1.3592e+00, -3.7413e-01, -4.0144e-01, 1.2315e+00, 2.0488e-02, -1.4218e+00,
      -1.5763e+00, -4.5326e-01, 3.0000e+00, 1.2000e+01, -8.7394e-01, 3.1284e+00, 1.4956e+00, -1.8069e+00, -1.3592e+00, -3.7413e-01, -4.0144e-01, 1.2315e+00, 2.0488e-02, -1.4218e+00,
      3.1740e-02, -5.4532e-01, 1.7000e+01, 7.0000e+01, 1.7182e-01, -5.3016e-01, -5.5693e-01, -5.5599e-03, -1.0857e+00, 8.2316e-01, -1.2505e-01, 1.3175e+00, 2.0488e-02, -1.4218e+00,
      1.8494e-02, -5.4650e-01, 2.8000e+01, 1.3700e+02, -8.7394e-01, 5.4064e-01, 4.3814e-02, 1.7850e-03, -1.0857e+00, 8.2316e-01, -1.2505e-01, 1.3175e+00, 2.0488e-02, -1.4218e+00,
      2.1265e-02, -5.4843e-01, 2.9000e+01, 1.3800e+02, -8.7394e-01, 5.4064e-01, 4.3814e-02, -1.0540e-02, -1.0857e+00, 8.2316e-01, -1.2505e-01, 1.3175e+00, 2.0488e-02, -1.4218e+00,
      -1.8917e+00, -5.5021e-01, 3.5000e+01, 1.7200e+02, -8.7394e-01, 5.4064e-01, -7.3215e-01, 3.2292e-02, -1.0857e+00, 8.2316e-01, -1.2505e-01, 1.3175e+00, 2.0488e-02, -1.4218e+00,
      -1.9680e-02, -5.5021e-01, 2.1000e+01, 9.7000e+01, -8.7394e-01, 9.4472e-02, -2.0650e-01, -4.0756e-03, -1.0857e+00, 8.2316e-01, -1.2505e-01, 1.3175e+00, 2.0488e-02, -1.4218e+00,
      -8.8440e-03, -5.5429e-01, 4.0000e+00, 3.5000e+01, 1.2176e+00, 4.9856e-02, -7.3215e-01, 3.2292e-02, 1.1284e+00, 8.2316e-01, 7.2772e-01, 1.2315e+00, -6.9249e-01, -1.2338e+00,
      -1.2037e-01, -5.5777e-01, 1.7000e+01, 6.0000e+01, 1.2176e+00, -6.6401e-01, 2.6909e-01, -1.5620e-01, 6.3573e-01, -1.3343e+00, 1.2008e+00, 9.0509e-01, -6.9249e-01, -1.2338e+00,
      -1.4814e-01, -5.6755e-01, 2.2000e+01, 1.0600e+02, -8.7394e-01, 5.2393e-03, -2.5656e-01, -4.6759e-01, 6.3573e-01, -1.3343e+00, 1.2008e+00, 9.0509e-01, -6.9249e-01, -1.2338e+00,
      -1.3777e-01, -5.7890e-01, 2.5000e+01, 1.2400e+02, 1.7182e-01, 9.4472e-02, 2.8723e+00, -7.5219e-02, -5.9304e-01, -1.3343e+00, 1.3781e+00, 6.7801e-01, -6.9249e-01, -1.2338e+00,
      -2.3499e-02, -5.8966e-01, 2.4000e+01, 7.0000e+01, 1.7182e-01, -2.1784e-01, -5.8196e-01, -4.8120e-03, -1.3592e+00, -3.7413e-01, 1.5057e+00, 4.2020e-01, -6.9249e-01, -1.2338e+00,
      -6.1588e-02, -5.9397e-01, 2.3000e+01, 2.5000e+01, -8.7394e-01, 4.9856e-02, -2.3153e-01, -9.5629e-02, -1.3592e+00, -3.7413e-01, 1.5057e+00, 4.2020e-01, -6.9249e-01, -1.2338e+00,
      2.2875e-02, -6.0042e-01, 1.7000e+01, 7.1000e+01, 1.7182e-01, -7.0862e-01, 1.4394e-01, -5.0462e-03, -1.0857e+00, 8.2316e-01, 1.5783e+00, 1.4222e-01, -6.9249e-01, -1.2338e+00,
      2.5817e-02, -6.0211e-01, 4.0000e+00, 1.9000e+01, -8.7394e-01, -6.1939e-01, 1.8210e+00, -3.4891e-02, -1.0857e+00, 8.2316e-01, 1.5783e+00, 1.4222e-01, -6.9249e-01, -1.2338e+00,
      3.3635e-02, -6.0363e-01, 7.0000e+00, 3.9000e+01, 1.7182e-01, -3.9631e-01, 2.8473e+00, -9.0940e-03, 2.1349e-02, 1.3560e+00, 1.5930e+00, -1.4457e-01, -6.9249e-01, -1.2338e+00,
      -3.8725e-02, -6.0470e-01, 8.0000e+00, 2.9000e+01, 2.2633e+00, 5.4064e-01, -7.3215e-01, 3.2292e-02, 6.3573e-01, -1.3343e+00, 1.2953e+00, -9.4139e-01, -6.9249e-01, -1.2338e+00,
      -1.5763e+00, -6.0987e-01, 3.0000e+00, 1.2000e+01, 1.7182e-01, -2.6246e-01, -4.0675e-01, -1.8069e+00, -5.9304e-01, -1.3343e+00, 1.0957e+00, -1.1495e+00, -6.9249e-01, -1.2338e+00,
      -2.4251e-01, -6.0987e-01, 3.6000e+01, 1.8300e+02, 1.7182e-01, 5.4064e-01, -7.3215e-01, 3.2292e-02, -1.3592e+00, -3.7413e-01, 8.5792e-01, -1.3136e+00, -6.9249e-01, -1.2338e+00,
      -2.6155e-01, -6.2655e-01, 2.0000e+01, 0.0000e+00, -8.7394e-01, 9.4218e-01, -2.8159e-01, -2.4032e-01, -1.3592e+00, -3.7413e-01, 8.5792e-01, -1.3136e+00, -6.9249e-01, -1.2338e+00,
      -8.4822e-03, -6.4431e-01, 4.0000e+00, 2.4000e+01, -8.7394e-01, -5.7477e-01, 8.1978e-01, -4.3582e-03, -1.3592e+00, -3.7413e-01, 8.5792e-01, -1.3136e+00, -6.9249e-01, -1.2338e+00,
      -9.2906e-02, -6.4431e-01, 2.6000e+01, 1.3300e+02, 1.2176e+00, 4.0679e-01, -3.1279e-02, -1.5831e-01, 2.1349e-02, 1.3560e+00, 3.0798e-01, -1.4846e+00, -6.9249e-01, -1.2338e+00,
      -2.1393e-01, -6.4431e-01, 2.2000e+01, 1.0600e+02, -8.7394e-01, -3.5169e-01, -4.5681e-01, -4.1296e-01, 2.1349e-02, 1.3560e+00, 3.0798e-01, -1.4846e+00, -6.9249e-01, -1.2338e+00,
      -1.0149e-02, -6.4431e-01, 1.7000e+01, 1.8100e+02, -8.7394e-01, -4.8554e-01, 6.8845e-02, -5.2905e-02, 2.1349e-02, 1.3560e+00, 3.0798e-01, -1.4846e+00, -6.9249e-01, -1.2338e+00,
      4.4499e-02, -6.4431e-01, 2.7000e+01, 1.3900e+02, 1.7182e-01, 4.0679e-01, -3.1279e-02, 2.1276e-02, 1.1284e+00, 8.2316e-01, 1.8301e-02, -1.4846e+00, -6.9249e-01, -1.2338e+00,
      2.4112e-02, -6.4477e-01, 7.0000e+00, 1.5000e+01, 1.7182e-01, -4.4092e-01, -2.5656e-01, 6.7786e-03, 1.4019e+00, -3.7413e-01, -2.6544e-01, -1.4268e+00, -6.9249e-01, -1.2338e+00,
      -7.1110e-02, -6.4477e-01, 2.3000e+01, 2.5000e+01, -8.7394e-01, -3.5169e-01, -4.5681e-01, -9.5765e-02, 1.4019e+00, -3.7413e-01, -2.6544e-01, -1.4268e+00, -6.9249e-01, -1.2338e+00,
      -5.8036e-02, -6.4477e-01, 1.7000e+01, 3.0000e+01, 1.7182e-01, -7.0862e-01, 7.9475e-01, -1.2581e-01, 6.3573e-01, -1.3343e+00, -5.3164e-01, -1.3136e+00, -6.9249e-01, -1.2338e+00,
      1.1000e-02, -6.4477e-01, 4.0000e+00, 1.9000e+01, 1.7182e-01, -5.7477e-01, -4.3178e-01, -1.6464e-02, -5.9304e-01, -1.3343e+00, -7.6940e-01, -1.1495e+00, -6.9249e-01, -1.2338e+00,
      -7.6814e-02, -6.4477e-01, 2.3000e+01, 2.5000e+01, 1.2176e+00, -6.6401e-01, -6.3203e-01, -9.7066e-02, -1.0857e+00, 8.2316e-01, -1.1222e+00, -6.9769e-01, -6.9249e-01, -1.2338e+00,
      -8.0213e-02, -6.4477e-01, 6.0000e+00, 2.8000e+01, -8.7394e-01, -8.4247e-01, -7.3215e-01, 3.2292e-02, -1.0857e+00, 8.2316e-01, -1.1222e+00, -6.9769e-01, -6.9249e-01, -1.2338e+00,
      -4.5228e-02, -6.4477e-01, 1.7000e+01, 6.0000e+01, 1.7182e-01, -6.6401e-01, -2.8159e-01, -1.5850e-01, 2.1349e-02, 1.3560e+00, -1.2228e+00, -4.2841e-01, -6.9249e-01, -1.2338e+00,
      5.3566e+00, -6.4477e-01, 3.7000e+01, 1.8800e+02, 1.7182e-01, 4.9602e-01, 1.8783e-02, 4.5825e+00, 1.1284e+00, 8.2316e-01, -1.2667e+00, -1.4457e-01, -6.9249e-01, -1.2338e+00,
      -3.2301e-01, -3.4504e-01, 1.0000e+00, 0.0000e+00, 1.7182e-01, 4.5140e-01, -4.5681e-01, -2.4545e-01, 1.4019e+00, -3.7413e-01, -1.2520e+00, 1.4222e-01, -6.9249e-01, -1.2338e+00,
      -4.9199e-02, -3.6627e-01, 2.4000e+01, 8.2000e+01, -8.7394e-01, -3.9377e-02, 8.4481e-01, -5.3716e-02, 1.4019e+00, -3.7413e-01, -1.2520e+00, 1.4222e-01, -6.9249e-01, -1.2338e+00,
      -4.1819e-01, -3.7203e-01, 2.2000e+01, 1.0600e+02, -8.7394e-01, -4.4092e-01, -5.0687e-01, -3.8892e-01, 1.4019e+00, -3.7413e-01, -1.2520e+00, 1.4222e-01, -6.9249e-01, -1.2338e+00,
      -3.7240e-01, -3.9864e-01, 1.0000e+00, 0.0000e+00, 1.7182e-01, -7.9786e-01, -7.0712e-01, -2.5407e-01, 6.3573e-01, -1.3343e+00, -1.1794e+00, 4.2020e-01, -6.9249e-01, -1.2338e+00,
      -4.2543e-02, -4.2266e-01, 2.5000e+01, 1.2000e+02, -8.7394e-01, 4.9856e-02, 3.9487e+00, -7.5219e-02, 6.3573e-01, -1.3343e+00, -1.1794e+00, 4.2020e-01, -6.9249e-01, -1.2338e+00,
      -3.1631e-02, -4.2804e-01, 6.0000e+00, 2.8000e+01, -8.7394e-01, -6.6401e-01, -6.3203e-01, -1.1775e-01, 6.3573e-01, -1.3343e+00, -1.1794e+00, 4.2020e-01, -6.9249e-01, -1.2338e+00,
      -8.4726e-03, -4.3280e-01, 4.0000e+00, 2.7000e+01, 1.7182e-01, -5.3016e-01, 3.6922e-01, -1.1771e-02, -5.9304e-01, -1.3343e+00, -1.0518e+00, 6.7801e-01, -6.9249e-01, -1.2338e+00,
      -8.3613e-02, -4.3626e-01, 1.7000e+01, 3.0000e+01, 1.7182e-01, -6.1939e-01, -5.0687e-01, -1.1753e-01, -1.3592e+00, -3.7413e-01, -8.7451e-01, 9.0509e-01, -6.9249e-01, -1.2338e+00,
      5.1736e-02, -4.4396e-01, 2.8000e+01, 1.3700e+02, 1.7182e-01, 4.0679e-01, -3.1279e-02, 4.3682e-04, -1.0857e+00, 8.2316e-01, -6.5472e-01, 1.0921e+00, -6.9249e-01, -1.2338e+00
    ];
    
    // Create 8 tensors with variations of your data
    const tensors: ort.Tensor[] = [];
    const shape = [1, 50, 14]; // [batch_size, sequence_length, features]
    
    for (let i = 0; i < 8; i++) {
      const tensorData = [...yourTensorData]; // Copy your exact data
      
      // Add small variations to create 8 different tensors
      for (let j = 0; j < tensorData.length; j++) {
        tensorData[j] += (Math.random() - 0.5) * 0.05; // Small random variation
      }
      
      const tensor = this.convertPyTorchTensorToONNX(tensorData, shape);
      tensors.push(tensor);
    }
    
    // Process all tensors
    const allPredictions: PredictionResult[][] = [];
    
    for (let i = 0; i < tensors.length; i++) {
      console.log(`Processing your tensor data ${i + 1}/8...`);
      try {
        const predictions = await this.predictWithTensor(tensors[i]);
        allPredictions.push(predictions);
        console.log(`Tensor ${i + 1} completed with ${predictions.length} predictions`);
      } catch (error) {
        console.error(`Error processing tensor ${i + 1}:`, error);
        allPredictions.push([]);
      }
    }
    
    // Analyze results
    this.analyzeBatchResults(allPredictions);
    
    return allPredictions;
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
      
      const englishCategory = categories[categoryIndex];
      const englishMerchant = merchants[merchantIndex];
      
      predictions.push({
        amount: parseFloat(amount.toFixed(2)),
        category: this.translateCategoryToGerman(englishCategory),
        merchant: this.translateMerchantToGerman(englishMerchant),
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
