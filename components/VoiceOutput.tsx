"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import { VoiceService } from '@/lib/voice-services';

interface VoiceOutputProps {
    text: string;
    voiceService: VoiceService;
    disabled?: boolean;
}

export function VoiceOutput({ text, voiceService, disabled = false }: VoiceOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const generateSpeech = useCallback(async () => {
        if (!text.trim() || isLoading) return;

        try {
            setIsLoading(true);
            const result = await voiceService.synthesizeSpeech(text);
            setAudioUrl(result.audioUrl);

            // Create and play audio
            if (audioRef.current) {
                audioRef.current.src = result.audioUrl;
                audioRef.current.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Failed to generate speech:', error);
        } finally {
            setIsLoading(false);
        }
    }, [text, voiceService, isLoading]);

    const togglePlayPause = useCallback(() => {
        if (!audioRef.current || !audioUrl) {
            generateSpeech();
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, [isPlaying, audioUrl, generateSpeech]);

    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleAudioEnded = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleAudioError = useCallback(() => {
        setIsPlaying(false);
        setIsLoading(false);
        console.error('Audio playback error');
    }, []);

    // Cleanup audio URL when component unmounts
    React.useEffect(() => {
        return () => {
            if (audioUrl) {
                voiceService.cleanupAudioUrl(audioUrl);
            }
        };
    }, [audioUrl, voiceService]);

    return (
        <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <motion.button
                onClick={togglePlayPause}
                disabled={disabled || isLoading}
                className={`
          p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isPlaying
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
        `}
                whileTap={{ scale: 0.95 }}
                whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
            >
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </motion.div>
                    ) : isPlaying ? (
                        <motion.div
                            key="pause"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Pause className="h-4 w-4" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="play"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Play className="h-4 w-4" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Mute Button */}
            <motion.button
                onClick={toggleMute}
                disabled={disabled || !audioUrl}
                className={`
          p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled || !audioUrl
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isMuted
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
        `}
                whileTap={{ scale: 0.95 }}
                whileHover={!disabled && audioUrl ? { scale: 1.05 } : {}}
            >
                <AnimatePresence mode="wait">
                    {isMuted ? (
                        <motion.div
                            key="muted"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <VolumeX className="h-4 w-4" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unmuted"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            <Volume2 className="h-4 w-4" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default VoiceOutput;
