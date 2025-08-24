import { NextRequest, NextResponse } from 'next/server'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

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

interface FinancialInterviewData {
  responses: string[]
  questions: string[]
  timestamp: string
}

interface SavingGoal {
  name: string
  targetAmount: number
  currentAmount: number
  imageUrl: string
  userId: string
  createdAt: any
  updatedAt: any
}

interface Budget {
  name: string
  category: string
  limit: number
  period: string
  isActive: boolean
  userId: string
  createdAt: any
  updatedAt: any
}

interface ChatGPTRecommendation {
  shouldCreateSavingGoal: boolean
  savingGoal?: {
    name: string
    targetAmount: number
    imageUrl: string
  }
  shouldCreateBudgets: boolean
  budgets?: Array<{
    name: string
    category: string
    limit: number
    period: string
  }>
  analysis: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 API endpoint called: /api/analyze-financial-data')
    
    const body = await request.json()
    console.log('📥 Received request body:', body)
    
    const { responses, questions }: FinancialInterviewData = body
    console.log('📋 Extracted responses:', responses)
    console.log('❓ Extracted questions:', questions)

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      console.error('❌ Invalid responses provided')
      return NextResponse.json(
        { error: 'No financial responses provided' },
        { status: 400 }
      )
    }
    
    console.log(`✅ Valid request with ${responses.length} responses`)

    // Prepare the conversation history
    const conversationHistory = questions.map((question, index) => ({
      question,
      answer: responses[index] || 'No response provided'
    }))

    const systemPrompt = `You are a Swiss financial advisor analyzing a user's financial interview responses. 
    The user is based in Switzerland and uses CHF as currency.
    
    Based on their responses, you need to:
    1. Provide comprehensive financial analysis and advice in German
    2. Decide whether to create a new saving goal and/or budgets
    3. If creating goals/budgets, suggest appropriate names, amounts, and categories
    
    For saving goals, consider:
    - Emergency funds (3-6 months expenses)
    - Travel goals (like Japan trip mentioned in onboarding)
    - Major purchases
    - Investment goals
    
    For budgets, consider Swiss living costs and common categories:
    - dining/restaurants (typical: 200-500 CHF/month)
    - groceries (typical: 300-600 CHF/month)
    - entertainment (typical: 100-300 CHF/month)
    - transportation (typical: 100-400 CHF/month)
    - shopping (typical: 200-500 CHF/month)
    
    Respond with a JSON object containing:
    {
      "shouldCreateSavingGoal": boolean,
      "savingGoal": {
        "name": "Goal name in German",
        "targetAmount": number (in CHF),
        "imageUrl": "https://example.com/relevant-image.jpg"
      },
      "shouldCreateBudgets": boolean,
      "budgets": [
        {
          "name": "Budget name in German",
          "category": "category_name",
          "limit": number (in CHF),
          "period": "monthly" or "weekly"
        }
      ],
      "analysis": "Detailed financial analysis and advice in German"
    }`

    const userPrompt = `Here are the financial interview responses from a Swiss user:
    
    ${conversationHistory.map((item, index) => 
      `Frage ${index + 1}: ${item.question}
      Antwort: ${item.answer}`
    ).join('\n\n')}
    
    Please analyze these responses and provide recommendations with the JSON structure specified.`

    // Call OpenAI API
    console.log('🤖 Calling ChatGPT API...')
    console.log('📝 System prompt length:', systemPrompt.length)
    console.log('📝 User prompt length:', userPrompt.length)
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })
    
    console.log('📡 ChatGPT response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to analyze financial data' },
        { status: 500 }
      )
    }

    const openaiData = await openaiResponse.json()
    const rawResponse = openaiData.choices[0]?.message?.content

    if (!rawResponse) {
      return NextResponse.json(
        { error: 'No analysis received from AI' },
        { status: 500 }
      )
    }

    // Parse the JSON response from ChatGPT
    let recommendations: ChatGPTRecommendation
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : rawResponse
      recommendations = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Error parsing ChatGPT response:', parseError)
      return NextResponse.json({
        success: true,
        analysis: rawResponse,
        conversationHistory,
        timestamp: new Date().toISOString(),
        error: 'Could not parse recommendations for Firebase creation'
      })
    }

    const userId = 'test-user-123'
    const createdItems: { savingGoals: string[], budgets: string[] } = {
      savingGoals: [],
      budgets: []
    }
    
    console.log('🔥 Starting Firebase operations for user:', userId)
    console.log('📊 Recommendations received:', recommendations)

    // Create saving goal if recommended
    if (recommendations.shouldCreateSavingGoal && recommendations.savingGoal) {
      console.log('💰 Creating saving goal:', recommendations.savingGoal)
      try {
        const savingGoalData: SavingGoal = {
          name: recommendations.savingGoal.name,
          targetAmount: recommendations.savingGoal.targetAmount,
          currentAmount: 0,
          imageUrl: recommendations.savingGoal.imageUrl,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        console.log('📦 Saving goal data to create:', savingGoalData)

        const savingGoalRef = await addDoc(collection(db, 'savingsGoals'), savingGoalData)
        createdItems.savingGoals.push(savingGoalRef.id)
        console.log('✅ Created saving goal with ID:', savingGoalRef.id)
      } catch (error) {
        console.error('❌ Error creating saving goal:', error)
      }
    } else {
      console.log('⚠️ No saving goal recommended or missing data')
    }

    // Create budgets if recommended
    if (recommendations.shouldCreateBudgets && recommendations.budgets) {
      console.log(`💳 Creating ${recommendations.budgets.length} budget(s)`)
      for (const budgetRec of recommendations.budgets) {
        console.log('💳 Creating budget:', budgetRec)
        try {
          const budgetData: Budget = {
            name: budgetRec.name,
            category: budgetRec.category,
            limit: budgetRec.limit,
            period: budgetRec.period,
            isActive: true,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }
          
          console.log('📦 Budget data to create:', budgetData)

          const budgetRef = await addDoc(collection(db, 'budgets'), budgetData)
          createdItems.budgets.push(budgetRef.id)
          console.log('✅ Created budget with ID:', budgetRef.id)
        } catch (error) {
          console.error('❌ Error creating budget:', error)
        }
      }
    } else {
      console.log('⚠️ No budgets recommended or missing data')
    }

    return NextResponse.json({
      success: true,
      analysis: recommendations.analysis,
      recommendations,
      createdItems,
      conversationHistory,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error analyzing financial data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
