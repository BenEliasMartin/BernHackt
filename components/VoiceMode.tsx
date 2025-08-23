"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import Spline from "@splinetool/react-spline";
import { VoiceInput } from "./VoiceInput";
import { VoiceOutput } from "./VoiceOutput";
import { useVoice } from "@/contexts/VoiceContext";

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
    const [transcribedText, setTranscribedText] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [isSplineLoaded, setIsSplineLoaded] = useState(false);

    // Voice functionality
    const { voiceService, isVoiceEnabled } = useVoice();

    const handleVoiceInput = (text: string) => {
        setTranscribedText(text);

        // Simulate AI response for demo purposes
        // In a real app, this would call your AI service
        const mockResponse = `Ich habe verstanden: "${text}". Das ist eine interessante Frage zu deinen Finanzen.`;
        setAiResponse(mockResponse);

        // Auto-speak the response if voice is enabled
        if (isVoiceEnabled && voiceService) {
            // The VoiceOutput component will handle the actual speaking
        }
    };

    const handleVoiceError = (error: string) => {
        console.error('Voice input error:', error);
    };

    const handleSplineLoad = () => {
        setIsSplineLoaded(true);
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

                            {/* Spline Sprite */}
                            <motion.div
                                className="flex justify-center mb-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <div className="relative">
                                    {!isSplineLoaded && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center"
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.7, 1, 0.7]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <div className="text-center">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse" />
                                                <p className="text-xs text-blue-600 font-medium">Loading...</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="w-48 h-48">
                                        <Spline
                                            scene="https://prod.spline.design/taUkTGq1sFMZ-Aem/scene.splinecode"
                                            onLoad={handleSplineLoad}
                                            onError={(error) => console.error('Spline error:', error)}
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Voice Input */}
                            <motion.div
                                className="flex justify-center mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                {isVoiceEnabled && voiceService ? (
                                    <VoiceInput
                                        onTranscriptionComplete={handleVoiceInput}
                                        onError={handleVoiceError}
                                        voiceService={voiceService}
                                        disabled={false}
                                    />
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        <Mic className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                        <p className="text-sm">Voice service not available</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Transcribed Text */}
                            {transcribedText && (
                                <motion.div
                                    className="bg-gray-50 rounded-lg p-4 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-sm text-gray-600 mb-1">You said:</p>
                                    <p className="text-gray-900 font-medium">{transcribedText}</p>
                                </motion.div>
                            )}

                            {/* AI Response */}
                            {aiResponse && (
                                <motion.div
                                    className="bg-blue-50 rounded-lg p-4 mb-4"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="text-sm text-gray-600 mb-1">AI Response:</p>
                                    <p className="text-gray-900">{aiResponse}</p>

                                    {/* Auto-speak the response */}
                                    {isVoiceEnabled && voiceService && (
                                        <div className="mt-3">
                                            <VoiceOutput
                                                text={aiResponse}
                                                voiceService={voiceService}
                                                disabled={false}
                                            />
                                        </div>
                                    )}
                                </motion.div>
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
