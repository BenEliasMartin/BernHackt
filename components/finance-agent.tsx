"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MessageCircle, Coffee, BarChart3, Home, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { BalanceWidget } from "@/components/widgets/balance-widget"
import { ChallengeWidget } from "@/components/widgets/challenge-widget"
import { BudgetWidget } from "@/components/widgets/budget-widget"
import { GoalsWidget } from "@/components/widgets/goals-widget"
import { NewsWidget } from "@/components/widgets/news-widget"

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
  springSoft: {
    type: "spring" as const,
    damping: 25,
    stiffness: 200,
  },
  duration: {
    fast: 0.3,
    medium: 0.5,
    slow: 0.8,
  },
  easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: ANIMATION_CONFIG.spring,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.easing,
    },
  },
}

interface Widget {
  id: string
  type: "balance" | "challenge" | "spending" | "goals" | "news"
  data?: any
}

const mockData = {
  balance: 11847.5,
  growth: 2.3,
  chartData: [45, 32, 68, 41, 72, 58, 49],
  spending: {
    categories: [
      { name: "Coffee & Dining", amount: 420, percentage: 35, color: "bg-gray-900" },
      { name: "Transportation", amount: 280, percentage: 23, color: "bg-gray-700" },
      { name: "Shopping", amount: 240, percentage: 20, color: "bg-gray-600" },
      { name: "Entertainment", amount: 180, percentage: 15, color: "bg-gray-500" },
      { name: "Other", amount: 80, percentage: 7, color: "bg-gray-400" },
    ],
    total: 1200,
  },
  houseGoal: {
    target: 50000,
    current: 11847.5,
    monthlyContribution: 800,
    estimatedMonths: 48,
  },
}

const analyzeUserIntent = (input: string): Widget[] => {
  const lowerInput = input.toLowerCase()

  // Coffee/savings related queries
  if (lowerInput.match(/(coffee|save|saving|challenge|spend less|cut costs|reduce|cheaper|alternative)/)) {
    return [{ id: "challenge", type: "challenge" }]
  }

  // Debt related queries
  if (lowerInput.match(/(debt|paydown|pay off|loan|credit card|owe|repay|interest|debt free)/)) {
    return [{ id: "balance", type: "balance", data: { activeTab: "debt" } }]
  }

  // Spending/budget related queries
  if (lowerInput.match(/(spending|spend|budget|expense|cost|money|category|breakdown|pattern|where.*money|how much)/)) {
    return [{ id: "spending", type: "spending" }]
  }

  // Goals related queries
  if (lowerInput.match(/(goal|house|home|target|reach|achieve|timeline|when|how long|progress|down payment)/)) {
    return [{ id: "goals", type: "goals" }]
  }

  // Balance/portfolio related queries
  if (lowerInput.match(/(balance|portfolio|total|worth|assets|investment|growth|performance|overview)/)) {
    return [{ id: "balance", type: "balance" }]
  }

  // News related queries
  if (lowerInput.match(/(news|updates|latest|information)/)) {
    return [{ id: "news", type: "news" }]
  }

  // Multiple widgets for comprehensive queries
  if (lowerInput.match(/(overview|summary|everything|all|dashboard|complete|full)/)) {
    return [
      { id: "balance", type: "balance" },
      { id: "spending", type: "spending" },
      { id: "goals", type: "goals" },
      { id: "news", type: "news" },
    ]
  }

  // Default to balance for unclear queries
  return [{ id: "balance", type: "balance" }]
}

