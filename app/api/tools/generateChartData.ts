import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'

// Firebase configuration (using existing config)
const firebaseConfig = {
  apiKey: "AIzaSyBm9qW8JokMPQ65sf6YlJCh7AA89MnK-eU",
  authDomain: "montypytorchxpostfinance.firebaseapp.com",
  databaseURL: "https://montypytorchxpostfinance-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "montypytorchxpostfinance",
  storageBucket: "montypytorchxpostfinance.firebasestorage.app",
  messagingSenderId: "841032630437",
  appId: "1:841032630437:web:c14d8cc05f0308bb098d4c",
  measurementId: "G-9GGWB051BB",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Interface for Firebase monthly summary data
interface MonthlySummary {
  id: string
  startDate: any
  endDate: any
  totalIncome: number
  totalSpent: number
  netAmount: number
  currency: string
  periodType: string
  spendingByCategory: Record<string, number>
  topSpendingCategories: Array<{ category: string; amount: number }>
  categoryChanges: {
    totalSpentChange: number
    totalSpentChangePercentage: number
  }
  comparisonWithPreviousPeriod: any
  insights: string[]
}

// Function to fetch real user data from Firebase
async function fetchUserSummaries(userId: string = 'test-user-123'): Promise<MonthlySummary[]> {
  try {
    console.log('📊 Fetching user summaries for:', userId)
    
    const userSummaryRef = doc(db, 'userSummaries', userId)
    const userSummaryDoc = await getDoc(userSummaryRef)
    
    if (!userSummaryDoc.exists()) {
      console.log('❌ No user summary document found')
      return []
    }
    
    const userData = userSummaryDoc.data()
    const monthlySummaries = userData.monthlySummaries || []
    
    console.log('✅ Found', monthlySummaries.length, 'monthly summaries')
    return monthlySummaries
  } catch (error) {
    console.error('❌ Error fetching user summaries:', error)
    return []
  }
}

export interface ChartDataRequest {
  chartType: 'bar' | 'line' | 'pie' | 'area'
  dataType: 'expenses' | 'income' | 'budget' | 'savings' | 'categories' | 'trends' | 'custom'
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  userId?: string
  customLabels?: string[]
  customValues?: number[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
}

export interface ChartDataResponse {
  success: boolean
  chartConfig: {
    type: 'bar' | 'line' | 'pie' | 'area'
    data: Array<{ name: string; value: number; [key: string]: any }>
    title: string
    xAxisLabel?: string
    yAxisLabel?: string
    colors?: string[]
  }
  error?: string
}

// Firebase data generators using real user data
const generateExpenseData = async (timeframe: string = 'month', userId?: string): Promise<Array<{ name: string; value: number }>> => {
  try {
    const summaries = await fetchUserSummaries(userId)
    
    if (summaries.length === 0) {
      console.log('No summaries found, using fallback data')
      return generateFallbackExpenseData(timeframe)
    }
    
    // Sort summaries by date (newest first)
    const sortedSummaries = summaries.sort((a, b) => {
      const dateA = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate)
      const dateB = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate)
      return dateB.getTime() - dateA.getTime()
    })
    
    switch (timeframe) {
      case 'week':
        // For weekly, show last 7 days (mock data since we have monthly summaries)
        return generateFallbackExpenseData('week')
      
      case 'year':
        // Group by year
        const yearlyData: Record<string, number> = {}
        sortedSummaries.forEach(summary => {
          const date = summary.startDate?.toDate ? summary.startDate.toDate() : new Date(summary.startDate)
          const year = date.getFullYear().toString()
          yearlyData[year] = (yearlyData[year] || 0) + summary.totalSpent
        })
        return Object.entries(yearlyData).map(([year, value]) => ({ name: year, value }))
      
      default: // month
        // Take last 6 months
        return sortedSummaries.slice(0, 6).reverse().map(summary => {
          const date = summary.startDate?.toDate ? summary.startDate.toDate() : new Date(summary.startDate)
          const monthName = date.toLocaleDateString('de-DE', { month: 'short' })
          return { name: monthName, value: summary.totalSpent }
        })
    }
  } catch (error) {
    console.error('Error generating expense data:', error)
    return generateFallbackExpenseData(timeframe)
  }
}

