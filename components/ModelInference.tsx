'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createFinOModel, createMockFinOModel, TransactionData, PredictionResult } from '@/lib/model-inference';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, TrendingUp, DollarSign, ShoppingCart, Building2, AlertCircle } from 'lucide-react';

interface ModelInferenceProps {
  modelType?: 'small' | 'large';
  onPredictionComplete?: (predictions: PredictionResult[]) => void;
  useMockMode?: boolean;
}

export default function ModelInference({ 
  modelType = 'small', 
  onPredictionComplete,
  useMockMode = true // Default to mock mode for testing
}: ModelInferenceProps) {
  const [selectedModelType, setSelectedModelType] = useState<'small' | 'large'>(modelType);
  const [model, setModel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sampleTransactions, setSampleTransactions] = useState<TransactionData[]>([]);
  const [isMockMode, setIsMockMode] = useState(useMockMode);

  // Load model when selected model type changes
  useEffect(() => {
    loadModel();
    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, [selectedModelType, useMockMode]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPredictions([]); // Clear previous predictions
      
      const finOModel = useMockMode ? 
        createMockFinOModel(selectedModelType) : 
        createFinOModel(selectedModelType);
      
      await finOModel.loadModel();
      
      setModel(finOModel);
      setIsModelLoaded(true);
      setIsMockMode(useMockMode);
      
      generateSampleTransactions();
      
    } catch (err) {
      setError(`Failed to load model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (newModelType: 'small' | 'large') => {
    setSelectedModelType(newModelType);
  };

  const generateSampleTransactions = () => {
    const sampleData: TransactionData[] = [];
    const now = new Date();
    
    for (let i = 49; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay();
      const dayOfMonth = date.getDate();
      const month = date.getMonth() + 1;
      
      sampleData.push({
        amount: Math.random() > 0.7 ? Math.random() * 1000 : -Math.random() * 200,
        balance_before: 5000 + Math.random() * 10000,
        category_id: Math.floor(Math.random() * 41), // Fixed: 41 categories (0-40)
        merchant_id: Math.floor(Math.random() * 230), // Fixed: 230 merchants (0-229)
        time_delta: Math.random() * 3,
        time_delta_category: Math.random() * 5,
        time_delta_merchant: Math.random() * 7,
        avg_amount_merchant: Math.random() * 500,
        day_of_week_sin: Math.sin(2 * Math.PI * dayOfWeek / 7),
        day_of_week_cos: Math.cos(2 * Math.PI * dayOfWeek / 7),
        day_of_month_sin: Math.sin(2 * Math.PI * dayOfMonth / 31),
        day_of_month_cos: Math.cos(2 * Math.PI * dayOfMonth / 31),
        month_of_year_sin: Math.sin(2 * Math.PI * month / 12),
        month_of_year_cos: Math.cos(2 * Math.PI * month / 12),
      });
    }
    
    setSampleTransactions(sampleData);
  };

  const runPrediction = useCallback(async () => {
    if (!model || !isModelLoaded) {
      setError('Model not loaded');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const results = await model.predict(sampleTransactions);
      setPredictions(results);
      
      if (onPredictionComplete) {
        onPredictionComplete(results);
      }
      
    } catch (err) {
      setError(`Prediction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [model, isModelLoaded, sampleTransactions, onPredictionComplete]);

  const regenerateSampleData = () => {
    console.log('Regenerating sample data...');
    generateSampleTransactions();
    // Clear previous predictions when new data is generated
    setPredictions([]);
  };

  return (
    <div className="space-y-6">
      {/* Mock Mode Warning */}
      {isMockMode && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Running in Mock Mode - Using simulated predictions for testing
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fin-O {selectedModelType.toUpperCase()} Model {isMockMode && '(Mock)'}
          </CardTitle>
          <CardDescription>
            Financial transaction prediction using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Model Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Model:
            </label>
            <div className="flex gap-2">
              <Button
                variant={selectedModelType === 'small' ? 'default' : 'outline'}
                onClick={() => handleModelChange('small')}
                disabled={isLoading}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Fin-O Small
                </div>
              </Button>
              <Button
                variant={selectedModelType === 'large' ? 'default' : 'outline'}
                onClick={() => handleModelChange('large')}
                disabled={isLoading}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Fin-O Large
                </div>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isModelLoaded ? (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
              <span className="text-sm">
                {isLoading ? 'Loading...' : isModelLoaded ? 'Model Ready' : 'Model Not Loaded'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={regenerateSampleData} 
                disabled={!isModelLoaded || isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                New Sample Data
              </Button>
              
              <Button 
                onClick={runPrediction} 
                disabled={!isModelLoaded || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                Run Prediction
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictions */}
      {predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predicted Transaction Types</CardTitle>
            <CardDescription>
              Unique categories and merchants predicted for the next transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Predicted Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Array.from(new Set(predictions.map(p => p.category))).map((category, index) => (
                  <div 
                    key={`category-${index}`}
                    className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-blue-800">{category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Merchants */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Predicted Merchants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Array.from(new Set(predictions.map(p => p.merchant))).map((merchant, index) => (
                  <div 
                    key={`merchant-${index}`}
                    className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">{merchant}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Summary:</strong> {Array.from(new Set(predictions.map(p => p.category))).length} unique categories, 
                {Array.from(new Set(predictions.map(p => p.merchant))).length} unique merchants predicted
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Model Type:</p>
              <p className="text-gray-600">Fin-O {selectedModelType.toUpperCase()}</p>
            </div>
            <div>
              <p className="font-medium">Mode:</p>
              <p className="text-gray-600">{isMockMode ? 'Mock (Testing)' : 'Production'}</p>
            </div>
            <div>
              <p className="font-medium">Sequence Length:</p>
              <p className="text-gray-600">50 transactions</p>
            </div>
            <div>
              <p className="font-medium">Forecast Horizon:</p>
              <p className="text-gray-600">10 predictions</p>
            </div>
            <div>
              <p className="font-medium">Categories:</p>
              <p className="text-gray-600">41 categories</p>
            </div>
            <div>
              <p className="font-medium">Merchants:</p>
              <p className="text-gray-600">230 merchants</p>
            </div>
            <div>
              <p className="font-medium">Features:</p>
              <p className="text-gray-600">14 features per transaction</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p className="text-gray-600">{isModelLoaded ? 'Ready' : 'Loading'}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Model Details:</p>
              <p className="text-gray-600">
                {selectedModelType === 'small' 
                  ? 'Optimized for speed with 512 hidden dimensions and 4 layers'
                  : 'Enhanced accuracy with 1024 hidden dimensions and 5 layers'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
