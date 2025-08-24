"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingCart, TrendingUp, Target, Brain } from 'lucide-react'

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

interface PredictionResponse {
  success: boolean
  data?: PurchasePrediction
  error?: string
  fallbackPrediction?: PurchasePrediction
  metadata?: {
    userId: string
    modelType: string
    useMockModel: boolean
    predictionCount: number
    timestamp: string
  }
}

export default function TestPredictionsPage() {
  const [prediction, setPrediction] = useState<PurchasePrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)

  const runPrediction = async (modelType: 'small' | 'large' = 'small', useMockModel: boolean = true) => {
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      console.log('🔮 Running purchase prediction...')
      
      const response = await fetch('/api/predict-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelType,
          useMockModel,
          userId: 'test-user-123'
        })
      })

      const result: PredictionResponse = await response.json()
      console.log('📊 Prediction result:', result)

      if (result.success && result.data) {
        setPrediction(result.data)
        setMetadata(result.metadata)
      } else if (result.fallbackPrediction) {
        setPrediction(result.fallbackPrediction)
        setError('Model failed, using fallback prediction')
      } else {
        setError(result.error || 'Unknown error occurred')
      }
    } catch (err) {
      console.error('❌ Error running prediction:', err)
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `CHF ${amount.toFixed(2)}`
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Purchase Prediction Test</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Test the AI model's ability to predict your next most likely purchase based on transaction history and spending patterns.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Model Controls
            </CardTitle>
            <CardDescription>
              Run predictions using different model configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => runPrediction('small', true)}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                Small Model (Mock)
              </Button>
              
              <Button
                onClick={() => runPrediction('large', true)}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Large Model (Mock)
              </Button>
              
              <Button
                onClick={() => runPrediction('small', false)}
                disabled={loading}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                Real Model (Small)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {metadata && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Prediction Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Model Type:</span> {metadata.modelType}
                </div>
                <div>
                  <span className="font-medium">Mock Mode:</span> {metadata.useMockModel ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Predictions:</span> {metadata.predictionCount}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {metadata.userId}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Likely Purchase */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <ShoppingCart className="h-5 w-5" />
                  Most Likely Next Purchase
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Highest probability prediction based on your spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-900">
                    {prediction.mostLikelyPurchase.merchant}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {prediction.mostLikelyPurchase.category}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-blue-900">Amount</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(prediction.mostLikelyPurchase.amount)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-blue-900">Confidence</div>
                    <Badge className={getConfidenceColor(prediction.mostLikelyPurchase.confidence)}>
                      {(prediction.mostLikelyPurchase.confidence * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-medium text-blue-900">Probability Score</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(prediction.mostLikelyPurchase.probability * 100).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Spending Insights
                </CardTitle>
                <CardDescription>
                  Analysis of your predicted spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Predicted Spending:</span>
                    <span className="font-medium">{formatCurrency(prediction.insights.totalPredictedSpending)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Average Transaction:</span>
                    <span className="font-medium">{formatCurrency(prediction.insights.averageTransactionAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Most Frequent Category:</span>
                    <Badge variant="outline">{prediction.insights.mostFrequentCategory}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Most Frequent Merchant:</span>
                    <Badge variant="outline">{prediction.insights.mostFrequentMerchant}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Spending Pattern:</span>
                    <span className="font-medium text-blue-600">{prediction.insights.spendingPattern}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Predictions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top 5 Predictions</CardTitle>
                <CardDescription>
                  All predicted purchases ranked by likelihood and frequency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prediction.topPredictions.map((pred, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{pred.merchant}</div>
                          <div className="text-sm text-slate-500">{pred.category}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(pred.amount)}</div>
                          <div className="text-slate-500">Freq: {pred.frequency}</div>
                        </div>
                        <Badge className={getConfidenceColor(pred.confidence)}>
                          {(pred.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!prediction && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-slate-600">
                1. <strong>Small Model (Mock):</strong> Fast prediction using mock data - good for testing
              </p>
              <p className="text-slate-600">
                2. <strong>Large Model (Mock):</strong> More complex mock predictions with higher accuracy simulation
              </p>
              <p className="text-slate-600">
                3. <strong>Real Model:</strong> Uses actual ONNX model files (requires model files to be present)
              </p>
              <p className="text-slate-600 text-sm mt-4">
                The API analyzes your transaction history and uses machine learning to predict your most likely next purchase,
                including the merchant, category, amount, and confidence level.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
