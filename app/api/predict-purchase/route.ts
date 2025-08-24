import { NextRequest, NextResponse } from 'next/server'
import { createFinOModel, createMockFinOModel, type TransactionData, type PredictionResult } from '@/lib/model-inference'
import { firebaseDataService } from '@/lib/firebase-data-service'

// Interface for the API response
interface PurchasePrediction {
  mostLikelyPurchase: {
    merchant: string
    category: string
    amount: number
    confidence: number
    probability: number
  }
  topPredictions: Array<{
    merchant: string
    category: string
    amount: number
    confidence: number
    frequency: number
  }>
  insights: {
    totalPredictedSpending: number
    averageTransactionAmount: number
    mostFrequentCategory: string
    mostFrequentMerchant: string
    spendingPattern: string
  }
}

// Interface for request body
interface PredictPurchaseRequest {
  userId?: string
  modelType?: 'small' | 'large'
  useMockModel?: boolean
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Starting purchase prediction...')
    
    const body: PredictPurchaseRequest = await request.json()
    const { userId = 'test-user-123', modelType = 'small', useMockModel = true } = body

    // Initialize the model
    let model
    if (useMockModel) {
      console.log('📊 Using mock model for predictions')
      model = createMockFinOModel(modelType)
    } else {
      console.log('🤖 Using real model for predictions')
      model = createFinOModel(modelType)
    }

    // Load the model
    await model.loadModel()
    console.log('✅ Model loaded successfully')

    // Get user transaction history from Firebase
    console.log('📈 Fetching user transaction data...')
    const dashboardData = await firebaseDataService.getDashboardData()
    
    // Convert Firebase data to model format
    const transactionData = convertToModelFormat(dashboardData.recentTransactions)
    console.log(`📊 Converted ${transactionData.length} transactions for model input`)

    // Generate predictions
    console.log('🔮 Generating predictions...')
    const predictions = await model.predict(transactionData)
    console.log(`✅ Generated ${predictions.length} predictions`)

    // Analyze predictions to find most likely purchase
    const analysis = analyzePredictions(predictions)
    
    // Clean up model resources
    await model.dispose()
    console.log('🧹 Model resources disposed')

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        userId,
        modelType,
        useMockModel,
        predictionCount: predictions.length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error in purchase prediction:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fallbackPrediction: generateFallbackPrediction()
    }, { status: 500 })
  }
}

// Convert Firebase transaction data to model format
function convertToModelFormat(transactions: any[]): TransactionData[] {
  if (!transactions || transactions.length === 0) {
    // Return mock transaction data if no real data available
    return generateMockTransactionData()
  }

  return transactions.slice(0, 50).map((transaction, index) => {
    const date = new Date(transaction.date)
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    const monthOfYear = date.getMonth()

    return {
      amount: Math.abs(transaction.amount),
      balance_before: 5000 + Math.random() * 10000, // Mock balance
      category_id: getCategoryId(transaction.category),
      merchant_id: getMerchantId(transaction.description),
      time_delta: index * 24 * 60 * 60, // Time since last transaction in seconds
      time_delta_category: index * 24 * 60 * 60,
      time_delta_merchant: index * 24 * 60 * 60,
      avg_amount_merchant: Math.abs(transaction.amount),
      day_of_week_sin: Math.sin(2 * Math.PI * dayOfWeek / 7),
      day_of_week_cos: Math.cos(2 * Math.PI * dayOfWeek / 7),
      day_of_month_sin: Math.sin(2 * Math.PI * dayOfMonth / 31),
      day_of_month_cos: Math.cos(2 * Math.PI * dayOfMonth / 31),
      month_of_year_sin: Math.sin(2 * Math.PI * monthOfYear / 12),
      month_of_year_cos: Math.cos(2 * Math.PI * monthOfYear / 12),
    }
  })
}

// Generate mock transaction data when no real data is available
function generateMockTransactionData(): TransactionData[] {
  const mockData: TransactionData[] = []
  
  for (let i = 0; i < 50; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    const monthOfYear = date.getMonth()

    mockData.push({
      amount: Math.random() * 200 + 10,
      balance_before: 5000 + Math.random() * 10000,
      category_id: Math.floor(Math.random() * 41),
      merchant_id: Math.floor(Math.random() * 230),
      time_delta: i * 24 * 60 * 60,
      time_delta_category: i * 24 * 60 * 60,
      time_delta_merchant: i * 24 * 60 * 60,
      avg_amount_merchant: Math.random() * 100 + 20,
      day_of_week_sin: Math.sin(2 * Math.PI * dayOfWeek / 7),
      day_of_week_cos: Math.cos(2 * Math.PI * dayOfWeek / 7),
      day_of_month_sin: Math.sin(2 * Math.PI * dayOfMonth / 31),
      day_of_month_cos: Math.cos(2 * Math.PI * dayOfMonth / 31),
      month_of_year_sin: Math.sin(2 * Math.PI * monthOfYear / 12),
      month_of_year_cos: Math.cos(2 * Math.PI * monthOfYear / 12),
    })
  }
  
  return mockData
}

