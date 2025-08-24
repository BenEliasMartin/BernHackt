import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

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
export interface MonthlySummary {
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

// Interface for savings goals
export interface SavingsGoal {
  id: string
  title: string
  targetAmount: number
  currentAmount: number
  deadline: any
  category: string
  priority: string
  createdAt: any
}

// Interface for budget data
export interface Budget {
  id: string
  name: string
  totalAmount: number
  spentAmount: number
  categories: Record<string, { allocated: number; spent: number }>
  period: string
  createdAt: any
}

// Interface for dashboard data
export interface DashboardData {
  totalBalance: number
  totalIncome: number
  totalSpent: number
  netAmount: number
  currency: string
  monthlyTrend: Array<{ name: string; value: number }>
  categorySpending: Array<{ name: string; value: number; color?: string }>
  recentTransactions: Array<{
    id: string
    description: string
    amount: number
    category: string
    date: Date
    type: 'income' | 'expense'
  }>
  savingsGoals: SavingsGoal[]
  budgets: Budget[]
  portfolioValue?: number
  portfolioGrowth?: number
}

// Service class for Firebase data operations
export class FirebaseDataService {
  private userId: string

  constructor(userId: string = 'test-user-123') {
    this.userId = userId
  }

  // Fetch user summaries from Firebase
  async fetchUserSummaries(): Promise<MonthlySummary[]> {
    try {
      console.log('📊 Fetching user summaries for:', this.userId)
      
      const userSummaryRef = doc(db, 'userSummaries', this.userId)
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

  // Fetch savings goals
  async fetchSavingsGoals(): Promise<SavingsGoal[]> {
    try {
      const savingsGoalsRef = collection(db, 'savingsGoals')
      const q = query(savingsGoalsRef, orderBy('createdAt', 'desc'), limit(10))
      const querySnapshot = await getDocs(q)
      
      const goals: SavingsGoal[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        goals.push({
          id: doc.id,
          ...data
        } as SavingsGoal)
      })
      
      console.log('✅ Found', goals.length, 'savings goals')
      return goals
    } catch (error) {
      console.error('❌ Error fetching savings goals:', error)
      return []
    }
  }

  // Fetch budgets
  async fetchBudgets(): Promise<Budget[]> {
    try {
      const budgetsRef = collection(db, 'budgets')
      const q = query(budgetsRef, orderBy('createdAt', 'desc'), limit(5))
      const querySnapshot = await getDocs(q)
      
      const budgets: Budget[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        budgets.push({
          id: doc.id,
          ...data
        } as Budget)
      })
      
      console.log('✅ Found', budgets.length, 'budgets')
      return budgets
    } catch (error) {
      console.error('❌ Error fetching budgets:', error)
      return []
    }
  }

  // Generate comprehensive dashboard data
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [summaries, savingsGoals, budgets] = await Promise.all([
        this.fetchUserSummaries(),
        this.fetchSavingsGoals(),
        this.fetchBudgets()
      ])

      // Calculate totals from summaries
      const latestSummary = summaries.length > 0 ? summaries[0] : null
      const totalIncome = latestSummary?.totalIncome || 0
      const totalSpent = latestSummary?.totalSpent || 0
      const netAmount = latestSummary?.netAmount || 0
      const currency = latestSummary?.currency || 'CHF'

      // Calculate total balance (simplified calculation)
      const totalBalance = summaries.reduce((acc, summary) => acc + summary.netAmount, 0)

      // Generate monthly trend data
      const monthlyTrend = summaries
        .slice(0, 6)
        .reverse()
        .map(summary => {
          const date = summary.startDate?.toDate ? summary.startDate.toDate() : new Date(summary.startDate)
          const monthName = date.toLocaleDateString('de-DE', { month: 'short' })
          return { name: monthName, value: summary.totalSpent }
        })

      // Generate category spending data
      const categorySpending = latestSummary?.spendingByCategory 
        ? Object.entries(latestSummary.spendingByCategory)
            .filter(([_, value]) => value > 0)
            .map(([category, value]) => ({
              name: this.translateCategory(category),
              value: value as number,
              color: this.getCategoryColor(category)
            }))
            .sort((a, b) => b.value - a.value)
        : []

