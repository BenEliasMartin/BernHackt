"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BalanceWidget } from "@/components/widgets/balance-widget"
import { ChallengeWidget } from "@/components/widgets/challenge-widget"
import { BudgetWidget } from "@/components/widgets/budget-widget"
import { GoalsWidget } from "@/components/widgets/goals-widget"
import { NewsWidget } from "@/components/widgets/news-widget"
import { PortfolioWidget } from "@/components/widgets/portfolio-widget"

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
  },
  duration: {
    medium: 0.5,
  },
  easing: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: ANIMATION_CONFIG.spring,
  },
}

export function Dashboard() {

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-6 space-y-8">
        <motion.div
          className="pt-12 pb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: ANIMATION_CONFIG.duration.medium,
            ease: ANIMATION_CONFIG.easing,
          }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tighter font-sans">Financial Dashboard</h1>
          <p className="text-gray-500 text-sm">Your complete financial overview</p>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <BalanceWidget />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ChallengeWidget />
          </motion.div>

          <motion.div variants={itemVariants}>
            <BudgetWidget />
          </motion.div>

          <motion.div variants={itemVariants}>
            <GoalsWidget />
          </motion.div>

          <motion.div variants={itemVariants}>
            <NewsWidget />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PortfolioWidget />
          </motion.div>
        </motion.div>

        <div className="h-32"></div>
      </div>
    </div>
  )
}
