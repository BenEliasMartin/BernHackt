"use client"

import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

export interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'area'
  data: ChartDataPoint[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
  width?: number
  height?: number
  className?: string
}

const DEFAULT_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
  '#ff00ff',
  '#00ffff',
  '#ff0000',
]

export function Chart({
  type,
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  colors = DEFAULT_COLORS,
  width,
  height = 300,
  className = '',
}: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width={width || '100%'} height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill={colors[0]} 
                radius={[4, 4, 0, 0]}
                name={yAxisLabel || 'Value'}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'line':
        return (
          <ResponsiveContainer width={width || '100%'} height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                strokeWidth={3}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                name={yAxisLabel || 'Value'}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width={width || '100%'} height={height}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={colors[0]} 
                fill={colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                name={yAxisLabel || 'Value'}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        return (
          <ResponsiveContainer width={width || '100%'} height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={Math.min(height * 0.35, 120)}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div className="text-red-500">Unsupported chart type: {type}</div>
    }
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <div className="w-full">
        {renderChart()}
      </div>
      {(xAxisLabel || yAxisLabel) && (
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          {xAxisLabel && <span>{xAxisLabel}</span>}
          {yAxisLabel && type !== 'pie' && <span>{yAxisLabel}</span>}
        </div>
      )}
    </div>
  )
}

// Utility function to transform simple arrays into chart data format
export function createChartData(
  labels: string[],
  values: number[],
  additionalData?: Record<string, any>[]
): ChartDataPoint[] {
  return labels.map((label, index) => ({
    name: label,
    value: values[index] || 0,
    ...(additionalData?.[index] || {}),
  }))
}

// Example usage component for testing
export function ChartExample() {
  const sampleBarData = createChartData(
    ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    [400, 300, 200, 278, 189]
  )

  const samplePieData = createChartData(
    ['Food', 'Transport', 'Entertainment', 'Shopping'],
    [400, 300, 300, 200]
  )

  return (
    <div className="space-y-6 p-4">
      <Chart
        type="bar"
        data={sampleBarData}
        title="Monthly Expenses"
        xAxisLabel="Month"
        yAxisLabel="Amount (CHF)"
        height={300}
      />
      
      <Chart
        type="line"
        data={sampleBarData}
        title="Expense Trend"
        xAxisLabel="Month"
        yAxisLabel="Amount (CHF)"
        height={300}
        colors={['#10b981']}
      />
      
      <Chart
        type="pie"
        data={samplePieData}
        title="Spending Categories"
        height={300}
        colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
      />
      
      <Chart
        type="area"
        data={sampleBarData}
        title="Savings Growth"
        xAxisLabel="Month"
        yAxisLabel="Amount (CHF)"
        height={300}
        colors={['#8b5cf6']}
      />
    </div>
  )
}
