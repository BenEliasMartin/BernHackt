"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface DetailedViewOverlayProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function DetailedViewOverlay({ isVisible, onClose }: DetailedViewOverlayProps) {
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);

    // Reset iframe loading state when visibility changes
    useEffect(() => {
        if (!isVisible) {
            setIsIframeLoaded(false);
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
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
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700" />
                        </motion.button>
                        <h1 className="text-4xl font-extrabold tracking-tighter text-gray-900 font-satoshi">
                            Financial Details
                        </h1>
                    </motion.div>

                    {/* 3D Model Iframe */}
                    <motion.div
                        className="flex justify-center relative"
                        initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                        animate={{
                            scale: isIframeLoaded ? 1 : 0.9,
                            opacity: 1,
                            rotateY: 0,
                        }}
                        transition={{
                            delay: 0.3,
                            duration: 0.6,
                            ease: [0.25, 0.1, 0.25, 1],
                        }}
                    >
                        <div className="w-32 h-32 relative">
                            {!isIframeLoaded && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                />
                            )}

                            {isVisible && (
                                <motion.div className="w-full h-full rounded-2xl overflow-hidden">
                                    <iframe
                                        src="https://my.spline.design/aivoiceassistant80s-XffkteQIC4MsraQHDQKep5Nc/"
                                        frameBorder="0"
                                        width="100%"
                                        height="100%"
                                        onLoad={() => setIsIframeLoaded(true)}
                                        style={{
                                            border: 'none',
                                            borderRadius: '16px',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