      // Generate mock recent transactions (could be enhanced with real transaction data)
      const recentTransactions = this.generateMockTransactions(latestSummary)

      // Calculate portfolio value (mock data - could be enhanced)
      const portfolioValue = totalBalance * 0.6 // Assume 60% is invested
      const portfolioGrowth = 5.2 // Mock 5.2% growth

      return {
        totalBalance,
        totalIncome,
        totalSpent,
        netAmount,
        currency,
        monthlyTrend,
        categorySpending,
        recentTransactions,
        savingsGoals,
        budgets,
        portfolioValue,
        portfolioGrowth
      }
    } catch (error) {
      console.error('❌ Error generating dashboard data:', error)
      return this.getFallbackDashboardData()
    }
  }

  // Helper function to translate category names to German
  private translateCategory(category: string): string {
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

  // Helper function to get category colors
  private getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'dining': '#ef4444',
      'food': '#10b981',
      'groceries': '#10b981',
      'transport': '#3b82f6',
      'entertainment': '#8b5cf6',
      'shopping': '#f59e0b',
      'utilities': '#6b7280',
      'health': '#ec4899',
      'education': '#14b8a6',
      'travel': '#f97316',
      'other': '#64748b'
    }
    
    return colors[category.toLowerCase()] || '#64748b'
  }

  // Generate mock transactions based on category spending
  private generateMockTransactions(summary: MonthlySummary | null): Array<{
    id: string
    description: string
    amount: number
    category: string
    date: Date
    type: 'income' | 'expense'
  }> {
    if (!summary?.spendingByCategory) {
      return []
    }

    const transactions = []
    const categories = Object.entries(summary.spendingByCategory)
    
    for (let i = 0; i < Math.min(6, categories.length); i++) {
      const [category, amount] = categories[i]
      transactions.push({
        id: `tx-${i}`,
        description: this.getMockTransactionDescription(category),
        amount: -(amount as number / 4), // Divide by 4 to simulate individual transactions
        category: this.translateCategory(category),
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Spread over last few days
        type: 'expense' as const
      })
    }

    // Add some income transactions
    if (summary.totalIncome > 0) {
      transactions.unshift({
        id: 'tx-income',
        description: 'Gehalt',
        amount: summary.totalIncome,
        category: 'Einkommen',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        type: 'income' as const
      })
    }

    return transactions
  }

  // Generate mock transaction descriptions
  private getMockTransactionDescription(category: string): string {
    const descriptions: Record<string, string[]> = {
      'dining': ['Restaurant Bellevue', 'Café Central', 'Pizzeria Roma'],
      'food': ['Migros', 'Coop', 'Denner'],
      'transport': ['SBB', 'Uber', 'Tankstelle'],
      'entertainment': ['Kino Rex', 'Netflix', 'Spotify'],
      'shopping': ['H&M', 'Zalando', 'Manor'],
      'utilities': ['Swisscom', 'EWZ', 'Krankenkasse']
    }
    
    const options = descriptions[category.toLowerCase()] || ['Sonstige Ausgabe']
    return options[Math.floor(Math.random() * options.length)]
  }

  // Fallback data when Firebase is unavailable
  private getFallbackDashboardData(): DashboardData {
    return {
      totalBalance: 11847.50,
      totalIncome: 5200,
      totalSpent: 2800,
      netAmount: 2400,
      currency: 'CHF',
      monthlyTrend: [
        { name: 'Jan', value: 2800 },
        { name: 'Feb', value: 2650 },
        { name: 'Mar', value: 3100 },
        { name: 'Apr', value: 2900 },
        { name: 'May', value: 2750 },
        { name: 'Jun', value: 3200 },
      ],
      categorySpending: [
        { name: 'Lebensmittel', value: 800, color: '#10b981' },
        { name: 'Transport', value: 350, color: '#3b82f6' },
        { name: 'Unterhaltung', value: 250, color: '#8b5cf6' },
        { name: 'Shopping', value: 400, color: '#f59e0b' },
        { name: 'Restaurants', value: 300, color: '#ef4444' },
      ],
      recentTransactions: [],
      savingsGoals: [],
      budgets: [],
      portfolioValue: 7832,
      portfolioGrowth: 5.2
    }
  }
}

// Export singleton instance
export const firebaseDataService = new FirebaseDataService()
