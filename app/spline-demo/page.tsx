"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import SplineSprite, { DefaultSplineSprite } from "@/components/SplineSprite"

export default function SplineDemoPage() {
    const [customSize, setCustomSize] = useState({ width: 200, height: 200 })
    const [showLoadingState, setShowLoadingState] = useState(true)
    const [loadingAnimation, setLoadingAnimation] = useState(true)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        SplineSprite Component Demo
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        A reusable component for displaying Spline 3D scenes with loading states,
                        error handling, and customizable sizes.
                    </p>
                </motion.div>

                {/* Size Examples */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                        Predefined Sizes
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                            <motion.div
                                key={size}
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.3 + ['sm', 'md', 'lg', 'xl'].indexOf(size) * 0.1 }}
                            >
                                <div className="mb-4">
                                    <DefaultSplineSprite size={size} />
                                </div>
                                <p className="text-sm font-medium text-slate-700 capitalize">{size}</p>
                                <p className="text-xs text-slate-500">
                                    {size === 'sm' ? '96×96' :
                                        size === 'md' ? '144×144' :
                                            size === 'lg' ? '192×192' : '240×240'}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Custom Size */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                        Custom Size
                    </h2>

                    <div className="flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-slate-700">
                                Width: {customSize.width}px
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="400"
                                value={customSize.width}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                                className="w-32"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-slate-700">
                                Height: {customSize.height}px
                            </label>
                            <input
                                type="range"
                                min="100"
                                max="400"
                                value={customSize.height}
                                onChange={(e) => setCustomSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                                className="w-32"
                            />
                        </div>

                        <div className="mt-4">
                            <DefaultSplineSprite
                                size="custom"
                                customSize={customSize}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Configuration Options */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                        Configuration Options
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="showLoading"
                                    checked={showLoadingState}
                                    onChange={(e) => setShowLoadingState(e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="showLoading" className="text-sm font-medium text-slate-700">
                                    Show Loading State
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="loadingAnimation"
                                    checked={loadingAnimation}
                                    onChange={(e) => setLoadingAnimation(e.target.checked)}
                                    className="w-4 h-4"
                                    disabled={!showLoadingState}
                                />
                                <label htmlFor="loadingAnimation" className="text-sm font-medium text-slate-700">
                                    Loading Animation
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <DefaultSplineSprite
                                size="md"
                                showLoadingState={showLoadingState}
                                loadingAnimation={loadingAnimation}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Custom Scene */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                        Custom Scene URL
                    </h2>

                    <div className="text-center">
                        <SplineSprite
                            sceneUrl="https://prod.spline.design/taUkTGq1sFMZ-Aem/scene.splinecode"
                            size="lg"
                            onLoad={() => console.log('Custom scene loaded!')}
                            onError={(error) => console.error('Custom scene error:', error)}
                        />
                        <p className="text-sm text-slate-600 mt-4">
                            Using a custom scene URL with event handlers
                        </p>
                    </div>
                </motion.div>

                {/* Usage Examples */}
                <motion.div
                    className="bg-white rounded-2xl p-8 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">
                        Usage Examples
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium text-slate-700 mb-4">Basic Usage</h3>
                            <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                                {`import { DefaultSplineSprite } from "@/components/SplineSprite"

<DefaultSplineSprite size="lg" />`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-slate-700 mb-4">Advanced Usage</h3>
                            <pre className="bg-slate-100 rounded-lg p-4 text-sm overflow-x-auto">
                                {`import SplineSprite from "@/components/SplineSprite"

<SplineSprite
  sceneUrl="your-scene-url"
  size="custom"
  customSize={{ width: 300, height: 200 }}
  onLoad={() => console.log('Loaded!')}
  onError={(error) => console.error(error)}
/>`}
                            </pre>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

