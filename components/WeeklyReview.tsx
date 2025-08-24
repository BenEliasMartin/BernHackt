"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
    TrendingUp,
    Target,
    CreditCard,
    Award,
    Coins,
    Calendar,
    ArrowRight,
    Star,
    Zap,
    Coffee,
    Home,
    Car,
    ShoppingCart
} from "lucide-react";
// Removed Spline import - using iframe instead

// Purchase prediction interfaces
interface PurchasePrediction {
  mostLikelyPurchase: {
    merchant: string
    category: string
    amount: number
    confidence: number
    probability: number
  }
  topPredictions: Array<{
    merchant: string
    category: string
    amount: number
    confidence: number
    frequency: number
  }>
  insights: {
    totalPredictedSpending: number
    averageTransactionAmount: number
    mostFrequentCategory: string
    mostFrequentMerchant: string
    spendingPattern: string
  }
}

interface WeeklyReviewProps {
    isVisible: boolean;
    onClose: () => void;
}

// Custom BlurFadeIn Text Animation Component
interface BlurFadeInProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
}

const BlurFadeIn = ({ text, className = "", delay = 0, duration = 0.8 }: BlurFadeInProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay * 1000);
        return () => clearTimeout(timer);
    }, [delay]);

    const characters = text.split("");

    return (
        <div className={`overflow-hidden ${className}`}>
            {characters.map((char, i) => (
                <motion.span
                    key={i}
                    initial={{
                        opacity: 0,
                        filter: "blur(10px)",
                        y: 20
                    }}
                    animate={isVisible ? {
                        opacity: 1,
                        filter: "blur(0px)",
                        y: 0
                    } : {}}
                    transition={{
                        duration: duration,
                        delay: (i * 0.03) + delay,
                        ease: [0.25, 0.1, 0.25, 1]
                    }}
                    className="inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

// Financial data mock (in real app, this would come from props/API)
const weeklyData = {
    period: "18. - 24. August 2025",
    totalSpent: 486.50,
    budgetUsed: 67,
    savingsGoal: {
        target: 5000,
        current: 3240,
        weeklyProgress: 180
    },
    topCategories: [
        { name: "Food & Dining", amount: 127.30, icon: Coffee, color: "#f59e0b" },
        { name: "Transportation", amount: 89.60, icon: Car, color: "#3b82f6" },
        { name: "Housing", amount: 156.80, icon: Home, color: "#10b981" }
    ],
    achievements: [
        { title: "Sparmeister", description: "Unter Budget geblieben", icon: Award },
        { title: "Ziel-Verfolger", description: "Japan-Fund aufgestockt", icon: Target },
        { title: "Ausgaben-Held", description: "Nur dreimal auswärts gegessen", icon: Star }
    ],
    challenges: [
        { title: "Coffee Challenge", description: "fünf Tage ohne Starbucks", progress: 71, reward: "fünfzehn Franken gespart" },
        { title: "Transport Challenge", description: "dreimal zu Fuß gegangen", progress: 100, reward: "acht Franken gespart" }
    ]
};

export default function WeeklyReview({ isVisible, onClose }: WeeklyReviewProps) {
    const [currentSection, setCurrentSection] = useState(0);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // ElevenLabs TTS
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Purchase prediction state
    const [prediction, setPrediction] = useState<PurchasePrediction | null>(null)
    const [predictionLoading, setPredictionLoading] = useState(false)

    // Fetch purchase prediction
    const fetchPurchasePrediction = async () => {
        setPredictionLoading(true)
        try {
            console.log('🔮 Fetching purchase prediction for weekly review...')
            const response = await fetch('/api/predict-purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    modelType: 'small',
                    useMockModel: true,
                    userId: 'test-user-123'
                })
            })

            const result = await response.json()
            if (result.success && result.data) {
                setPrediction(result.data)
                console.log('✅ Purchase prediction loaded:', result.data.mostLikelyPurchase)
            } else {
                console.warn('⚠️ Failed to load prediction, using fallback')
                setPrediction(result.fallbackPrediction || null)
            }
        } catch (error) {
            console.error('❌ Error fetching purchase prediction:', error)
        } finally {
            setPredictionLoading(false)
        }
    }

    // Generate randomized prediction sentence
    const generatePredictionSentence = (pred: PurchasePrediction): string => {
        const { merchant, category, amount, confidence } = pred.mostLikelyPurchase
        const formattedAmount = `${amount.toFixed(2)} Franken`
        const confidencePercent = Math.round(confidence * 100)
        
        const templates = [
            `Übrigens, meine Kristallkugel sagt mir, dass du wahrscheinlich bald bei ${merchant} etwa ${formattedAmount} ausgeben wirst. Bin mir zu ${confidencePercent}% sicher!`,
            `Ach, bevor ich es vergesse: Ich wette, dein nächster Einkauf wird bei ${merchant} sein - so um die ${formattedAmount}. Meine Vorhersage-Genauigkeit liegt bei ${confidencePercent}%!`,
            `Kleine Vorhersage gefällig? Du wirst höchstwahrscheinlich bald ${formattedAmount} bei ${merchant} lassen. Vertraue mir, ich liege zu ${confidencePercent}% richtig!`,
            `Mein Algorithmus flüstert mir zu, dass ${merchant} demnächst ${formattedAmount} von dir sehen wird. Konfidenz-Level: ${confidencePercent}%!`,
            `Psst, ich verrate dir ein Geheimnis: Dein Portemonnaie wird bald um ${formattedAmount} leichter - und zwar bei ${merchant}. Bin mir zu ${confidencePercent}% sicher!`,
            `Moment mal, da ist noch was! Meine KI-Sensoren zeigen: ${merchant} wartet auf dich mit einer Rechnung von etwa ${formattedAmount}. Trefferquote: ${confidencePercent}%!`,
            `Ach ja, fast vergessen: Du wirst vermutlich bald ${formattedAmount} bei ${merchant} ausgeben. Das sagt zumindest meine ${confidencePercent}%-ige Vorhersage!`
        ]
        
        return templates[Math.floor(Math.random() * templates.length)]
    }

    const sections = [
        "intro",
        "spending",
        "goals",
        "achievements",
        "challenges",
        "nextWeek"
    ];

    // Generate narration texts dynamically with purchase prediction
    const getNarrationTexts = () => {
        const baseIntro = "Na, da bist du ja wieder! Zeit für deine wöchentliche Finanz-Folter... äh, ich meine Expedition! Lass uns mal schauen, was du diese Woche wieder angestellt hast."
        const predictionText = prediction ? ` ${generatePredictionSentence(prediction)}` : ""
        
        return [
            baseIntro + predictionText,
            `Oh Mann, oh Mann! Du hast diese Woche wieder ordentlich auf den Putz gehauen mit sage und schreibe vierhundertsechsundachtzig Franken und fünfzig Rappen! Aber hey, immerhin bist du nur bei siebenundsechzig Prozent deines Budgets - das ist ja fast schon sparsam für dich!`,
            "Jetzt wird es interessant! Dein Japan-Fund wächst tatsächlich. Wer hätte das gedacht? Du fügst jede Woche ein paar Franken hinzu, und langsam aber sicher kommst du deinem Traumziel näher. Nicht schlecht, nicht schlecht!",
            "Zeit für eine kleine Siegesfeier! Diese Woche warst du tatsächlich ein Finanz-Champion. Du hast nicht nur gespart, sondern auch bewiesen, dass du deine Ziele im Griff hast. Das ist ja mal eine Überraschung!",
            "Und hier kommt der Höhepunkt! Deine Challenges laufen überraschenderweise wie ein gut geölter Motor. Du bleibst motiviert und sparst dabei auch noch echtes Geld. Wer hätte das von dir erwartet?",
            "Das war ja mal eine Reise voller Überraschungen! Du bist bereit für die nächste Woche, und weißt was? Jeder Fortschritt bringt dich Japan ein Stück näher. Du baust dir deine Zukunft, eine Woche nach der anderen - auch wenn es manchmal langsam vorangeht!"
        ]
    }

    useEffect(() => {
        if (!isVisible) {
            setIsIframeLoaded(false);
            setCurrentSection(0);
            setShowContent(false);
            setPrediction(null);
        } else {
            // Fetch purchase prediction first
            fetchPurchasePrediction();
            
            // Start the review sequence
            const timer = setTimeout(() => setShowContent(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // Auto-advance sections - now waits for narration to finish
    useEffect(() => {
        if (!showContent || !isVisible) return;

        // Start narration for current section only once
        const narrationTimer = setTimeout(() => {
            if (!isPlaying) { // Only start if not already playing
                const texts = getNarrationTexts();
                speakWithElevenLabs(texts[currentSection]);
            }
        }, 500);

        return () => clearTimeout(narrationTimer);
    }, [currentSection, showContent, isVisible, prediction]); // Added prediction dependency

    // ElevenLabs TTS function
    const speakWithElevenLabs = async (text: string) => {
        try {
            const response = await fetch('/api/elevenlabs-tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // German voice
                    model_id: 'eleven_multilingual_v2' // Use multilingual model for German
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('ElevenLabs TTS error:', error);
            console.error('Error details:', {
                text: text,
                voice_id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
                model_id: 'eleven_multilingual_v2'
            });
        }
    };

    // Function to advance to next section when audio finishes
    const advanceToNextSection = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
        } else {
            onClose();
        }
    };

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current && audioRef.current.src) {
                URL.revokeObjectURL(audioRef.current.src);
            }
        };
    }, []);



    const nextSection = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
        } else {
            onClose();
        }
    };

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
                <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    {/* Background Effects */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20"
                        animate={{
                            background: [
                                "linear-gradient(45deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2), rgba(16,185,129,0.2))",
                                "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(16,185,129,0.2), rgba(168,85,247,0.2))",
                                "linear-gradient(45deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2), rgba(16,185,129,0.2))"
                            ]
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                    />

                    {/* Progress Indicator - Moved to Top */}
                    <motion.div
                        className="absolute top-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                    >
                        {sections.map((_, index) => (
                            <motion.div
                                key={index}
                                className={`h-1 rounded-full transition-all duration-500 cursor-pointer ${index === currentSection
                                    ? "bg-white w-8"
                                    : index < currentSection
                                        ? "bg-white/60 w-6"
                                        : "bg-white/30 w-4"
                                    }`}
                                onClick={() => setCurrentSection(index)}
                                title={`Phase ${index + 1}: ${sections[index]}`}
                            />
                        ))}
                    </motion.div>

                    {/* Narration Progress Indicator */}
                    <motion.div
                        className="absolute top-32 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-satoshi z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        {isPlaying ? "🎙️ Erzählung läuft..." : "⏸️ Warte auf Erzählung..."}
                    </motion.div>

                    {/* Skip Button */}
                    <motion.button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors font-satoshi z-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        whileHover={{ scale: 1.1 }}
                    >
                        Überspringen
                    </motion.button>

                    {/* AI Character */}
                    <motion.div
                        className="absolute top-32 left-1/2 transform -translate-x-1/2"
                        initial={{ scale: 0.5, opacity: 0, y: -50 }}
                        animate={{ scale: 0.8, opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1, type: "spring" }}
                    >
                        <div className="w-48 h-48 relative">
                            {!isIframeLoaded && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center"
                                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                >
                                    <div className="text-xs text-white/70 font-medium text-center">Loading...</div>
                                </motion.div>
                            )}

                            {isVisible && (
                                <div className="w-full h-full rounded-2xl overflow-hidden">
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
                                </div>
                            )}
                        </div>

                        {/* Hidden audio element for TTS */}
                        <audio
                            ref={audioRef}
                            onEnded={() => {
                                setIsPlaying(false);
                                // Advance to next section when audio finishes
                                advanceToNextSection();
                            }}
                            onError={() => {
                                setIsPlaying(false);
                                console.error('Audio playback error, advancing to next section');
                                advanceToNextSection();
                            }}
                            onLoadStart={() => setIsPlaying(true)}
                            onCanPlay={() => setIsPlaying(true)}
                            style={{ display: 'none' }}
                        />
                    </motion.div>

                    {/* Main Content */}
                    <div className="max-w-md w-full relative z-10 mt-40">
                        <AnimatePresence mode="wait">
                            {showContent && (
                                <motion.div
                                    key={currentSection}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                                    className="text-center space-y-6"
                                >
                                    {/* Intro Section */}
                                    {currentSection === 0 && (
                                        <div className="space-y-4">
                                            <BlurFadeIn
                                                text="Deine Woche in Zahlen"
                                                className="text-3xl font-bold text-white font-satoshi"
                                                delay={0.2}
                                            />
                                            <BlurFadeIn
                                                text={weeklyData.period}
                                                className="text-lg text-white/80 font-satoshi"
                                                delay={0.8}
                                            />
                                            
                                            {/* Purchase Prediction Visual */}
                                            {prediction && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.2, duration: 0.6 }}
                                                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mx-4 border border-white/20"
                                                >
                                                    <div className="flex items-center justify-center gap-2 mb-2">
                                                        <ShoppingCart className="h-4 w-4 text-purple-300" />
                                                        <span className="text-sm text-white/80 font-medium">KI-Vorhersage</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-white font-semibold">
                                                            {prediction.mostLikelyPurchase.merchant}
                                                        </div>
                                                        <div className="text-purple-200 text-sm">
                                                            ~CHF {prediction.mostLikelyPurchase.amount.toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-white/60 mt-1">
                                                            {Math.round(prediction.mostLikelyPurchase.confidence * 100)}% Konfidenz
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            
                                            {predictionLoading && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-white/60 text-sm flex items-center justify-center gap-2"
                                                >
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white/60" />
                                                    Vorhersage wird geladen...
                                                </motion.div>
                                            )}
                                            
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                                                className="w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded-full"
                                            />
                                        </div>
                                    )}

                                    {/* Spending Section */}
                                    {currentSection === 1 && (
                                        <div className="space-y-6">
                                            <BlurFadeIn
                                                text="Du hast diese Woche"
                                                className="text-xl text-white/90 font-satoshi"
                                                delay={0.1}
                                            />
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.8, type: "spring" }}
                                                className="text-5xl font-bold text-white font-satoshi"
                                            >
                                                {weeklyData.totalSpent} Franken
                                            </motion.div>
                                            <BlurFadeIn
                                                text="ausgegeben"
                                                className="text-xl text-white/90 font-satoshi"
                                                delay={1.2}
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${weeklyData.budgetUsed}%` }}
                                                transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
                                                className="h-2 bg-white rounded-full mx-auto"
                                                style={{ maxWidth: '200px' }}
                                            />
                                            <BlurFadeIn
                                                text={`${weeklyData.budgetUsed}% deines Budgets`}
                                                className="text-base text-white/70 font-satoshi"
                                                delay={2.2}
                                            />
                                        </div>
                                    )}

                                    {/* Goals Section */}
                                    {currentSection === 2 && (
                                        <div className="space-y-6">
                                            <BlurFadeIn
                                                text="Japan-Fund Update"
                                                className="text-2xl font-bold text-white font-satoshi"
                                                delay={0.1}
                                            />
                                            <motion.div
                                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.6, duration: 0.8 }}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-white/80 font-satoshi">{weeklyData.savingsGoal.current} Franken</span>
                                                    <span className="text-white/80 font-satoshi">{weeklyData.savingsGoal.target} Franken</span>
                                                </div>
                                                <motion.div
                                                    className="w-full h-3 bg-white/20 rounded-full mb-4"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 1 }}
                                                >
                                                    <motion.div
                                                        className="h-full  rounded-full bg-white"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(weeklyData.savingsGoal.current / weeklyData.savingsGoal.target) * 100}%` }}
                                                        transition={{ delay: 1.2, duration: 2, ease: "easeOut" }}
                                                    />
                                                </motion.div>
                                                <BlurFadeIn
                                                    text={`+${weeklyData.savingsGoal.weeklyProgress} Franken diese Woche`}
                                                    className="text-green-300 font-semibold font-satoshi"
                                                    delay={2}
                                                />
                                            </motion.div>
                                        </div>
                                    )}

                                    {/* Achievements Section */}
                                    {currentSection === 3 && (
                                        <div className="space-y-6">
                                            <BlurFadeIn
                                                text="Deine Erfolge"
                                                className="text-2xl font-bold text-white font-satoshi"
                                                delay={0.1}
                                            />
                                            <div className="space-y-3">
                                                {weeklyData.achievements.map((achievement, index) => (
                                                    <motion.div
                                                        key={index}
                                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center gap-4"
                                                        initial={{ x: -50, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.5 + (index * 0.2), duration: 0.6 }}
                                                    >
                                                        <achievement.icon className="w-8 h-8 text-yellow-400" />
                                                        <div className="text-left">
                                                            <h4 className="text-white font-semibold font-satoshi">{achievement.title}</h4>
                                                            <p className="text-white/70 text-sm">{achievement.description}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Challenges Section */}
                                    {currentSection === 4 && (
                                        <div className="space-y-6">
                                            <BlurFadeIn
                                                text="Challenge Status"
                                                className="text-2xl font-bold text-white font-satoshi"
                                                delay={0.1}
                                            />
                                            <div className="space-y-4">
                                                {weeklyData.challenges.map((challenge, index) => (
                                                    <motion.div
                                                        key={index}
                                                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: 0.5 + (index * 0.3), duration: 0.6 }}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="text-white font-semibold font-satoshi">{challenge.title}</h4>
                                                            <span className="text-white/80 text-sm">{challenge.progress}%</span>
                                                        </div>
                                                        <motion.div
                                                            className="w-full h-2 bg-white/20 rounded-full mb-2"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 1 + (index * 0.3) }}
                                                        >
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${challenge.progress}%` }}
                                                                transition={{ delay: 1.2 + (index * 0.3), duration: 1.5, ease: "easeOut" }}
                                                            />
                                                        </motion.div>
                                                        <p className="text-white/70 text-sm">{challenge.reward}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Next Week Section */}
                                    {currentSection === 5 && (
                                        <div className="space-y-6">
                                            <BlurFadeIn
                                                text="Bereit für nächste Woche?"
                                                className="text-2xl font-bold text-white font-satoshi"
                                                delay={0.1}
                                            />
                                            <BlurFadeIn
                                                text="Deine Fortschritte bringen dich Japan immer näher!"
                                                className="text-lg text-white/80 font-satoshi"
                                                delay={0.8}
                                            />
                                            <motion.button
                                                onClick={onClose}
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-semibold font-satoshi flex items-center gap-2 mx-auto shadow-lg"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 1.5, type: "spring" }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Weiter zum Dashboard
                                                <ArrowRight className="w-5 h-5" />
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
