'use client';

import React from 'react';
import ModelInference from '@/components/ModelInference';
import { PredictionResult } from '@/lib/model-inference';

export default function Home() {
  const handlePredictionComplete = (predictions: PredictionResult[]) => {
    console.log('Model predictions:', predictions);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fin-O Model Inference Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the Fin-O AI models for financial transaction prediction
          </p>
        </div>

        <ModelInference 
          useMockMode={false}
          onPredictionComplete={handlePredictionComplete}
        />
      </div>
    </main>
  );
}