export function FinanceAgent() {
  const [widgets, setWidgets] = useState<Widget[]>([{ id: "balance", type: "balance" }])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)

    setTimeout(() => {
      const newWidgets = analyzeUserIntent(suggestion)
      setWidgets(newWidgets)
    }, 150)
  }

  const handleSendMessage = () => {
    if (!input.trim()) return

    setShowSuggestions(false)

    const newWidgets = analyzeUserIntent(input)
    setWidgets(newWidgets)

    setInput("")
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleChatButtonClick = () => {
    setShowSuggestions(true)
  }

  const renderWidget = (widget: Widget) => {
    const widgetVariants = {
      hidden: {
        opacity: 0,
        y: 30,
        scale: 0.96,
        filter: "blur(8px)",
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          ...ANIMATION_CONFIG.spring,
          duration: ANIMATION_CONFIG.duration.medium,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        filter: "blur(4px)",
        transition: {
          duration: ANIMATION_CONFIG.duration.fast,
          ease: ANIMATION_CONFIG.easing,
        },
      },
    }

    switch (widget.type) {
      case "balance":
        return (
          <motion.div key={widget.id} variants={widgetVariants} initial="hidden" animate="visible" exit="exit" layout>
            <BalanceWidget initialTab={widget.data?.activeTab} />
          </motion.div>
        )

      case "spending":
        return (
          <motion.div key={widget.id} variants={widgetVariants} initial="hidden" animate="visible" exit="exit" layout>
            <BudgetWidget />
          </motion.div>
        )

      case "goals":
        return (
          <motion.div key={widget.id} variants={widgetVariants} initial="hidden" animate="visible" exit="exit" layout>
            <GoalsWidget />
          </motion.div>
        )

      case "challenge":
        return (
          <motion.div key={widget.id} variants={widgetVariants} initial="hidden" animate="visible" exit="exit" layout>
            <ChallengeWidget />
          </motion.div>
        )

      case "news":
        return (
          <motion.div key={widget.id} variants={widgetVariants} initial="hidden" animate="visible" exit="exit" layout>
            <NewsWidget />
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <motion.div
          className="pt-12 pb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_CONFIG.duration.medium,
            ease: ANIMATION_CONFIG.easing,
          }}
        >
          <h1 className="text-3xl font-extralight text-gray-900 mb-2 tracking-tight">Good morning, Alex</h1>
          <p className="text-gray-500 text-sm">Your intelligent finance assistant</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <div className="space-y-6">{widgets.map(renderWidget)}</div>
        </AnimatePresence>

        <div
          className={`fixed bottom-0 left-0 right-0 p-6 transition-all duration-300 ease-out ${
            showSuggestions ? "bg-white/95 backdrop-blur-sm" : "bg-transparent"
          }`}
        >
          <div className="max-w-md mx-auto space-y-4" ref={chatContainerRef}>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="bg-white shadow-lg rounded-2xl p-6 border-0"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={ANIMATION_CONFIG.spring}
                >
                  <motion.h3
                    className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    SUGGESTED QUESTIONS
                  </motion.h3>
                  <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
                    {[
                      { icon: Coffee, text: "How can I save more on coffee?" },
                      { icon: BarChart3, text: "Show me my spending patterns" },
                      { icon: Home, text: "When will I reach my house goal?" },
                      { icon: CreditCard, text: "Show me my debt paydown plan" },
                    ].map((suggestion, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-4 h-auto p-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl border-0"
                          onClick={() => handleSuggestionClick(suggestion.text)}
                        >
                          <suggestion.icon className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-900 text-sm font-medium">{suggestion.text}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4,
                ...ANIMATION_CONFIG.spring,
              }}
            >
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  onFocus={handleInputFocus}
                  placeholder="Ask about your finances..."
                  className="bg-gray-50 border-0 rounded-full pl-6 pr-6 h-14 transition-all duration-200 ease-out focus:ring-2 focus:ring-gray-200 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={ANIMATION_CONFIG.springSoft}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsListening(!isListening)}
                  className={`rounded-full h-14 w-14 transition-all duration-200 ease-out ${
                    isListening ? "bg-gray-900 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={ANIMATION_CONFIG.springSoft}
              >
                <Button
                  onClick={handleChatButtonClick}
                  className="rounded-full h-14 w-14 bg-gray-900 text-white hover:bg-gray-800"
                  size="icon"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="h-40"></div>
      </div>
    </div>
  )
}
