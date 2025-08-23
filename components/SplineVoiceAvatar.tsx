"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import @splinetool/react-spline with SSR disabled
// This avoids the common "async Spline / SSR" issue in Next.js App Router
const Spline = dynamic(() => import("@splinetool/react-spline"), {
    ssr: false,
    // simple inline fallback while the heavy 3D bundle loads
    loading: () => (
        <div className="w-full h-full rounded-2xl bg-gray-50 flex items-center justify-center text-sm text-gray-500">
            Loading avatar…
        </div>
    ),
});

interface SplineVoiceAvatarProps {
    isListening?: boolean;
    isSpeaking?: boolean;
    isProcessing?: boolean;
    className?: string;
    // optional scene URL so you can override it during dev / prod
    sceneUrl?: string;
}

export default function SplineVoiceAvatar({
    isListening = false,
    isSpeaking = false,
    isProcessing = false,
    className = "",
    sceneUrl = "/spline/voice-avatar.splinecode",
}: SplineVoiceAvatarProps) {
    const [loadError, setLoadError] = useState(false);

    // small status-driven scale / glow animation that complements the main UI
    const statusScale = isListening ? 1.04 : isSpeaking ? 1.02 : isProcessing ? 1.03 : 1;
    const statusPulse = isListening ? [1, 1.06, 1] : isSpeaking ? [1, 1.03, 1] : [1, 1.01, 1];

    return (
        <div className={`${className} relative overflow-hidden`}>
            {loadError ? (
                <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                    Avatar unavailable
                </div>
            ) : (
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: statusScale }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="w-full h-full"
                >
                    {/* The Spline canvas; dynamic import prevents SSR errors and removes hydration mismatches */}
                    {/* If your Spline scene uses onLoad or other props, pass them here. */}
                    <Spline
                        scene={sceneUrl}
                        onLoad={() => {
                            // no-op but useful for debugging; keep lightweight
                        }}
                        onError={(err: unknown) => {
                            // mark load error so UI can degrade gracefully
                            console.error("Spline load error:", err);
                            setLoadError(true);
                        }}
                    />

                    {/* small overlay indicator (pulsing) so avatar visually matches voice state */}
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <motion.div
                            animate={{ scale: statusPulse }}
                            transition={{ repeat: Infinity, duration: isListening ? 1 : isSpeaking ? 1.4 : 2 }}
                            className={`w-6 h-6 rounded-full ${isListening ? "bg-red-400" : isSpeaking ? "bg-green-400" : isProcessing ? "bg-yellow-400" : "bg-blue-400"
                                } shadow-md`}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