// Fallback data for when Firebase data is not available
const generateFallbackExpenseData = (timeframe: string = 'month'): Array<{ name: string; value: number }> => {
  const monthlyExpenses = [
    { name: 'Jan', value: 2800 },
    { name: 'Feb', value: 2650 },
    { name: 'Mar', value: 3100 },
    { name: 'Apr', value: 2900 },
    { name: 'May', value: 2750 },
    { name: 'Jun', value: 3200 },
  ]

  const weeklyExpenses = [
    { name: 'Mon', value: 120 },
    { name: 'Tue', value: 80 },
    { name: 'Wed', value: 150 },
    { name: 'Thu', value: 90 },
    { name: 'Fri', value: 200 },
    { name: 'Sat', value: 180 },
    { name: 'Sun', value: 100 },
  ]

  const yearlyExpenses = [
    { name: '2020', value: 32000 },
    { name: '2021', value: 34500 },
    { name: '2022', value: 36200 },
    { name: '2023', value: 38100 },
    { name: '2024', value: 35800 },
  ]

  switch (timeframe) {
    case 'week': return weeklyExpenses
    case 'year': return yearlyExpenses
    default: return monthlyExpenses
  }
}

const generateCategoryData = async (userId?: string): Promise<Array<{ name: string; value: number }>> => {
  try {
    const summaries = await fetchUserSummaries(userId)
    
    if (summaries.length === 0) {
      console.log('No summaries found, using fallback category data')
      return generateFallbackCategoryData()
    }
    
    // Get the most recent summary
    const latestSummary = summaries.sort((a, b) => {
      const dateA = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate)
      const dateB = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate)
      return dateB.getTime() - dateA.getTime()
    })[0]
    
    if (latestSummary.spendingByCategory) {
      return Object.entries(latestSummary.spendingByCategory)
        .filter(([_, value]) => value > 0)
        .map(([category, value]) => ({
          name: translateCategory(category),
          value: value as number
        }))
        .sort((a, b) => b.value - a.value)
    }
    
    // Fallback to topSpendingCategories if spendingByCategory is not available
    if (latestSummary.topSpendingCategories && latestSummary.topSpendingCategories.length > 0) {
      return latestSummary.topSpendingCategories.map(cat => ({
        name: translateCategory(cat.category),
        value: cat.amount
      }))
    }
    
    return generateFallbackCategoryData()
  } catch (error) {
    console.error('Error generating category data:', error)
    return generateFallbackCategoryData()
  }
}

// Helper function to translate category names to German
const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    'dining': 'Restaurants',
    'food': 'Lebensmittel',
    'groceries': 'Lebensmittel',
    'transport': 'Transport',
    'transportation': 'Transport',
    'entertainment': 'Unterhaltung',
    'shopping': 'Shopping',
    'utilities': 'Nebenkosten',
    'health': 'Gesundheit',
    'education': 'Bildung',
    'travel': 'Reisen',
    'other': 'Sonstiges'
  }
  
  return translations[category.toLowerCase()] || category
}

const generateFallbackCategoryData = (): Array<{ name: string; value: number }> => [
  { name: 'Lebensmittel', value: 800 },
  { name: 'Transport', value: 350 },
  { name: 'Unterhaltung', value: 250 },
  { name: 'Shopping', value: 400 },
  { name: 'Restaurants', value: 300 },
  { name: 'Nebenkosten', value: 200 },
]

const generateIncomeData = (timeframe: string = 'month'): Array<{ name: string; value: number }> => {
  const monthlyIncome = [
    { name: 'Jan', value: 5200 },
    { name: 'Feb', value: 5200 },
    { name: 'Mar', value: 5400 },
    { name: 'Apr', value: 5200 },
    { name: 'May', value: 5600 },
    { name: 'Jun', value: 5200 },
  ]

  const weeklyIncome = [
    { name: 'Week 1', value: 1300 },
    { name: 'Week 2', value: 1300 },
    { name: 'Week 3', value: 1300 },
    { name: 'Week 4', value: 1300 },
  ]

  switch (timeframe) {
    case 'week': return weeklyIncome
    default: return monthlyIncome
  }
}

const generateSavingsData = (timeframe: string = 'month'): Array<{ name: string; value: number }> => {
  const monthlySavings = [
    { name: 'Jan', value: 1200 },
    { name: 'Feb', value: 1350 },
    { name: 'Mar', value: 1100 },
    { name: 'Apr', value: 1450 },
    { name: 'May', value: 1600 },
    { name: 'Jun', value: 1300 },
  ]

  const weeklySavings = [
    { name: 'Week 1', value: 300 },
    { name: 'Week 2', value: 250 },
    { name: 'Week 3', value: 400 },
    { name: 'Week 4', value: 350 },
  ]

  switch (timeframe) {
    case 'week': return weeklySavings
    default: return monthlySavings
  }
}

