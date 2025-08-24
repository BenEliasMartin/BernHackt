"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoice } from "@/contexts/VoiceContext";
import { VoiceInput } from "./VoiceInput";
import { callOpenAIWithTools, OpenAIToolsResponse } from "@/app/api/openai-tools/example-usage";

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
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const cancelledRef = useRef(false);

    // --- Audio unlock (to bypass autoplay restrictions) ---
    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioUnlockedRef = useRef(false);

    async function unlockAudio() {
        if (audioUnlockedRef.current) return;
        try {
            // Web Audio unlock (silent blip)
            const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (Ctx) {
                if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
                await audioCtxRef.current.resume();
                const osc = audioCtxRef.current.createOscillator();
                const gain = audioCtxRef.current.createGain();
                gain.gain.value = 0; // silent
                osc.connect(gain).connect(audioCtxRef.current.destination);
                osc.start();
                osc.stop(audioCtxRef.current.currentTime + 0.03);
            }
            audioUnlockedRef.current = true;
        } catch {
            // ignore; speechSynthesis may still work
        }
    }

    // --- TTS (no UI, fully automatic) ---
    const speak = async (text: string) => {
        if (!("speechSynthesis" in window)) {
            onSpeakEnd();
            return;
        }

        await unlockAudio();

        // Wait for voices (Safari/Chrome async quirk)
        await new Promise<void>((resolve) => {
            const synth = window.speechSynthesis;
            const voices = synth.getVoices();
            if (voices && voices.length) return resolve();
            const id = setTimeout(resolve, 250);
            (window as any).speechSynthesis.onvoiceschanged = () => {
                clearTimeout(id);
                resolve();
            };
        });

        try {
            window.speechSynthesis.cancel();
        } catch { }

        const u = new SpeechSynthesisUtterance(text);
        // Prefer German voice if available; otherwise system default
        const voices = window.speechSynthesis.getVoices();
        const deVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("de"));
        if (deVoice) u.voice = deVoice;
        u.lang = deVoice?.lang || "de-DE";
        u.rate = 1;
        u.pitch = 1;

        u.onend = () => onSpeakEnd();
        u.onerror = () => onSpeakEnd();

        try {
            window.speechSynthesis.speak(u);
        } catch {
            onSpeakEnd();
        }
    };

    // Derived flags
    const isListening = phase === "listening";
    const isSpeaking = phase === "speaking";
    const isProcessing = phase === "thinking";

    // Start/stop helpers
    const startListening = async () => {
        if (!isVoiceEnabled || !voiceService) return;
        cancelledRef.current = false;
        await unlockAudio(); // unlock on entry gesture
        setPhase("listening");
    };

    // Reset iframe loading state
    const resetIframe = () => {
        setIsIframeLoaded(false);
    };

    const stopAll = () => {
        cancelledRef.current = true;
        setAiResponse("");
        setPhase("idle");
        try {
            window.speechSynthesis?.cancel?.();
        } catch { }
    };

    // Open/close lifecycle
    useEffect(() => {
        if (isActive && isVoiceEnabled && voiceService) startListening();
        else stopAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, isVoiceEnabled, voiceService]);

    // Reset iframe when component becomes inactive
    useEffect(() => {
        if (!isActive) {
            resetIframe();
        }
    }, [isActive]);

    // Spacebar toggles (and unlock audio on gesture)
    useEffect(() => {
        if (!isActive) return;
        const onKey = async (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                await unlockAudio();
                if (phase === "idle") startListening();
                else stopAll();
            }
            if (e.code === "Escape") {
                e.preventDefault();
                stopAll();
                onToggle();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isActive, phase]);

    // User text -> LLM -> auto-speak
    const processUserMessage = async (message: string) => {
        if (!message?.trim()) return;
        setPhase("thinking");

        try {
            const aiMessages = [
                {
                    role: "system" as const,
                    content:
                        "Du bist ein knapper Voice-Only-Assistent. Antworte in 1–2 kurzen Sätzen, ohne Listen oder Markdown.",
                },
                { role: "user" as const, content: message },
            ];

            const response: OpenAIToolsResponse = await callOpenAIWithTools(aiMessages);
            const text =
                response?.message?.content?.trim() ||
                "Entschuldigung, ich habe dazu gerade keine Antwort.";
            setAiResponse(text);
            setPhase("speaking"); // triggers TTS effect below
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

    // After LLM response is ready, AUTO-PLAY (no UI)
    useEffect(() => {
        if (isSpeaking && aiResponse) {
            speak(aiResponse);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpeaking, aiResponse]);

    // TTS end -> loop back to listening
    const onSpeakEnd = () => {
        if (cancelledRef.current) return;
        setAiResponse("");
        if (isActive && isVoiceEnabled && voiceService) startListening();
        else setPhase("idle");
    };

    // Orb visuals (simple pulse based on phase)
    const orbPulse =
        phase === "listening"
            ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0px #3b82f6", "0 0 24px #3b82f6", "0 0 0px #3b82f6"] }
            : phase === "thinking"
                ? { scale: [1, 1.03, 1], boxShadow: ["0 0 0px #a855f7", "0 0 20px #a855f7", "0 0 0px #a855f7"] }
                : phase === "speaking"
                    ? { scale: [1, 1.04, 1], boxShadow: ["0 0 0px #10b981", "0 0 20px #10b981", "0 0 0px #10b981"] }
                    : { scale: [1], boxShadow: ["0 0 0px rgba(0,0,0,0.1)"] };

    return (
        <AnimatePresence>
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
                                <h1 className="text-2xl font-extralight text-gray-900 tracking-tight font-satoshi">Voice Mode</h1>
                                <motion.button
                                    onClick={() => {
                                        stopAll();
                                        onToggle();
                                    }}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Go back
                                </motion.button>
                            </motion.div>

                            {/* AI Voice Assistant */}
                            <div
                                onClick={async () => {
                                    await unlockAudio(); // ensure gesture unlock
                                    if (phase === "idle") startListening();
                                    else stopAll();
                                }}
                                role="button"
                                aria-label={phase === "idle" ? "Start voice" : "Stop voice"}
                                className="relative w-80 h-80 mx-auto"
                            >
                                {!isIframeLoaded && (
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center"
                                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                    >
                                        <div className="text-sm text-slate-600 font-medium">Loading AI Assistant...</div>
                                    </motion.div>
                                )}

                                {isActive && (
                                    <div className="w-full h-full rounded-2xl overflow-hidden">
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
                                    </div>
                                )}
                            </div>

                            {/* Hidden voice input drives the loop */}
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
                                    {phase === "idle" && "Idle — tap the orb or press SPACE"}
                                    {phase === "listening" && "Listening... (speak now)"}
                                    {phase === "thinking" && "Thinking..."}
                                    {phase === "speaking" && "Speaking..."}
                                </div>
                            </motion.div>

                            {/* Invisible animated pulse for the assistant - only when iframe is loaded */}
                            {isIframeLoaded && (
                                <motion.div
                                    className="pointer-events-none fixed inset-0"
                                    animate={orbPulse}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}