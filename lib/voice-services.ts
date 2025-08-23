// Voice Services for AI Assistant
// Handles ElevenLabs STT and TTS integration

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export interface VoiceConfig {
    elevenLabsApiKey: string;
    elevenLabsVoiceId: string;
}

export interface TranscriptionResult {
    text: string;
    confidence: number;
    language?: string;
}

export interface TTSResult {
    audioUrl: string;
    duration: number;
}

export class VoiceService {
    private config: VoiceConfig;
    private elevenlabs: ElevenLabsClient;

    constructor(config: VoiceConfig) {
        this.config = config;
        this.elevenlabs = new ElevenLabsClient({
            apiKey: config.elevenLabsApiKey,
        });
    }

    // Speech-to-Text using ElevenLabs
    async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
        try {
            const transcription = await this.elevenlabs.speechToText.convert({
                file: audioBlob,
                modelId: "scribe_v1", // Model to use, for now only "scribe_v1" is supported
                tagAudioEvents: false, // Keep it simple for now
                languageCode: "deu", // German language
                diarize: false, // Keep it simple for now
            });

            console.log('ElevenLabs STT response:', transcription);

            // Extract text from the response - the structure might vary
            let text = '';
            if (typeof transcription === 'string') {
                text = transcription;
            } else if (transcription && typeof transcription === 'object') {
                // Try different possible property names
                text = (transcription as any).text ||
                    (transcription as any).transcription ||
                    (transcription as any).result ||
                    JSON.stringify(transcription);
            }

            return {
                text: text || 'No transcription result',
                confidence: 0.9,
                language: 'en',
            };
        } catch (error) {
            console.error('Transcription error:', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    // Text-to-Speech using ElevenLabs
    async synthesizeSpeech(text: string): Promise<TTSResult> {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.elevenLabsVoiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.config.elevenLabsApiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2', // Use multilingual model for German
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs TTS API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            return {
                audioUrl,
                duration: audioBlob.size / 16000, // Rough estimate based on typical bitrate
            };
        } catch (error) {
            console.error('TTS error:', error);
            throw new Error('Failed to synthesize speech');
        }
    }

    // Clean up audio URLs to prevent memory leaks
    cleanupAudioUrl(audioUrl: string): void {
        URL.revokeObjectURL(audioUrl);
    }
}

// Audio recording utilities
export class AudioRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;

    async startRecording(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 44100,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000,
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw new Error('Could not access microphone');
        }
    }

    stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No recording in progress'));
                return;
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.cleanup();
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    private cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording';
    }
}
