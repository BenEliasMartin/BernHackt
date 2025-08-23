# 🎤 Voice Mode Setup Guide

This guide explains how to set up voice functionality for the AI financial assistant using ElevenLabs for both Speech-to-Text (STT) and Text-to-Speech (TTS).

## 🚀 What's Been Implemented

### **Voice Infrastructure:**
- ✅ **Voice Services** (`lib/voice-services.ts`) - ElevenLabs STT & TTS integration
- ✅ **Voice Input Component** (`components/VoiceInput.tsx`) - Microphone button with recording states
- ✅ **Voice Output Component** (`components/VoiceOutput.tsx`) - TTS playback controls
- ✅ **Voice Context** (`contexts/VoiceContext.tsx`) - App-wide voice service management
- ✅ **Chat Integration** - Voice input in chat, TTS for AI responses

### **Features:**
- 🎤 **Voice Input**: Click microphone to record, click again to stop
- 🔊 **Voice Output**: Play/pause and mute controls for AI responses
- 🎨 **Visual Feedback**: Recording indicators, processing states, animations
- 🔒 **Error Handling**: Graceful fallbacks and user feedback

## 🔑 Required API Keys

### **1. ElevenLabs Account Setup:**
1. Go to [ElevenLabs.io](https://elevenlabs.io/)
2. Sign up for a free account
3. Navigate to your profile to get your API key

### **2. Environment Variables:**
Create a `.env.local` file in your project root with:

```bash
# ElevenLabs API Key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_actual_api_key_here

# ElevenLabs Voice ID (choose from available voices)
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_chosen_voice_id_here
```

### **3. Voice Selection:**
Popular ElevenLabs voices you can use:
- **Rachel** (Female): `21m00Tcm4TlvDq8ikWAM`
- **Domi** (Female): `AZnzlk1XvdvUeBnXmlld`
- **Bella** (Female): `EXAVITQu4vr4xnSDxMaL`
- **Adam** (Male): `pNInz6obpgDQGcFmaJgB`
- **Josh** (Male): `yoZ06aMxZJJ28mfd3POQ`

## 🎯 How to Use

### **Voice Input:**
1. **Click the microphone button** (blue circle with mic icon)
2. **Speak your message** (button turns red with square icon)
3. **Click again to stop** recording
4. **Wait for transcription** (shows "Processing audio...")
5. **Message appears** in chat input and is sent automatically

### **Voice Output:**
1. **AI responses** automatically get voice playback controls
2. **Click play button** to hear the response
3. **Use mute button** to toggle audio on/off
4. **Controls appear** below each AI message

## 🛠️ Technical Details

### **Audio Recording:**
- **Format**: WebM with Opus codec
- **Quality**: 44.1kHz, mono, 128kbps
- **Features**: Echo cancellation, noise suppression

### **API Endpoints:**
- **STT**: `https://api.elevenlabs.io/v1/speech-to-speech`
- **TTS**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`

### **Browser Support:**
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (may need fallback)

## 🔧 Troubleshooting

### **Common Issues:**

#### **"Microphone access denied"**
- Check browser permissions
- Ensure HTTPS (required for microphone access)
- Try refreshing the page

#### **"API key not found"**
- Verify `.env.local` file exists
- Check environment variable names
- Restart development server

#### **"Voice service initialization failed"**
- Verify API key is valid
- Check ElevenLabs account status
- Ensure voice ID exists

#### **Audio not playing**
- Check browser audio settings
- Verify ElevenLabs API quota
- Check console for errors

### **Debug Steps:**
1. Open browser console (F12)
2. Look for voice-related errors
3. Check network tab for API calls
4. Verify environment variables are loaded

## 💰 Cost Considerations

### **ElevenLabs Pricing (as of 2024):**
- **Free Tier**: 10,000 characters/month
- **Starter**: $22/month for 30,000 characters
- **Creator**: $99/month for 250,000 characters
- **Independent**: $330/month for 1,000,000 characters

### **Usage Tips:**
- **STT**: ~1 minute of speech ≈ 150-200 characters
- **TTS**: ~1 minute of speech ≈ 150-200 characters
- **Budget**: Estimate your monthly usage before upgrading

## 🚀 Next Steps

### **Immediate:**
1. Get ElevenLabs API key
2. Add environment variables
3. Test voice input/output
4. Customize voice selection

### **Future Enhancements:**
- **Voice Commands**: "Go back", "Clear chat", "Show budget"
- **Continuous Listening**: Always-on voice mode
- **Voice Preferences**: Speed, pitch, accent customization
- **Offline Support**: Local voice processing fallback

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Verify API key and voice ID
4. Check ElevenLabs service status

---

**Happy voice chatting! 🎤✨**
