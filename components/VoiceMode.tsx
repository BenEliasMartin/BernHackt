"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useVoice } from "@/contexts/VoiceContext";
import { VoiceInput } from "./VoiceInput";
import { VoiceOutput } from "./VoiceOutput";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

type Phase = "idle" | "listening" | "thinking" | "speaking";

interface VoiceModeProps {
    isActive: boolean;
    onToggle: () => void;
}

const ANIMATION_CONFIG = {
    spring: { type: "spring" as const, damping: 20, stiffness: 300 },
    duration: { medium: 0.5 },
    easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export default function VoiceMode({ isActive, onToggle }: VoiceModeProps) {
    const { voiceService, isVoiceEnabled, error: voiceError } = useVoice();

    const [phase, setPhase] = useState<Phase>("idle");
    const [aiResponse, setAiResponse] = useState("");
    const outputRef = useRef<HTMLDivElement>(null);
    const cancelledRef = useRef(false);
    const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

    const isListening = phase === "listening";
    const isSpeaking = phase === "speaking";
    const isProcessing = phase === "thinking";

    // Start/stop helpers
    const startListening = () => {
        if (!isVoiceEnabled || !voiceService) return;
        cancelledRef.current = false;
        setPhase("listening");
    };

    const stopAll = () => {
        cancelledRef.current = true;
        setAiResponse("");
        setPhase("idle");
        try { window.speechSynthesis?.cancel?.(); } catch { }
    };

    // Open/close lifecycle
    useEffect(() => {
        if (isActive && isVoiceEnabled && voiceService) startListening();
        else stopAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, isVoiceEnabled, voiceService]);

    // Spacebar toggle
    useEffect(() => {
        if (!isActive) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                if (phase === "idle") startListening();
                else stopAll();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isActive, phase]);

    // Core: user text -> LLM -> speak
    const processUserMessage = async (message: string) => {
        if (!message?.trim()) return;
        setPhase("thinking");

        try {
            const aiMessages = [
                {
                    role: "system" as const,
                    content: "Du bist ein knapper Voice-Only-Assistent. Antworte in 1–2 kurzen Sätzen, ohne Listen oder Markdown.",
                },
                { role: "user" as const, content: message },
            ];

            const response: OpenAIToolsResponse = await callOpenAIWithTools(aiMessages);

            const text =
                response?.message?.content?.trim() ||
                "Entschuldigung, ich habe dazu gerade keine Antwort.";
            setAiResponse(text);
            setPhase("speaking");
        } catch {
            setAiResponse("Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es erneut.");
            setPhase("speaking");
        }
    };

    // VoiceInput -> transcription handler
    const handleVoiceInput = (text: string) => {
        if (isProcessing || isSpeaking) return;
        processUserMessage(text);
    };

    const handleVoiceError = () => {
        if (isActive) startListening();
    };

    // VoiceOutput completion -> back to listening
    const onSpeakEnd = () => {
        if (cancelledRef.current) return;
        setAiResponse("");
        if (isActive && isVoiceEnabled && voiceService) startListening();
        else setPhase("idle");
    };

    // Fallback: if VoiceOutput renders an <audio>, hook its 'ended'
    useEffect(() => {
        if (!isSpeaking || !outputRef.current) return;
        const audio = outputRef.current.querySelector("audio");
        if (!audio) return;
        const handleEnded = () => onSpeakEnd();
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpeaking]);

    // ADD this effect (autoplay on ready)
    useEffect(() => {
        if (!isSpeaking || !aiResponse) return;

        // Try to auto-play VoiceOutput's <audio> if it exists
        const tryPlayAudio = () => {
            const audio = outputRef.current?.querySelector("audio") as HTMLAudioElement | null;
            if (!audio) return false;
            // ensure we start fresh
            try { audio.currentTime = 0; } catch { }
            audio.play().catch(() => {/* ignore; fallback below */ });
            return true;
        };

        const played = tryPlayAudio();

        // Fallback: Web Speech API (no UI)
        if (!played && "speechSynthesis" in window) {
            try { window.speechSynthesis.cancel(); } catch { }
            const u = new SpeechSynthesisUtterance(aiResponse);
            ttsRef.current = u;
            u.onend = () => onSpeakEnd();
            try { window.speechSynthesis.speak(u); } catch { onSpeakEnd(); }
        }

        return () => {
            // cleanup any pending TTS if we unmount or phase changes
            try { window.speechSynthesis?.cancel?.(); } catch { }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpeaking, aiResponse]);



    return (
        <div>
            {isActive && (
                <motion.div
                    className="fixed inset-0 z-50 bg-white"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
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
                                    onClick={() => {
                                        onToggle();
                                        stopAll();
                                    }}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Go back
                                </motion.button>
                            </motion.div>

                            {/* Orb (Spline) */}
                            <Spline scene="https://prod.spline.design/taUkTGq1sFMZ-Aem/scene.splinecode" />

                            {/* Hidden voice components drive the loop */}
                            {isVoiceEnabled && voiceService ? (
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
                                        <div ref={outputRef}>
                                            <VoiceOutput
                                                text={aiResponse}
                                                voiceService={voiceService}
                                                // @ts-ignore optional prop if your component supports it
                                                onEnd={onSpeakEnd}
                                                disabled={false}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-xs text-gray-500 text-center mt-4">
                                    Voice unavailable{voiceError ? `: ${voiceError}` : ""}
                                </div>
                            )}

                            {/* Status */}
                            <motion.div
                                className="space-y-3 mt-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: ANIMATION_CONFIG.duration.medium }}
                            >
                                <div className="text-xs text-gray-500 text-center">
                                    {phase === "idle" && "Idle — tap SPACE"}
                                    {phase === "listening" && "Listening... (speak now)"}
                                    {phase === "thinking" && "Thinking..."}
                                    {phase === "speaking" && "Speaking..."}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}