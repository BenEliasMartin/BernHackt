"use client";

import { useState, useRef, useEffect } from "react";
import MonthlyBudgetWidget from "./MonthlyBudgetWidget";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";
import Image from "next/image";
import Fin from "@/public/fin.png";

import {
  Coffee,
  BarChart3,
  Home,
  CreditCard,
  SendHorizonal,
  Mic,
  Calendar,
} from "lucide-react";
import { VoiceOutput } from "@/components/VoiceOutput";
import { useVoice } from "@/contexts/VoiceContext";
import VoiceMode from "@/components/VoiceMode";
import DetailedViewOverlay from "@/components/DetailedViewOverlay";
import WeeklyReview from "@/components/WeeklyReview";
import { Chart } from "@/components/Chart";

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area'
  data: Array<{ name: string; value: number;[key: string]: any }>
  title: string
  xAxisLabel?: string
  yAxisLabel?: string
  colors?: string[]
}

interface ChatMessage {
  id: string;
  content: React.ReactNode;
  sender: "user" | "other";
  timestamp: Date;
  budgetWidget?: any; // Optional budget widget data
  chartData?: ChartConfig; // Optional chart data
}

export default function Summary() {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showDetailView, setShowDetailView] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice functionality
  const { voiceService, isVoiceEnabled, error: voiceError } = useVoice();

  const processUserMessage = async (message: string) => {
    pushUserMessage(message);
    setInput("");
    setIsProcessing(true);

    try {
      // Prepare messages for OpenAI with tools
      const aiMessages = [
        {
          role: 'system' as const,
          content: `Du bist Fin, ein hilfreicher KI-Finanzassistent mit Zugang zu leistungsstarken Finanzwerkzeugen. Du kannst:

1. Monatliche Budget-Widgets generieren, wenn Benutzer nach ihrem Budgetstatus, verbleibendem Geld oder Ausgaben fragen
2. Interaktive Diagramme und Charts für Finanzvisualisierungen erstellen (Balken-, Linien-, Kreis- und Flächendiagramme)
3. Zinseszins für Investitionsplanung berechnen
4. Monatliche Zahlungen für Kredite und Hypotheken berechnen
5. Persönliche Finanzberatung anbieten

WICHTIG: Sei proaktiv mit Visualisierungen! Erstelle automatisch Charts für:
- Ausgaben-bezogene Fragen → Balkendiagramm (chartType: "bar", dataType: "expenses")
- Kategorien-Fragen → Kreisdiagramm (chartType: "pie", dataType: "categories")
- Trend-Fragen → Liniendiagramm (chartType: "line", dataType: "trends")
- Entwicklungs-Fragen → Flächendiagramm (chartType: "area", dataType: "expenses")

Für Budgets und Ausgabenstatus:
- Verwende das generateMonthlyBudgetWidget-Tool für detaillierte Budgetübersichten
- Gib NUR eine kurze, relevante Antwort (max. 1-2 Sätze)

Für Diagramme und Visualisierungen:
- Verwende das generateChartData-Tool AUTOMATISCH bei Fragen zu Ausgaben, Kategorien, Trends
- Erstelle Charts auch ohne explizite Aufforderung wenn es hilfreich ist
- Wähle den passenden Diagrammtyp: Balken für Vergleiche, Linien für Trends, Kreise für Anteile, Flächen für Entwicklungen
- Verwende deutsche Beschriftungen und CHF als Währung
- Setze timeframe auf "month" als Standard

Beispiele für automatische Chart-Erstellung:
- Frage: "Wie sind meine Ausgaben?" → Erstelle Balkendiagramm mit expenses
- Frage: "Wofür gebe ich am meisten aus?" → Erstelle Kreisdiagramm mit categories
- Frage: "Wie entwickeln sich meine Finanzen?" → Erstelle Liniendiagramm mit trends

Antworte kurz und erstelle dann automatisch das passende Diagramm! Unter keinen Umständen antworte mit den Daten des Diagramms im Text, benutze diese Daten ausschliesllich im Tool Call aber nicht in der Textantwort!!! Die Textantwort darf keine Artifkate wie Dateinamen, Daten, etc. enthalten, das Tool wird das automatisch für dich erstellen, bitte antworte nur mit einer simplen Textantwort!

Hier ist die Entwicklung deines Vermögens in den letzten Jahren! Man sieht im Graph [erkläre was im Graph gesehen werden kann]. 
Beispiel für eine gute Antwort: 
`
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

          if (toolCall.function.name === 'generateChartData') {
            try {
              const args = JSON.parse(toolCall.function.arguments);

              // Call the chart generation API directly
              const chartResponse = await fetch('/api/openai-tools', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messages: [{
                    role: 'user',
                    content: 'Generate chart data'
                  }],
                  tools: [{
                    type: "function",
                    function: {
                      name: "generateChartData",
                      description: "Generate chart data",
                      parameters: {
                        type: "object",
                        properties: {
                          chartType: { type: "string" },
                          dataType: { type: "string" },
                          timeframe: { type: "string" },
                          title: { type: "string" },
                          xAxisLabel: { type: "string" },
                          yAxisLabel: { type: "string" }
                        },
                        required: ["chartType", "dataType"]
                      }
                    }
                  }],
                  tool_choice: { type: "function", function: { name: "generateChartData" } },
                  directToolCall: {
                    name: "generateChartData",
                    arguments: JSON.stringify(args)
                  }
                })
              });

              if (chartResponse.ok) {
                const chartData = await chartResponse.json();
                console.log('Chart API Response:', chartData);

                // Extract chart config from the response
                let chartConfig: ChartConfig | null = null;

                if (chartData.directToolResult && chartData.directToolResult.success) {
                  chartConfig = chartData.directToolResult.chartConfig;
                } else if (chartData.choices?.[0]?.message?.tool_calls?.[0]?.function?.result) {
                  const result = chartData.choices[0].message.tool_calls[0].function.result;
                  if (result.success) {
                    chartConfig = result.chartConfig;
                  }
                }

                if (chartConfig) {
                  // Add the AI response
                  pushOtherMessage(response.message.content || "Hier ist dein Diagramm:");

                  // Add a separate message with the chart
                  const chartMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: chartConfig.title || "Finanzdiagramm",
                    sender: "other",
                    timestamp: new Date(),
                    chartData: chartConfig
                  };
                  setMessages(prev => [...prev, chartMessage]);
                  return; // Exit early since we've handled the response
                } else {
                  console.error('Failed to extract chart config from response');
                }
              } else {
                console.error('Chart API request failed:', chartResponse.status);
              }
            } catch (error) {
              console.error('Error processing chart tool call:', error);
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
          content: "Hallo! Ich bin Fin, dein Finanzassistent. Ich kann dir bei der Budgetverfolgung, Ausgabenanalyse und Finanzplanung helfen. Frag mich nach deinem monatlichen Budget oder wie viel Geld du diesen Monat noch übrig hast!",
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



  const handleBackButtonClick = () => {
    setShowDetailView(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="pt-2 pb-6">
          <div className="flex justify-between items-center mb-4">
            <Image src={Fin} alt="Fin" className="w-24 h-24 object-cover" />
            <h1 className="text-xl font-semibold text-slate-900">
              Fin.
            </h1>
            <div className="flex gap-3">
              <button
                className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
                onClick={() => setIsVoiceMode(true)}
                title="Voice Mode"
              >
                <Mic className="w-6 h-6" />
              </button>
              <button
                className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white"
                onClick={() => setShowWeeklyReview(true)}
                title="Weekly Review"
              >
                <Calendar className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area - Chat Box */}
        <div className="space-y-4">
          <div className="h-[60vh] overflow-y-auto bg-white rounded-lg p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user"
                  ? "justify-end"
                  : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${message.sender === "user"
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                    }`}
                >
                  <div className="text-sm">
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
                  {message.chartData && (
                    <div className="mt-2">
                      <Chart
                        type={message.chartData.type}
                        data={message.chartData.data}
                        title={message.chartData.title}
                        xAxisLabel={message.chartData.xAxisLabel}
                        yAxisLabel={message.chartData.yAxisLabel}
                        colors={message.chartData.colors}
                        height={300}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>
                  )}
                  <div
                    className={`text-xs mt-2 opacity-60 ${message.sender === "user"
                      ? "text-slate-200"
                      : "text-slate-500"
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-3 py-2">
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
              className="flex-1 px-4 py-5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />



            <button
              onClick={() => {
                if (input.trim() && !isProcessing) {
                  processUserMessage(input.trim());
                }
              }}
              disabled={isProcessing}
              className="px-5 py-5 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Verarbeite..." : <SendHorizonal />}
            </button>
          </div>
        </div>

        {/* Suggested Questions */}
        {showSuggestions && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-slate-600 mb-3">
              Häufige Fragen
            </h3>
            <div className="space-y-2">
              {
                [
                  { icon: BarChart3, text: "Wie viel Geld habe ich diesen Monat noch übrig?" },
                  { icon: Coffee, text: "Zeig mir meine monatliche Budgetübersicht" },
                  { icon: BarChart3, text: "Zeig mir ein Diagramm meiner Ausgaben" },
                  { icon: BarChart3, text: "Erstelle ein Kreisdiagramm meiner Ausgabenkategorien" },
                  { icon: BarChart3, text: "Zeig mir meine Sparentwicklung als Liniendiagramm" },
                  { icon: Home, text: "Wie ist mein Ausgabenstatus?" },
                  { icon: CreditCard, text: "Wie viel habe ich bisher ausgegeben?" },
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-sm transition-colors"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <div className="flex items-center gap-3">
                      <suggestion.icon className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-700">
                        {suggestion.text}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed View Overlay */}
      {showDetailView && (
        <DetailedViewOverlay
          isVisible={showDetailView}
          onClose={handleBackButtonClick}
        />
      )}

      {/* Voice Mode Overlay */}
      <VoiceMode
        isActive={isVoiceMode}
        onToggle={() => setIsVoiceMode(false)}
      />

      {/* Weekly Review Overlay */}
      {showWeeklyReview && (
        <WeeklyReview
          isVisible={showWeeklyReview}
          onClose={() => setShowWeeklyReview(false)}
        />
      )}
    </div>
  );
}
