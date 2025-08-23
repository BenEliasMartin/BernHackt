"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, VolumeX, Settings } from "lucide-react";
import SplineSprite from "./SplineSprite";
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
        fast: 0.3,
        medium: 0.5,
        slow: 0.8,
    },
    easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export default function VoiceMode({ isActive, onToggle }: VoiceModeProps) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcribedText, setTranscribedText] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [showSpline, setShowSpline] = useState(true);

    // Voice functionality
    const { voiceService, isVoiceEnabled, error: voiceError } = useVoice();

    const handleVoiceInput = (text: string) => {
        setTranscribedText(text);

        // Simulate AI response for demo purposes
        // In a real app, this would call your AI service
        const mockResponse = `Ich habe verstanden: "${text}". Das ist eine interessante Frage zu deinen Finanzen.`;
        setAiResponse(mockResponse);

        // Auto-speak the response if voice is enabled
        if (isVoiceEnabled && voiceService) {
            setIsSpeaking(true);
            // The VoiceOutput component will handle the actual speaking
        }
    };

    const handleVoiceError = (error: string) => {
        console.error('Voice input error:', error);
    };

    const toggleSpline = () => {
        setShowSpline(!showSpline);
    };

    return (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={ANIMATION_CONFIG.spring}
                >
                    <div className="min-h-screen p-6">
                        <div className="max-w-4xl mx-auto">
                            {/* Header */}
                            <motion.div
                                className="flex items-center justify-between mb-8"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.button
                                        onClick={onToggle}
                                        className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Mic className="h-6 w-6 text-gray-600" />
                                    </motion.button>
                                    <h1 className="text-3xl font-bold text-gray-900">Voice Mode</h1>
                                </div>

                                <div className="flex items-center gap-3">
                                    <motion.button
                                        onClick={toggleSpline}
                                        className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Settings className="h-6 w-6 text-gray-600" />
                                    </motion.button>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column - Spline Demo */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: ANIMATION_CONFIG.duration.medium }}
                                >
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">3D Visual Experience</h2>
                                        <div className="flex justify-center">
                                            {showSpline ? (
                                                <SplineSprite
                                                    sceneUrl="https://prod.spline.design/taUkTGq1sFMZ-Aem/scene.splinecode"
                                                    size="lg"
                                                    onLoad={() => console.log('Spline scene loaded in voice mode')}
                                                    onError={(error) => console.error('Spline error:', error)}
                                                />
                                            ) : (
                                                <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                                    <p className="text-gray-600 text-center">Spline Hidden<br />Click Settings to Show</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Voice Status */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Status</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Voice Service:</span>
                                                <span className={`text-sm font-medium ${isVoiceEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isVoiceEnabled ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            {voiceError && (
                                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                    Error: {voiceError}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Right Column - Voice Interface */}
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: ANIMATION_CONFIG.duration.medium }}
                                >
                                    {/* Voice Input */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Input</h3>

                                        {isVoiceEnabled && voiceService ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-center">
                                                    <VoiceInput
                                                        onTranscriptionComplete={handleVoiceInput}
                                                        onError={handleVoiceError}
                                                        voiceService={voiceService}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {transcribedText && (
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-600 mb-1">You said:</p>
                                                        <p className="text-gray-900 font-medium">{transcribedText}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 py-8">
                                                <Mic className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                <p>Voice service not available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Voice Output */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Response</h3>

                                        {aiResponse ? (
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <p className="text-gray-900">{aiResponse}</p>
                                                </div>

                                                {isVoiceEnabled && voiceService && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Auto-speak response:</span>
                                                        <VoiceOutput
                                                            text={aiResponse}
                                                            voiceService={voiceService}
                                                            disabled={isSpeaking}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500 py-8">
                                                <VolumeX className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                                <p>No response yet</p>
                                                <p className="text-sm">Use voice input to get started</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
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
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
