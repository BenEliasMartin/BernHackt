"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Mic,
  Coffee,
  Tv,
  Utensils,
} from "lucide-react"
// Removed Spline import - using iframe instead
import { useVoice } from "@/contexts/VoiceContext"
import { VoiceInput } from "./VoiceInput"

interface OnboardingProps {
  onComplete: () => void
}

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    damping: 25,
    stiffness: 400,
  },
  duration: {
    fast: 0.2,
    medium: 0.4,
    slow: 0.6,
  },
  easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

const steps = [
  {
    title: "Hallo Alex, ich bin Fin, dein finanzieller Begleiter",
    subtitle: "Einfach verfolgen • Intelligent sparen • Mehr erreichen",
    description: "",
  },
  {
    title: "Alex, wie ist deine finanzielle Situation?",
    subtitle: "Wähle ein Beispiel, das zu dir passt",
    description: "",
  },
  {
    title: "Alex, lass uns budgetieren, damit Japan Wirklichkeit wird.",
    subtitle: "Was fällt dir am leichtesten, um dein Ziel schneller zu erreichen?",
    description: "",
  },
]

const loadingSteps = ["Zugriff auf PostFinance-Systeme", "Lese die letzten 90 Tage Verhalten", "Erstelle dein Finanzmodell"]



