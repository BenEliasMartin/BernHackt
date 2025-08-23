"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { VoiceService, VoiceConfig } from '@/lib/voice-services';

interface VoiceContextType {
    voiceService: VoiceService | null;
    isVoiceEnabled: boolean;
    error: string | null;
}

const VoiceContext = createContext<VoiceContextType>({
    voiceService: null,
    isVoiceEnabled: false,
    error: null,
});

export const useVoice = () => useContext(VoiceContext);

interface VoiceProviderProps {
    children: React.ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
    const [voiceService, setVoiceService] = useState<VoiceService | null>(null);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeVoiceService = async () => {
            try {
                // Get API keys from environment variables
                const elevenLabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
                const elevenLabsVoiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;



                if (!elevenLabsApiKey) {
                    setError('ElevenLabs API key not found. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to your environment variables.');
                    return;
                }

                if (!elevenLabsVoiceId) {
                    setError('ElevenLabs Voice ID not found. Please add NEXT_PUBLIC_ELEVENLABS_VOICE_ID to your environment variables.');
                    return;
                }

                // Create voice service configuration
                const config: VoiceConfig = {
                    elevenLabsApiKey,
                    elevenLabsVoiceId,
                };

                // Initialize voice service
                const service = new VoiceService(config);
                setVoiceService(service);
                setIsVoiceEnabled(true);
                setError(null);

                console.log('Voice service initialized successfully');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to initialize voice service';
                setError(errorMessage);
                setIsVoiceEnabled(false);
                console.error('Voice service initialization failed:', err);
            }
        };

        initializeVoiceService();
    }, []);

    const value: VoiceContextType = {
        voiceService,
        isVoiceEnabled,
        error,
    };

    return (
        <VoiceContext.Provider value={value}>
            {children}
        </VoiceContext.Provider>
    );
}
