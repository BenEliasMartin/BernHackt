"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidGlass } from "@specy/liquid-glass-react";
import MonthlyBudgetWidget from "./MonthlyBudgetWidget";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";

import {
  MessageCircle,
  Coffee,
  BarChart3,
  Home,
  CreditCard,
  SendHorizonal,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceInput } from "@/components/VoiceInput";
import { VoiceOutput } from "@/components/VoiceOutput";
import { useVoice } from "@/contexts/VoiceContext";
import VoiceMode from "@/components/VoiceMode";
import DetailedView from "@/components/detailed-view";

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
};

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
};

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
};

interface ChatMessage {
  id: string;
  content: React.ReactNode;
  sender: "user" | "other";
  timestamp: Date;
  budgetWidget?: any; // Optional budget widget data
}

export default function Summary() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showDetailView, setShowDetailView] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice functionality
  const { voiceService, isVoiceEnabled, error: voiceError } = useVoice();

  const glassStyle = useRef({
    depth: 16,
    segments: 30,
    radius: 16,
    tint: null,
    reflectivity: 0.92,
    thickness: 27,
    dispersion: 10,
    roughness: 0,
  });

  const processUserMessage = async (message: string) => {
    pushUserMessage(message);
    setInput("");
    setIsProcessing(true);

    try {
      // Prepare messages for OpenAI with tools
      const aiMessages = [
        {
          role: 'system' as const,
          content: `Du bist ein hilfreicher KI-Finanzassistent mit Zugang zu leistungsstarken Finanzwerkzeugen. Du kannst:

1. Monatliche Budget-Widgets generieren, wenn Benutzer nach ihrem Budgetstatus, verbleibendem Geld oder Ausgaben fragen
2. Zinseszins für Investitionsplanung berechnen
3. Monatliche Zahlungen für Kredite und Hypotheken berechnen
4. Persönliche Finanzberatung anbieten

WICHTIG: Halte deine Antworten prägnant und fokussiert. Wenn Benutzer nach Budgets, Ausgaben oder Finanzstatus fragen:
- Verwende das generateMonthlyBudgetWidget-Tool, um die Daten visuell anzuzeigen
- Gib NUR eine kurze, relevante Antwort (max. 1-2 Sätze)
- Wiederhole NICHT alle Zahlen oder Details im Text, da das Widget sie anzeigt
- Konzentriere dich auf Erkenntnisse, nicht auf Datenwiederholung

Beispiel: "Hier ist deine Budgetübersicht für diesen Monat. Du bist derzeit auf Kurs mit 65% deines verbrauchten Budgets."`
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: typeof msg.content === 'string' ? msg.content : 'Message content'
        })),
        {
          role: 'user' as const,
          content: message
        }
      ];

      // Call OpenAI API with tools
      const response: OpenAIToolsResponse = await callOpenAIWithTools(aiMessages);

      // Check if any tools were called
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Process tool calls and create a rich message with the widget
        for (const toolCall of response.toolCalls) {
          if (toolCall.function.name === 'generateMonthlyBudgetWidget') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const budgetData = {
                type: "monthlyBudgetWidget",
                data: args
              };

              // Add the AI response with budget widget
              pushOtherMessage(response.message.content || "Here's your monthly budget overview:");

              // Add a separate message with the budget widget
              const budgetMessage: ChatMessage = {
                id: Date.now().toString(),
                content: "Here's your budget overview:",
                sender: "other",
                timestamp: new Date(),
                budgetWidget: budgetData.data
              };
              setMessages(prev => [...prev, budgetMessage]);
              return; // Exit early since we've handled the response
            } catch (error) {
              console.error('Error parsing tool arguments:', error);
            }
          }
        }
      }

      // Add AI response to chat (for non-tool responses)
      pushOtherMessage(response.message.content || 'I apologize, but I couldn\'t generate a response at this time.');

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      pushOtherMessage('Sorry, I encountered an error while processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Add initial message after component mounts to avoid hydration mismatch
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          content: "Hallo! Ich bin dein KI-Finanzassistent. Ich kann dir bei der Budgetverfolgung, Ausgabenanalyse und Finanzplanung helfen. Frag mich nach deinem monatlichen Budget oder wie viel Geld du diesen Monat noch übrig hast!",
          sender: "other",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pushUserMessage = (content: React.ReactNode) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const pushOtherMessage = (content: React.ReactNode) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "other",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setShowSuggestions(false);
    setInput("");
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleChatButtonClick = () => {
    setShowSuggestions(true);
  };

  const handleViewButtonClick = () => {
    setShowDetailView(true);
  };

  const handleBackButtonClick = () => {
    setShowDetailView(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto p-6 space-y-2">
          {/* Header */}
          <motion.div
            className="pt-8 pb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: ANIMATION_CONFIG.duration.medium,
              ease: ANIMATION_CONFIG.easing,
            }}
          >
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900 mb-1">
              Deine Finanzübersicht
            </h1>
            <br></br>
            <div className="flex gap-3">
              <motion.button
                className="text-white text-md cursor-pointer font-bold tracking-tight rounded-full px-3 py-2 bg-blue-600"
                whileTap={{ scale: 0.9 }}
                onClick={handleViewButtonClick}
              >
                View
              </motion.button>
              <motion.button
                className="text-white text-md cursor-pointer font-bold tracking-tight rounded-full px-3 py-2 bg-purple-600"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVoiceMode(true)}
              >
                Voice Mode
              </motion.button>
            </div>
          </motion.div>

          {/* Content Area - Placeholder */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Placeholder Widget 1 - Chat Box */}
            <div className="">
              <div className="h-[60vh] overflow-y-auto bg-white p-0 space-y-3">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl ${message.sender === "user"
                          ? "bg-blue-700 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                          }`}
                      >
                        <div className="text-sm font-bold">
                          {message.content}
                        </div>

                        {/* Voice Output for AI Messages */}
                        {message.sender === "other" && isVoiceEnabled && voiceService && (
                          <div className="mt-2 flex justify-end">
                            <VoiceOutput
                              text={typeof message.content === 'string' ? message.content : 'AI response'}
                              voiceService={voiceService}
                              disabled={isProcessing}
                            />
                          </div>
                        )}
                        {message.budgetWidget && (
                          <div className="mt-2">
                            <MonthlyBudgetWidget
                              month={message.budgetWidget.month}
                              year={message.budgetWidget.year}
                              totalBudget={message.budgetWidget.totalBudget}
                              totalSpent={message.budgetWidget.totalSpent}
                              categories={message.budgetWidget.categories}
                              savingsGoal={message.budgetWidget.savingsGoal}
                              savingsCurrent={message.budgetWidget.savingsCurrent}
                            />
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 opacity-70 ${message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                            }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && input.trim() && !isProcessing) {
                      processUserMessage(input.trim());
                    }
                  }}
                  placeholder={isProcessing ? "KI denkt nach..." : "Schreibe deine Nachricht..."}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Voice Input Button */}
                {isVoiceEnabled && voiceService ? (
                  <VoiceInput
                    onTranscriptionComplete={(text) => {
                      // Automatically send the transcribed text to ChatGPT
                      console.log('Voice transcription received:', text);
                      processUserMessage(text);
                    }}
                    onError={(error) => {
                      console.error('Voice input error:', error);
                      // You could add a toast notification here
                    }}
                    voiceService={voiceService}
                    disabled={isProcessing}
                  />
                ) : (
                  <div className="text-xs text-gray-500 p-2">
                    Voice: {voiceError || 'Loading...'}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (input.trim() && !isProcessing) {
                      processUserMessage(input.trim());
                    }
                  }}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Verarbeite..." : <SendHorizonal />}
                </button>
              </div>
            </div>


          </motion.div>

          {/* Permanent Grainy Gradient Ellipse Background 
          <div
            className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-78 z-0"
            style={{
              background: `
                radial-gradient(
                  ellipse 140% 100% at 50% 100%,
                  rgba(99, 102, 241, 0.18) 0%,
                  rgba(168, 85, 247, 0.15) 20%,
                  rgba(236, 72, 153, 0.12) 40%,
                  rgba(168, 85, 247, 0.08) 60%,
                  transparent 80%
                )
              `,
              filter: "blur(2px)",
              mixBlendMode: "multiply",
            }}
          >
            {/* Grain texture overlay
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0),
                  radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)
                `,
                backgroundSize: "3px 3px, 5px 5px",
                backgroundPosition: "0 0, 1px 1px",
              }}
            />
          </div> */}

          {/* Bottom Chat Interface */}
          <div
            className={`fixed bottom-0 left-0 right-0 p-4 transition-all duration-300 ease-out z-10 ${showSuggestions ? "bg-transparent" : "bg-transparent"
              }`}
          >
            <div className="max-w-sm mx-auto space-y-3" ref={chatContainerRef}>
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    className="bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-4 border-0"
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={ANIMATION_CONFIG.spring}
                  >
                    <motion.h3
                      className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      SUGGESTED QUESTIONS
                    </motion.h3>
                    <motion.div
                      className="space-y-2"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {[
                        { icon: BarChart3, text: "Wie viel Geld habe ich diesen Monat noch übrig?" },
                        { icon: Coffee, text: "Zeig mir meine monatliche Budgetübersicht" },
                        { icon: BarChart3, text: "Bin ich mit meinem Budget auf Kurs?" },
                        { icon: Home, text: "Wie ist mein Ausgabenstatus?" },
                        { icon: CreditCard, text: "Wie viel habe ich bisher ausgegeben?" },
                      ].map((suggestion, index) => (
                        <motion.div key={index} variants={itemVariants}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-auto p-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg border-0 text-xs"
                            onClick={() =>
                              handleSuggestionClick(suggestion.text)
                            }
                          >
                            <suggestion.icon className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-900 text-xs font-medium">
                              {suggestion.text}
                            </span>
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.4,
                  ...ANIMATION_CONFIG.spring,
                }}
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Overlay */}
      <AnimatePresence>
        {showDetailView && (
          <motion.div
            className="fixed inset-0 z-50 bg-white"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.6,
            }}
          >
            <div className="min-h-screen bg-white">
              <div className="max-w-md mx-auto p-6 space-y-8">
                {/* Header with Back Button */}
                <motion.div
                  className="pt-8 pb-4 flex items-center gap-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.button
                    onClick={handleBackButtonClick}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                  </motion.button>
                  <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900">
                    Financial Details
                  </h1>
                </motion.div>

                {/* Content Area */}
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* Portfolio Overview */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Portfolio Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-gray-900">$47,382</p>
                        <p className="text-sm text-green-600">+5.2% this month</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">Monthly Gain</p>
                        <p className="text-2xl font-bold text-green-600">+$2,341</p>
                        <p className="text-sm text-gray-600">vs last month</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Coffee Shop", amount: "-$4.50", date: "Today", category: "Food" },
                        { name: "Salary Deposit", amount: "+$3,200", date: "Yesterday", category: "Income" },
                        { name: "Grocery Store", amount: "-$67.80", date: "2 days ago", category: "Food" },
                        { name: "Investment Return", amount: "+$156.20", date: "3 days ago", category: "Investment" },
                      ].map((transaction, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center p-3 bg-white rounded-lg border"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{transaction.name}</p>
                            <p className="text-sm text-gray-600">{transaction.date} • {transaction.category}</p>
                          </div>
                          <p className={`font-bold ${transaction.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                            }`}>
                            {transaction.amount}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Spending Categories */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Spending Categories</h3>
                    <div className="space-y-3">
                      {[
                        { category: "Food & Dining", amount: "$342", percentage: 35, color: "bg-blue-500" },
                        { category: "Transportation", amount: "$156", percentage: 25, color: "bg-green-500" },
                        { category: "Entertainment", amount: "$98", percentage: 20, color: "bg-purple-500" },
                        { category: "Shopping", amount: "$87", percentage: 20, color: "bg-orange-500" },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="space-y-2"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">{item.category}</span>
                            <span className="text-sm font-bold text-gray-900">{item.amount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                              className={`h-2 rounded-full ${item.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Goals Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Savings Goals</h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Emergency Fund</span>
                          <span className="text-sm text-gray-600">$8,500 / $10,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            className="h-3 bg-green-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ delay: 1, duration: 1 }}
                          />
                        </div>
                        <p className="text-sm text-green-600 mt-1">85% complete</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">Vacation Fund</span>
                          <span className="text-sm text-gray-600">$2,100 / $5,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <motion.div
                            className="h-3 bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "42%" }}
                            transition={{ delay: 1.2, duration: 1 }}
                          />
                        </div>
                        <p className="text-sm text-blue-600 mt-1">42% complete</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Mode Overlay */}
      <VoiceMode
        isActive={isVoiceMode}
        onToggle={() => setIsVoiceMode(false)}
      />
    </div>
  );
}
