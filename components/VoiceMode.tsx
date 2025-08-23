"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { VoiceInput } from "./VoiceInput";
import { VoiceOutput } from "./VoiceOutput";
import { useVoice } from "@/contexts/VoiceContext";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";

interface VoiceModeProps {
    isActive: boolean;
    onToggle: () => void;
}

const ANIMATION_CONFIG = {
    spring: {
        type: "spring" as const,
        damping: 20,
        stiffness: 300,
    },
    duration: {
        medium: 0.5,
    },
    easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export default function VoiceMode({ isActive, onToggle }: VoiceModeProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [aiResponse, setAiResponse] = useState("");
    const voiceOutputRef = useRef<HTMLDivElement>(null);

    // Voice functionality
    const { voiceService, isVoiceEnabled } = useVoice();

    // Auto-trigger speech when speaking state becomes true
    useEffect(() => {
        if (isSpeaking && voiceOutputRef.current && aiResponse) {
            // Find the play button and click it automatically
            const playButton = voiceOutputRef.current.querySelector('button');
            if (playButton) {
                setTimeout(() => {
                    playButton.click();
                }, 100);
            }
        }
    }, [isSpeaking, aiResponse]);

    // Monitor audio completion
    useEffect(() => {
        if (isSpeaking && voiceOutputRef.current) {
            const audioElement = voiceOutputRef.current.querySelector('audio');
            if (audioElement) {
                const handleAudioEnded = () => {
                    setIsSpeaking(false);
                    setAiResponse("");
                };

                audioElement.addEventListener('ended', handleAudioEnded);
                return () => audioElement.removeEventListener('ended', handleAudioEnded);
            }
        }
    }, [isSpeaking]);

    const processUserMessage = async (message: string) => {
        setIsListening(false);
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
                            // For now, just use the response text since we can't display widgets in voice mode
                            setAiResponse(response.message.content || "Hier ist deine Budgetübersicht für diesen Monat.");
                            setIsSpeaking(true);
                            return;
                        } catch (error) {
                            console.error('Error parsing tool arguments:', error);
                        }
                    }
                }
            }

            // Set AI response for voice output
            setAiResponse(response.message.content || 'Ich entschuldige mich, aber ich konnte zu diesem Zeitpunkt keine Antwort generieren.');
            setIsSpeaking(true);

        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            setAiResponse('Entschuldigung, ich bin auf einen Fehler gestoßen. Bitte versuche es erneut.');
            setIsSpeaking(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoiceInput = (text: string) => {
        // Process the transcribed text through OpenAI API
        processUserMessage(text);
    };

    const handleVoiceError = (error: string) => {
        console.error('Voice input error:', error);
        setIsListening(false);
    };

    const handleVoiceOutputComplete = () => {
        setIsSpeaking(false);
        setAiResponse("");
    };

    const handleCircleClick = () => {
        if (isVoiceEnabled && voiceService && !isSpeaking && !isProcessing) {
            if (isListening) {
                // Stop listening if already listening
                setIsListening(false);
            } else {
                // Start listening if not listening
                setIsListening(true);
            }
        }
    };

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-50 bg-white"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={ANIMATION_CONFIG.spring}
                >
                    <div className="min-h-screen bg-white">
                        <div className="max-w-md mx-auto p-6">
                            {/* Header */}
                            <motion.div
                                className="pt-8 pb-6 flex items-center justify-between"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <h1 className="text-2xl font-extralight text-gray-900 tracking-tight">Voice Mode</h1>
                                <motion.button
                                    onClick={onToggle}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Mic className="h-5 w-5 text-gray-700" />
                                </motion.button>
                            </motion.div>

                            {/* Interactive Pulsating Circle */}
                            <motion.div
                                className="flex justify-center mb-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <div className="relative">
                                    <motion.div
                                        className={`w-48 h-48 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isListening
                                            ? 'bg-gradient-to-br from-red-100 to-pink-100'
                                            : isSpeaking
                                                ? 'bg-gradient-to-br from-green-100 to-blue-100'
                                                : isProcessing
                                                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100'
                                                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                                            }`}
                                        animate={{
                                            scale: isListening
                                                ? [1, 1.2, 1]
                                                : isSpeaking
                                                    ? [1, 1.05, 1]
                                                    : isProcessing
                                                        ? [1, 1.15, 1]
                                                        : [1, 1.1, 1],
                                            opacity: isListening
                                                ? [0.8, 1, 0.8]
                                                : isSpeaking
                                                    ? [0.9, 1, 0.9]
                                                    : isProcessing
                                                        ? [0.7, 1, 0.7]
                                                        : [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            duration: isListening ? 1 : isSpeaking ? 1.5 : isProcessing ? 0.8 : 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCircleClick}
                                    >
                                        <div className="text-center">
                                            {isListening ? (
                                                <>
                                                    <motion.div
                                                        className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2"
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                    />
                                                    <p className="text-xs text-red-600 font-medium">Listening...</p>
                                                </>
                                            ) : isSpeaking ? (
                                                <>
                                                    <motion.div
                                                        className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 1.2, repeat: Infinity }}
                                                    />
                                                    <p className="text-xs text-green-600 font-medium">Speaking...</p>
                                                </>
                                            ) : isProcessing ? (
                                                <>
                                                    <motion.div
                                                        className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                    />
                                                    <p className="text-xs text-yellow-600 font-medium">Processing...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse" />
                                                    <p className="text-xs text-blue-600 font-medium">Tap to Speak</p>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Hidden Voice Components */}
                            {isVoiceEnabled && voiceService && (
                                <>
                                    {isListening && (
                                        <VoiceInput
                                            onTranscriptionComplete={handleVoiceInput}
                                            onError={handleVoiceError}
                                            voiceService={voiceService}
                                            disabled={false}
                                        />
                                    )}

                                    {isSpeaking && (
                                        <div ref={voiceOutputRef}>
                                            <VoiceOutput
                                                text={aiResponse}
                                                voiceService={voiceService}
                                                disabled={false}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Quick Actions */}
                            <motion.div
                                className="space-y-3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <p className="text-sm text-gray-500 text-center mb-3">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        "Wie viel Geld habe ich noch?",
                                        "Zeig mir mein Budget",
                                        "Wie sind meine Ausgaben?",
                                        "Finanzberatung bitte"
                                    ].map((action, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => handleVoiceInput(action)}
                                            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {action}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
