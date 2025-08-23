"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { AudioRecorder, VoiceService, TranscriptionResult } from '@/lib/voice-services';

interface VoiceInputProps {
    onTranscriptionComplete: (text: string) => void;
    onError: (error: string) => void;
    voiceService: VoiceService;
    disabled?: boolean;
}

export function VoiceInput({
    onTranscriptionComplete,
    onError,
    voiceService,
    disabled = false
}: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const audioRecorderRef = useRef<AudioRecorder | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setIsRecording(true);
            audioRecorderRef.current = new AudioRecorder();
            await audioRecorderRef.current.startRecording();
        } catch (error) {
            setIsRecording(false);
            onError(error instanceof Error ? error.message : 'Aufnahme konnte nicht gestartet werden');
        }
    }, [onError]);

    const stopRecording = useCallback(async () => {
        if (!audioRecorderRef.current) return;

        try {
            setIsRecording(false);
            setIsProcessing(true);

            const audioBlob = await audioRecorderRef.current.stopRecording();

            // Transcribe the audio
            const transcription = await voiceService.transcribeAudio(audioBlob);

            if (transcription.text.trim()) {
                console.log('Transcription successful:', transcription.text);
                onTranscriptionComplete(transcription.text);
            } else {
                onError('Keine Sprache erkannt. Bitte versuche es erneut.');
            }
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Audio konnte nicht transkribiert werden');
        } finally {
            setIsProcessing(false);
            audioRecorderRef.current = null;
        }
    }, [voiceService, onTranscriptionComplete, onError]);

    const handleClick = useCallback(() => {
        if (disabled || isProcessing) return;

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [disabled, isProcessing, isRecording, startRecording, stopRecording]);

    return (
        <div className="relative">
            <motion.button
                onClick={handleClick}
                disabled={disabled || isProcessing}
                className={`
          relative p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${disabled || isProcessing
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isRecording
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }
        `}
                whileTap={{ scale: 0.95 }}
                whileHover={!disabled && !isProcessing ? { scale: 1.05 } : {}}
            >
                <AnimatePresence mode="wait">
                    {isProcessing ? (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center"
                        >
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </motion.div>
                    ) : isRecording ? (
                        <motion.div
                            key="recording"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center"
                        >
                            <Square className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center justify-center"
                        >
                            <Mic className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Recording indicator */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full"
                    >
                        <motion.div
                            className="w-full h-full bg-red-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Processing indicator */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
                    >
                        Transkribiere...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default VoiceInput;
