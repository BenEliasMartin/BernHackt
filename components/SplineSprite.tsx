"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Note: Install @splinetool/react-spline to use the actual Spline component
// npm install @splinetool/react-spline
// Then uncomment the import below and remove the placeholder Spline component

// import Spline from "@splinetool/react-spline"

interface SplineSpriteProps {
    sceneUrl: string
    size?: "sm" | "md" | "lg" | "xl" | "custom"
    customSize?: { width: number; height: number }
    className?: string
    onLoad?: () => void
    onError?: (error: Error) => void
    showLoadingState?: boolean
    loadingAnimation?: boolean
}

const sizeMap = {
    sm: { width: 96, height: 96 },    // 24 * 4
    md: { width: 144, height: 144 },  // 36 * 4
    lg: { width: 192, height: 192 },  // 48 * 4
    xl: { width: 240, height: 240 },  // 60 * 4
    custom: { width: 0, height: 0 }   // Will use customSize
}

const ANIMATION_CONFIG = {
    spring: {
        type: "spring" as const,
        damping: 25,
        stiffness: 400,
    },
    duration: {
        slow: 0.6,
    },
    easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

// Placeholder Spline component for when the package is not installed
function PlaceholderSpline({ sceneUrl, onLoad, onError }: {
    sceneUrl: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
}) {
    const [isLoaded, setIsLoaded] = useState(false)

    // Simulate loading for demo purposes
    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true)
            onLoad?.()
        }, 1000)
    }, [onLoad])

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-blue-600 font-medium">Loading Spline...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <div className="text-center text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎨</span>
                </div>
                <p className="text-sm font-medium">Spline Scene</p>
                <p className="text-xs opacity-75">Scene loaded successfully</p>
            </div>
        </div>
    )
}

export default function SplineSprite({
    sceneUrl,
    size = "lg",
    customSize,
    className = "",
    onLoad,
    onError,
    showLoadingState = true,
    loadingAnimation = true
}: SplineSpriteProps) {
    const [isSplineLoaded, setIsSplineLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    const dimensions = size === "custom" && customSize ? customSize : sizeMap[size]
    const { width, height } = dimensions

    const handleSplineLoad = () => {
        setIsSplineLoaded(true)
        onLoad?.()
    }

    const handleSplineError = (error: Error) => {
        setHasError(true)
        onError?.(error)
    }

    return (
        <motion.div
            className={`relative ${className}`}
            style={{ width, height }}
            initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
            animate={{
                scale: isSplineLoaded ? 1 : 0.9,
                opacity: 1,
                rotateY: 0,
            }}
            transition={{
                delay: 0.1,
                duration: ANIMATION_CONFIG.duration.slow,
                ease: ANIMATION_CONFIG.easing,
            }}
        >
            {/* Loading State */}
            {showLoadingState && !isSplineLoaded && !hasError && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full"
                    animate={loadingAnimation ? { opacity: [0.5, 0.8, 0.5] } : {}}
                    transition={{ duration: 2, repeat: loadingAnimation ? Number.POSITIVE_INFINITY : 0 }}
                />
            )}

            {/* Error State */}
            {hasError && (
                <motion.div
                    className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="text-center p-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-red-500 text-sm font-bold">!</span>
                        </div>
                        <p className="text-xs text-red-600 font-medium">Failed to load</p>
                    </div>
                </motion.div>
            )}

            {/* Spline Content */}
            <motion.div className="w-full h-full">
                {/* 
          To use the actual Spline component:
          1. Install: npm install @splinetool/react-spline
          2. Uncomment the import above
          3. Replace PlaceholderSpline with:
          
          <Spline
            scene={sceneUrl}
            onLoad={handleSplineLoad}
            onError={handleSplineError}
          />
        */}
                <PlaceholderSpline
                    sceneUrl={sceneUrl}
                    onLoad={handleSplineLoad}
                    onError={handleSplineError}
                />
            </motion.div>
        </motion.div>
    )
}

// Export with default scene URL for easy use
export function DefaultSplineSprite(props: Omit<SplineSpriteProps, 'sceneUrl'>) {
    return (
        <SplineSprite
            sceneUrl="https://prod.spline.design/taUkTGq1sFMZ-Aem/scene.splinecode"
            {...props}
        />
    )
}
