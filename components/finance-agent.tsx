"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiquidGlass } from "@specy/liquid-glass-react";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";

import {
  MessageCircle,
  Coffee,
  BarChart3,
  Home,
  CreditCard,
  SendHorizonal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function FinanceAgent() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      setMessages([{
        id: '1',
        content: 'Hello! I\'m your AI financial assistant. I can help you with:\n\n• Investment calculations (compound interest)\n• Loan and mortgage calculations\n• Financial planning and advice\n• Budgeting and savings strategies\n\nWhat would you like to know about your finances today?',
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pushUserMessage = (content: React.ReactNode) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const pushAssistantMessage = (content: React.ReactNode) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateMessage = (id: string, content: React.ReactNode) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, content } : msg
    ));
  };

  const callAI = async (userMessage: string) => {
    try {
      setIsProcessing(true);

      // Add loading message
      const loadingId = Date.now().toString();
      const loadingMessage: ChatMessage = {
        id: loadingId,
        content: '🤔 Thinking...',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Prepare messages for OpenAI
      const aiMessages = [
        {
          role: 'system' as const,
          content: `You are a specialized AI financial assistant with access to powerful financial calculation tools. You can:

1. Calculate compound interest for investment planning
2. Calculate monthly payments for loans and mortgages
3. Provide personalized financial advice
4. Help with budgeting and financial planning
5. Answer questions about investments, savings, and debt management

When users ask for financial calculations, use the appropriate tools to provide accurate results. Always explain the calculations and provide actionable insights. Be professional, helpful, and focus on practical financial guidance.`
        },
        ...messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: typeof msg.content === 'string' ? msg.content : 'Message content'
        })),
        {
          role: 'user' as const,
          content: userMessage
        }
      ];

      // Call OpenAI API
      const response: OpenAIToolsResponse = await callOpenAIWithTools(aiMessages);

      // Update the loading message with the real response
      const responseContent = response.message.content || 'I apologize, but I couldn\'t generate a response at this time.';
      updateMessage(loadingId, responseContent);

    } catch (error) {
      console.error('Error calling AI:', error);

      // Update loading message with error
      const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.content === '🤔 Thinking...') {
          updateMessage(lastMessage.id, errorMessage);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    pushUserMessage(suggestion);
    setShowSuggestions(false);
    callAI(suggestion);
  };

  const handleSendMessage = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    pushUserMessage(userMessage);
    setInput("");
    setShowSuggestions(false);

    // Call AI with the user message
    callAI(userMessage);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleChatButtonClick = () => {
    setShowSuggestions(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto p-6 space-y-8">
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
            <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900 mb-1">
              Your Financial Assistant
            </h1>
            <br></br>
            <motion.button
              className="text-white text-lg cursor-pointer font-bold tracking-tight rounded-full px-4 py-2 bg-blue-600"
              whileTap={{ scale: 0.9 }}
            >
              View
            </motion.button>
          </motion.div>

          {/* Content Area - Placeholder */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Placeholder Widget 1 - Chat Box */}
            <div className=" p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Clanker Chat</h3>
              </div>

              <div className="h-80 overflow-y-auto bg-white p-0 space-y-3">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-5 rounded-3xl ${message.sender === 'user'
                          ? 'bg-blue-700 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                      >
                        <div className="text-sm font-bold">{message.content}</div>
                        <div className={`text-xs mt-1 opacity-70 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                    if (e.key === 'Enter' && input.trim() && !isProcessing) {
                      handleSendMessage();
                    }
                  }}
                  placeholder={isProcessing ? "AI is thinking..." : "Type your message..."}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : <SendHorizonal />}
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
                        { icon: BarChart3, text: "Calculate compound interest on $10,000 at 7% for 10 years" },
                        { icon: Home, text: "What's my monthly payment on a $300,000 mortgage at 4.5% for 30 years?" },
                        { icon: CreditCard, text: "Help me create a budget plan" },
                        { icon: Coffee, text: "Investment advice for beginners" },
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
    </div>
  );
}