"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dashboard } from "@/components/dashboard"
import { FinanceAgent } from "@/components/finance-agent"
import { LiquidNavbar } from "@/components/liquid-navbar"

export function AppLayout() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "agent":
        return <FinanceAgent />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <div>
        <LiquidNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