const budgetOptions = [
  { id: "starbucks", label: "Verzichte dreimal pro Woche auf Starbucks", savings: "CHF 127", icon: Coffee, color: "#8B4513" },
  { id: "subscriptions", label: "Kündige Netflix, Adobe und das Fitnessstudio", savings: "CHF 144", icon: Tv, color: "#E50914" },
  { id: "dinner", label: "Lass einmal pro Woche das Auswärtsessen weg", savings: "CHF 130", icon: Utensils, color: "#FF6B35" },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [selectedBudgetOption, setSelectedBudgetOption] = useState<string | null>(null)
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0)

  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [activeLoadingStep, setActiveLoadingStep] = useState(-1)
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMicActive, setIsMicActive] = useState(false)

  // Voice transcription state
  const [transcribedText, setTranscribedText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)

  // Financial interview state
  const [userFinancialData, setUserFinancialData] = useState<{
    responses: string[];
    currentQuestionIndex: number;
    isInterviewComplete: boolean;
  }>({
    responses: [],
    currentQuestionIndex: 0,
    isInterviewComplete: false
  })

  // Voice context
  const { voiceService, isVoiceEnabled } = useVoice()

  // Financial interview questions in German
  const financialQuestions = [
    "Wie viel verdienst du ungefähr pro Monat?",
    "Wie würdest du deine finanzielle Situation beschreiben?",
    "Wofür gibst du das meiste Geld aus?",
    "Hast du finanzielle Ziele oder Träume?",
    "Was bereitet dir Sorgen bezüglich deiner Finanzen?"
  ]

  useEffect(() => {
    if (currentStep === 0) {
      loadingSteps.forEach((_, index) => {
        setTimeout(
          () => {
            setActiveLoadingStep(index)
          },
          (index + 1) * 2000 + 1000,
        )
      })

      setTimeout(
        () => {
          setActiveLoadingStep(-1)
          setCurrentStep(1) // Automatically go to next step
        },
        loadingSteps.length * 2000 + 2500,
      )
    }
  }, [currentStep])



  // Clear transcribed text when moving to next question
  useEffect(() => {
    const timer = setTimeout(() => {
      if (transcribedText && !userFinancialData.isInterviewComplete) {
        setTranscribedText("")
      }
    }, 3000) // Clear after 3 seconds to show next question

    return () => clearTimeout(timer)
  }, [userFinancialData.currentQuestionIndex, transcribedText, userFinancialData.isInterviewComplete])

  // Iframe load handler
  useEffect(() => {
    // Simulate iframe load after a short delay
    const timer = setTimeout(() => {
      setIsIframeLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const handleScenarioSelect = (scenarioId: number) => {
    setSelectedScenario(scenarioId)
  }

  const handleBudgetSelect = (optionId: string) => {
    setSelectedBudgetOption(optionId)
    setTimeout(() => {
      onComplete()
    }, 1000) // 1 second delay to show selection animation
  }

  // Voice handler functions
  const handleVoiceInput = (text: string) => {
    console.log('Voice input received:', text)
    setTranscribedText(text)
    setShowVoiceInput(false)
    setIsListening(false)
    setIsMicActive(false)

    // Save to financial interview data
    setUserFinancialData(prev => {
      const newResponses = [...prev.responses, text]
      const nextQuestionIndex = prev.currentQuestionIndex + 1
      const isComplete = nextQuestionIndex >= financialQuestions.length

      console.log('Financial Interview Progress:')
      console.log('- Current question index:', prev.currentQuestionIndex)
      console.log('- Next question index:', nextQuestionIndex)
      console.log('- Total questions:', financialQuestions.length)
      console.log('- Is complete:', isComplete)
      console.log('- All responses so far:', newResponses)

      const updatedData = {
        responses: newResponses,
        currentQuestionIndex: nextQuestionIndex,
        isInterviewComplete: isComplete
      }

      // If interview is complete, send data to ChatGPT
      if (isComplete) {
        console.log('🎉 Interview complete! Sending data to ChatGPT API...')
        sendFinancialDataToAPI(newResponses)
      }

      return updatedData
    })
  }

  // Function to send financial data to ChatGPT API
  const sendFinancialDataToAPI = async (responses: string[]) => {
    try {
      console.log('🚀 Starting API call to analyze financial data')
      console.log('📊 Sending financial data to API:', responses)
      console.log('❓ Questions being sent:', financialQuestions)
      
      const requestBody = {
        responses,
        questions: financialQuestions,
        timestamp: new Date().toISOString()
      }
      
      console.log('📦 Request body:', requestBody)
      
      const response = await fetch('/api/analyze-financial-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 API Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Financial analysis received:', data)
      
      // Log Firebase creation results
      if (data.createdItems) {
        console.log('🔥 Created Firebase items:', data.createdItems)
        if (data.createdItems.savingGoals.length > 0) {
          console.log(`💰 Created ${data.createdItems.savingGoals.length} saving goal(s):`, data.createdItems.savingGoals)
        }
        if (data.createdItems.budgets.length > 0) {
          console.log(`💳 Created ${data.createdItems.budgets.length} budget(s):`, data.createdItems.budgets)
        }
      }
      
      // Log ChatGPT recommendations
      if (data.recommendations) {
        console.log('🤖 ChatGPT recommendations:', data.recommendations)
      }
      
      // Log the analysis text
      if (data.analysis) {
        console.log('📝 Financial Analysis:', data.analysis)
      }
      
      return data
      
    } catch (error) {
      console.error('💥 Error sending financial data to API:', error)
      throw error
    }
  }

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error)
    setShowVoiceInput(false)
    setIsListening(false)
    setIsMicActive(false)
  }

  const startVoiceRecording = () => {
    console.log('Voice enabled:', isVoiceEnabled, 'Voice service:', !!voiceService)
    if (!isVoiceEnabled || !voiceService) {
      console.log('Voice not available')
      return
    }

    console.log('Starting voice recording')
    setShowVoiceInput(true)
    setIsListening(true)
    setIsMicActive(true)
    // Clear any previous transcription
    setTranscribedText("")
  }

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const canContinue = currentStep !== 2 || selectedBudgetOption

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

      <div className="max-w-lg w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={ANIMATION_CONFIG.spring}
            className="text-center space-y-12"
          >
            <motion.div
              className="flex justify-center relative"
              initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
              animate={{
                scale: isIframeLoaded ? 1 : 0.9,
                opacity: 1,
                rotateY: 0,
              }}
              transition={{
                delay: 0.1,
                duration: ANIMATION_CONFIG.duration.slow,
                ease: ANIMATION_CONFIG.easing,
              }}
            >
              <div className="w-48 h-48 relative">
                {!isIframeLoaded && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full"
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                )}

                <motion.div className="w-full h-full rounded-2xl overflow-hidden">
                  <iframe
                    src="https://my.spline.design/aivoiceassistant80s-XffkteQIC4MsraQHDQKep5Nc/"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    onLoad={() => setIsIframeLoaded(true)}
                    style={{
                      border: 'none',
                      borderRadius: '16px'
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: ANIMATION_CONFIG.duration.medium,
                ease: ANIMATION_CONFIG.easing,
              }}
            >
              <div className="space-y-3">
                <motion.h1
                  className="text-3xl font-bold text-slate-900 tracking-tight leading-tight font-satoshi"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentStepData.title}
                </motion.h1>
                {currentStep === 0 ? (
                  <motion.div
                    className="h-16 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <AnimatePresence mode="wait">
                      {activeLoadingStep >= 0 && (
                        <motion.div
                          key={activeLoadingStep}
                          className="flex items-center gap-4"
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{
                            duration: 0.8,
                            ease: [0.25, 1.56, 0.64, 1],
                          }}
                        >
                          <motion.div
                            className="relative w-5 h-5"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              delay: 0.4,
                              duration: 0.8,
                              ease: [0.34, 1.56, 0.64, 1],
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 rounded-full bg-black"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            />
                            <motion.svg
                              className="absolute inset-0 w-full h-full"
                              viewBox="0 0 20 20"
                              fill="none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.6, duration: 0.4 }}
                            >
                              <motion.path
                                d="M6 10l2.5 2.5L14 7"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                  delay: 0.7,
                                  duration: 0.6,
                                  ease: [0.25, 0.1, 0.25, 1],
                                }}
                              />
                            </motion.svg>
                          </motion.div>

                          <motion.span
                            className="text-base font-medium text-slate-800 tracking-tight font-satoshi"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                          >
                            {loadingSteps[activeLoadingStep]}
                          </motion.span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {activeLoadingStep === -1 && (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ) : currentStep === 1 ? (
                  <motion.div
                    className="space-y-8 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {!showVoiceInput && (
                      <motion.div
                        className="flex justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                      >
                        <motion.div
                          className="relative cursor-pointer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startVoiceRecording}
                        >
                          <motion.div
                            className="absolute inset-0 rounded-full bg-slate-900/10"
                            animate={
                              isMicActive
                                ? {
                                  scale: [1, 1.4, 1],
                                  opacity: [0.3, 0, 0.3],
                                }
                                : {}
                            }
                            transition={{
                              duration: 2,
                              repeat: isMicActive ? Number.POSITIVE_INFINITY : 0,
                              ease: "easeInOut",
                            }}
                          />

                          <motion.div
                            className="relative w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shadow-lg"
                            animate={
                              isMicActive
                                ? {
                                  scale: [1, 1.1, 1],
                                }
                                : {}
                            }
                            transition={{
                              duration: 1.5,
                              repeat: isMicActive ? Number.POSITIVE_INFINITY : 0,
                              ease: "easeInOut",
                            }}
                          >
                            <Mic className="w-8 h-8 text-white" />

                            {isMicActive && (
                              <>
                                <motion.div
                                  className="absolute -right-8 top-1/2 w-4 h-0.5 bg-slate-400 rounded-full"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{
                                    scaleX: [0, 1, 0],
                                    opacity: [0, 0.8, 0],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0,
                                  }}
                                />
                                <motion.div
                                  className="absolute -right-12 top-1/2 w-6 h-0.5 bg-slate-300 rounded-full"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{
                                    scaleX: [0, 1, 0],
                                    opacity: [0, 0.6, 0],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.div
                                  className="absolute -left-8 top-1/2 w-4 h-0.5 bg-slate-400 rounded-full"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{
                                    scaleX: [0, 1, 0],
                                    opacity: [0, 0.8, 0],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0.1,
                                  }}
                                />
                                <motion.div
                                  className="absolute -left-12 top-1/2 w-6 h-0.5 bg-slate-300 rounded-full"
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{
                                    scaleX: [0, 1, 0],
                                    opacity: [0, 0.6, 0],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0.3,
                                  }}
                                />
                              </>
                            )}
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* VoiceInput component - visible when recording */}
                    {showVoiceInput && isVoiceEnabled && voiceService && (
                      <motion.div
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <VoiceInput
                          onTranscriptionComplete={handleVoiceInput}
                          onError={handleVoiceError}
                          voiceService={voiceService}
                          disabled={false}
                        />
                      </motion.div>
                    )}

                    {!showVoiceInput && (
                      <motion.p
                        className="text-sm text-slate-500 font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        {isListening ? "Höre zu... sprich jetzt" : "Zum Sprechen tippen"}
                        {!isVoiceEnabled && <span className="text-red-500"> (Spracheingabe deaktiviert)</span>}
                      </motion.p>
                    )}

                    {/* AI Interview Chat Interface */}
                    <motion.div
                      className="mt-8 space-y-4 max-w-md mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      {/* Current AI Question */}
                      {!userFinancialData.isInterviewComplete && (
                        <motion.div
                          className="flex justify-start"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="max-w-[85%] bg-slate-100 rounded-3xl rounded-bl-lg px-5 py-4 shadow-sm border border-slate-200">
                            <p className="text-sm text-slate-800 font-medium leading-relaxed">
                              {financialQuestions[userFinancialData.currentQuestionIndex]}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* User's latest response as chat bubble */}
                      {transcribedText && (
                        <motion.div
                          className="flex justify-end"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="max-w-[85%] bg-slate-900 rounded-3xl rounded-br-lg px-5 py-4 shadow-lg">
                            <p className="text-sm text-white font-medium leading-relaxed">
                              {transcribedText}
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Interview progress */}
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-500">
                          Frage {userFinancialData.currentQuestionIndex + 1} von {financialQuestions.length}
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                          <div
                            className="bg-slate-900 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${((userFinancialData.currentQuestionIndex + 1) / financialQuestions.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Interview completion */}
                      {userFinancialData.isInterviewComplete && (
                        <motion.div
                          className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-300"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <p className="text-slate-900 font-medium mb-2">✅ Interview abgeschlossen!</p>
                          <p className="text-sm text-slate-600">
                            Danke für deine Antworten. Ich erstelle jetzt dein persönliches Finanzprofil.
                          </p>
                        </motion.div>
                      )}

                      {/* Action buttons */}
                      {transcribedText && !userFinancialData.isInterviewComplete && (
                        <div className="flex gap-2 justify-center">
                          <motion.button
                            className="text-xs text-slate-500 hover:text-slate-700 transition-colors px-3 py-1 bg-slate-100 rounded-full"
                            onClick={() => setTranscribedText("")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Antwort löschen
                          </motion.button>
                          <motion.button
                            className="text-xs text-slate-700 hover:text-slate-900 transition-colors px-3 py-1 bg-slate-200 rounded-full"
                            onClick={startVoiceRecording}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Nochmal antworten
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    className="space-y-8 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.p
                      className="text-lg text-slate-600 font-medium text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {currentStepData.subtitle}
                    </motion.p>

                    {/* Clean vertical list of options */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      {budgetOptions.map((option, index) => {
                        const IconComponent = option.icon
                        const isSelected = selectedBudgetOption === option.id

                        return (
                          <motion.div
                            key={option.id}
                            className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 border ${isSelected
                              ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-900"
                              }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.8 + index * 0.1,
                              duration: 0.4,
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleBudgetSelect(option.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg ${isSelected ? "bg-white/20" : "bg-slate-100"}`}>
                                  <IconComponent
                                    className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-600"}`}
                                  />
                                </div>
                                <span className="text-base font-medium font-satoshi">{option.label}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-lg font-semibold font-satoshi ${isSelected ? "text-white" : "text-slate-900"}`}
                                >
                                  {option.savings}
                                </span>
                                {isSelected && (
                                  <motion.div
                                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <svg className="w-3 h-3 text-slate-900" viewBox="0 0 16 16" fill="none">
                                      <path
                                        d="M3 8l3 3 7-7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>

                    <motion.div
                      className="text-center pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      <p className="text-base text-slate-500 font-medium font-[Satoshi]">
                        Jede dieser Optionen bringt dich in ~3 Monaten nach Japan.
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.p
                    className="text-base text-slate-600 font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {currentStepData.subtitle}
                  </motion.p>
                )}
              </div>
              {currentStep !== 1 && currentStep !== 2 && (
                <motion.p
                  className="text-slate-500 text-sm leading-relaxed px-6 max-w-md mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {currentStepData.description}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              className="flex justify-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${index === currentStep
                    ? "bg-slate-900 w-8"
                    : index < currentStep
                      ? "bg-slate-400 w-6"
                      : "bg-slate-200 w-4"
                    }`}
                  initial={{ width: 16 }}
                  animate={{
                    width: index === currentStep ? 32 : index < currentStep ? 24 : 16,
                    backgroundColor: index === currentStep ? "#0f172a" : index < currentStep ? "#94a3b8" : "#e2e8f0",
                  }}
                  transition={{ duration: 0.4, ease: ANIMATION_CONFIG.easing }}
                />
              ))}
            </motion.div>

            <motion.div
              className="space-y-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {currentStep > 0 && currentStep !== 3 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue}
                    className={`w-full rounded-2xl h-14 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${canContinue
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                  >
                    {isLastStep ? "Dashboard starten" : "Weiter"}
                    <motion.div
                      animate={canContinue ? { x: [0, 4, 0] } : {}}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Button>
                </motion.div>
              )}

              {!isLastStep && currentStep > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                  <button
                    onClick={handleSkip}
                    className="w-full text-slate-500 hover:!text-slate-800 hover:!bg-slate-100 text-sm rounded-xl h-12 transition-all duration-200 border-0 bg-transparent cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-opacity-50"
                  >
                    Jetzt überspringen
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-slate-300/30 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.8,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export { Onboarding }