const generateBudgetData = (): Array<{ name: string; value: number }> => [
  { name: 'Budget', value: 3000 },
  { name: 'Ausgegeben', value: 2750 },
  { name: 'Übrig', value: 250 },
]

// Main function to generate chart data
export async function generateChartData(request: ChartDataRequest): Promise<ChartDataResponse> {
  try {
    console.log('📊 Generating chart data for request:', request)

    let data: Array<{ name: string; value: number; [key: string]: any }> = []
    let title = request.title || 'Financial Chart'
    let xAxisLabel = request.xAxisLabel
    let yAxisLabel = request.yAxisLabel || 'Amount (CHF)'
    let colors: string[] | undefined

    // Handle custom data first
    if (request.dataType === 'custom' && request.customLabels && request.customValues) {
      if (request.customLabels.length !== request.customValues.length) {
        throw new Error('Custom labels and values arrays must have the same length')
      }
      
      data = request.customLabels.map((label, index) => ({
        name: label,
        value: request.customValues![index] || 0
      }))
      title = request.title || 'Custom Chart'
    } else {
      // Generate data based on type (now with async support)
      switch (request.dataType) {
        case 'expenses':
          data = await generateExpenseData(request.timeframe, request.userId)
          title = request.title || `Ausgaben ${request.timeframe === 'week' ? '(Woche)' : request.timeframe === 'year' ? '(Jahr)' : '(Monat)'}`
          xAxisLabel = xAxisLabel || (request.timeframe === 'week' ? 'Tag' : request.timeframe === 'year' ? 'Jahr' : 'Monat')
          colors = ['#ef4444', '#dc2626', '#b91c1c']
          break

        case 'income':
          data = generateIncomeData(request.timeframe)
          title = request.title || `Einkommen ${request.timeframe === 'week' ? '(Woche)' : '(Monat)'}`
          xAxisLabel = xAxisLabel || (request.timeframe === 'week' ? 'Woche' : 'Monat')
          colors = ['#10b981', '#059669', '#047857']
          break

        case 'savings':
          data = generateSavingsData(request.timeframe)
          title = request.title || `Ersparnisse ${request.timeframe === 'week' ? '(Woche)' : '(Monat)'}`
          xAxisLabel = xAxisLabel || (request.timeframe === 'week' ? 'Woche' : 'Monat')
          colors = ['#3b82f6', '#2563eb', '#1d4ed8']
          break

        case 'categories':
          data = await generateCategoryData(request.userId)
          title = request.title || 'Ausgaben nach Kategorien'
          colors = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3730a3']
          break

        case 'budget':
          data = generateBudgetData()
          title = request.title || 'Budget Übersicht'
          colors = ['#10b981', '#ef4444', '#f59e0b']
          break

        case 'trends':
          // Generate trend data based on timeframe
          data = request.timeframe === 'week' ? generateSavingsData('week') : await generateExpenseData(request.timeframe, request.userId)
          title = request.title || 'Finanztrend'
          xAxisLabel = xAxisLabel || 'Zeitraum'
          colors = ['#8b5cf6']
          break

        default:
          throw new Error(`Unsupported data type: ${request.dataType}`)
      }
    }

    // Validate chart type compatibility
    if (request.chartType === 'pie' && data.length > 8) {
      // Limit pie chart data to top 8 items for readability
      data = data.slice(0, 8)
    }

    const chartConfig = {
      type: request.chartType,
      data,
      title,
      xAxisLabel,
      yAxisLabel,
      colors,
    }

    console.log('✅ Generated chart config:', chartConfig)

    return {
      success: true,
      chartConfig,
    }

  } catch (error) {
    console.error('❌ Error generating chart data:', error)
    return {
      success: false,
      chartConfig: {
        type: 'bar',
        data: [],
        title: 'Error',
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

// Tool function for OpenAI integration
export async function generateChartDataTool(
  chartType: 'bar' | 'line' | 'pie' | 'area',
  dataType: 'expenses' | 'income' | 'budget' | 'savings' | 'categories' | 'trends' | 'custom',
  timeframe?: 'week' | 'month' | 'quarter' | 'year',
  customLabels?: string[],
  customValues?: number[],
  title?: string,
  xAxisLabel?: string,
  yAxisLabel?: string
): Promise<ChartDataResponse> {
  return generateChartData({
    chartType,
    dataType,
    timeframe,
    customLabels,
    customValues,
    title,
    xAxisLabel,
    yAxisLabel,
  })
}
