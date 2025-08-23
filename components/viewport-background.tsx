"use client"

import React from "react"
import { motion } from "framer-motion"

interface ViewportBackgroundProps {
    className?: string
}

export function ViewportBackground({ className = "" }: ViewportBackgroundProps) {
    return (
        <motion.div
            className={`fixed inset-0 z-0 overflow-hidden ${className}`}
            style={{
                width: '100vw',
                height: '100vh',
                left: 0,
                top: 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Background gradient or pattern can go here */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
        </motion.div>
    )
}
