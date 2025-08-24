"use client"

import React, { useState } from 'react'
import { Chart, ChartExample } from '../../components/Chart'

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area'
  data: Array<{ name: string; value: number; [key: string]: any }>
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
}

export default function TestChartsPage() {
  const [loading, setLoading] = useState(false)
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateChart = async (
    chartType: 'bar' | 'line' | 'pie' | 'area',
    dataType: 'expenses' | 'income' | 'budget' | 'savings' | 'categories' | 'trends' | 'custom',
    timeframe?: 'week' | 'month' | 'quarter' | 'year',
    title?: string
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/openai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a ${chartType} chart for ${dataType} data${timeframe ? ` with ${timeframe} timeframe` : ''}${title ? ` titled "${title}"` : ''}`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generateChartData",
                description: "Generate chart data and configuration for financial visualizations",
                parameters: {
                  type: "object",
                  properties: {
                    chartType: { type: "string", enum: ["bar", "line", "pie", "area"] },
                    dataType: { type: "string", enum: ["expenses", "income", "budget", "savings", "categories", "trends", "custom"] },
                    timeframe: { type: "string", enum: ["week", "month", "quarter", "year"] },
                    title: { type: "string" }
                  },
                  required: ["chartType", "dataType"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "generateChartData" } }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      // Extract chart config from tool calls
      if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.result) {
        const result = data.choices[0].message.tool_calls[0].function.result
        if (result.success && result.chartConfig) {
          setChartConfig(result.chartConfig)
        } else {
          setError(result.error || 'Failed to generate chart')
        }
      } else {
        setError('No chart data received from API')
      }
    } catch (err) {
      console.error('Error generating chart:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateCustomChart = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/openai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Generate a custom pie chart with Swiss cities and their populations'
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generateChartData",
                description: "Generate chart data and configuration for financial visualizations",
                parameters: {
                  type: "object",
                  properties: {
                    chartType: { type: "string", enum: ["bar", "line", "pie", "area"] },
                    dataType: { type: "string", enum: ["expenses", "income", "budget", "savings", "categories", "trends", "custom"] },
                    customLabels: { type: "array", items: { type: "string" } },
                    customValues: { type: "array", items: { type: "number" } },
                    title: { type: "string" }
                  },
                  required: ["chartType", "dataType"]
                }
              }
            }
          ],
          tool_choice: { type: "function", function: { name: "generateChartData" } }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // For custom data, we'll create it manually since our tool doesn't handle this specific case
      const customConfig: ChartConfig = {
        type: 'pie',
        data: [
          { name: 'Zürich', value: 434008 },
          { name: 'Genf', value: 203856 },
          { name: 'Basel', value: 177595 },
          { name: 'Bern', value: 133883 },
          { name: 'Lausanne', value: 140202 },
        ],
        title: 'Schweizer Städte - Einwohnerzahl',
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
      }
      
      setChartConfig(customConfig)
    } catch (err) {
      console.error('Error generating custom chart:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Chart Component Test</h1>
        
        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate Charts with ChatGPT</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => generateChart('bar', 'expenses', 'month', 'Monatliche Ausgaben')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Bar Chart (Ausgaben)
            </button>
            
            <button
              onClick={() => generateChart('line', 'savings', 'month', 'Spartrend')}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Line Chart (Ersparnisse)
            </button>
            
            <button
              onClick={() => generateChart('pie', 'categories', undefined, 'Ausgabenkategorien')}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Pie Chart (Kategorien)
            </button>
            
            <button
              onClick={() => generateChart('area', 'income', 'month', 'Einkommensverlauf')}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Area Chart (Einkommen)
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => generateChart('bar', 'budget', undefined, 'Budget Übersicht')}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Budget Chart
            </button>
            
            <button
              onClick={generateCustomChart}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
            >
              Custom Chart (Städte)
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Generating chart...
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
        </div>

        {/* Generated Chart */}
        {chartConfig && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Generated Chart</h2>
            <Chart
              type={chartConfig.type}
              data={chartConfig.data}
              title={chartConfig.title}
              xAxisLabel={chartConfig.xAxisLabel}
              yAxisLabel={chartConfig.yAxisLabel}
              colors={chartConfig.colors}
              height={400}
            />
          </div>
        )}

        {/* Example Charts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Example Charts</h2>
          <ChartExample />
        </div>
      </div>
    </div>
  )
}