// Analyze predictions to find the most likely purchase
function analyzePredictions(predictions: PredictionResult[]): PurchasePrediction {
  if (predictions.length === 0) {
    return generateFallbackPrediction()
  }

  // Count frequency of merchants and categories
  const merchantFreq = new Map<string, number>()
  const categoryFreq = new Map<string, number>()
  const merchantAmounts = new Map<string, number[]>()
  const categoryAmounts = new Map<string, number[]>()

  predictions.forEach(pred => {
    // Count merchant frequency
    merchantFreq.set(pred.merchant, (merchantFreq.get(pred.merchant) || 0) + 1)
    
    // Count category frequency
    categoryFreq.set(pred.category, (categoryFreq.get(pred.category) || 0) + 1)
    
    // Track amounts per merchant
    if (!merchantAmounts.has(pred.merchant)) {
      merchantAmounts.set(pred.merchant, [])
    }
    merchantAmounts.get(pred.merchant)!.push(Math.abs(pred.amount))
    
    // Track amounts per category
    if (!categoryAmounts.has(pred.category)) {
      categoryAmounts.set(pred.category, [])
    }
    categoryAmounts.get(pred.category)!.push(Math.abs(pred.amount))
  })

  // Find most frequent merchant and category
  const mostFrequentMerchant = Array.from(merchantFreq.entries())
    .sort((a, b) => b[1] - a[1])[0]
  
  const mostFrequentCategory = Array.from(categoryFreq.entries())
    .sort((a, b) => b[1] - a[1])[0]

  // Find the most likely purchase (highest confidence + frequency combination)
  const scoredPredictions = predictions.map(pred => {
    const merchantFrequency = merchantFreq.get(pred.merchant) || 1
    const categoryFrequency = categoryFreq.get(pred.category) || 1
    const frequencyScore = (merchantFrequency + categoryFrequency) / 2
    const combinedScore = pred.confidence * 0.7 + (frequencyScore / predictions.length) * 0.3
    
    return {
      ...pred,
      frequency: merchantFrequency,
      combinedScore
    }
  }).sort((a, b) => b.combinedScore - a.combinedScore)

  const mostLikelyPurchase = scoredPredictions[0]

  // Create top predictions summary
  const topPredictions = scoredPredictions.slice(0, 5).map(pred => ({
    merchant: pred.merchant,
    category: pred.category,
    amount: Math.abs(pred.amount),
    confidence: pred.confidence,
    frequency: pred.frequency
  }))

  // Calculate insights
  const totalPredictedSpending = predictions
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + Math.abs(p.amount), 0)
  
  const averageTransactionAmount = totalPredictedSpending / predictions.filter(p => p.amount < 0).length || 0

  // Determine spending pattern
  const expenseCount = predictions.filter(p => p.amount < 0).length
  const incomeCount = predictions.filter(p => p.amount > 0).length
  const spendingPattern = expenseCount > incomeCount * 2 ? 'High spending period' : 
                         incomeCount > expenseCount ? 'Income-heavy period' : 'Balanced period'

  return {
    mostLikelyPurchase: {
      merchant: mostLikelyPurchase.merchant,
      category: mostLikelyPurchase.category,
      amount: Math.abs(mostLikelyPurchase.amount),
      confidence: mostLikelyPurchase.confidence,
      probability: mostLikelyPurchase.combinedScore
    },
    topPredictions,
    insights: {
      totalPredictedSpending: Math.round(totalPredictedSpending * 100) / 100,
      averageTransactionAmount: Math.round(averageTransactionAmount * 100) / 100,
      mostFrequentCategory: mostFrequentCategory[0],
      mostFrequentMerchant: mostFrequentMerchant[0],
      spendingPattern
    }
  }
}

// Generate fallback prediction when model fails
function generateFallbackPrediction(): PurchasePrediction {
  const swissMerchants = ['Migros', 'Coop', 'Denner', 'Starbucks', 'McDonald\'s', 'SBB', 'Swisscom']
  const swissCategories = ['Lebensmittel', 'Transport', 'Restaurants', 'Shopping', 'Unterhaltung']
  
  const randomMerchant = swissMerchants[Math.floor(Math.random() * swissMerchants.length)]
  const randomCategory = swissCategories[Math.floor(Math.random() * swissCategories.length)]
  const randomAmount = Math.random() * 100 + 20

  return {
    mostLikelyPurchase: {
      merchant: randomMerchant,
      category: randomCategory,
      amount: Math.round(randomAmount * 100) / 100,
      confidence: 0.6,
      probability: 0.7
    },
    topPredictions: [
      {
        merchant: randomMerchant,
        category: randomCategory,
        amount: Math.round(randomAmount * 100) / 100,
        confidence: 0.6,
        frequency: 3
      }
    ],
    insights: {
      totalPredictedSpending: 450.00,
      averageTransactionAmount: 75.00,
      mostFrequentCategory: randomCategory,
      mostFrequentMerchant: randomMerchant,
      spendingPattern: 'Moderate spending period'
    }
  }
}

// Helper function to map category names to IDs
function getCategoryId(category: string): number {
  const categoryMap: Record<string, number> = {
    'Lebensmittel': 0,
    'Transport': 1,
    'Restaurants': 2,
    'Shopping': 3,
    'Unterhaltung': 4,
    'Gesundheit': 5,
    'Bildung': 6,
    'Nebenkosten': 7,
    'Sonstiges': 8
  }
  
  return categoryMap[category] || Math.floor(Math.random() * 41)
}

// Helper function to map merchant names to IDs
function getMerchantId(merchant: string): number {
  const merchantMap: Record<string, number> = {
    'Migros': 0,
    'Coop': 1,
    'Denner': 2,
    'Starbucks': 3,
    'McDonald\'s': 4,
    'SBB': 5,
    'Swisscom': 6,
    'UPC': 7,
    'Netflix': 8,
    'Spotify': 9
  }
  
  return merchantMap[merchant] || Math.floor(Math.random() * 230)
}

// GET endpoint for simple predictions without request body
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const modelType = searchParams.get('modelType') as 'small' | 'large' || 'small'
  const useMockModel = searchParams.get('useMockModel') !== 'false'
  
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ modelType, useMockModel })
  }))
}
