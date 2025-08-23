"use client"

import React, { useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, MessageCircle } from "lucide-react"
import { LiquidGlass } from '@specy/liquid-glass-react';


export interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const DEFAULT_ITEMS: NavItem[] = [
  { id: "dashboard", icon: Home, label: "Dashboard" },
  { id: "agent", icon: MessageCircle, label: "Agent" },
]

export interface LiquidNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  items?: NavItem[]
  className?: string
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ")
}

export function LiquidNavbar({ activeTab, onTabChange, items = DEFAULT_ITEMS, className }: LiquidNavbarProps) {
  // roving focus for keyboard nav
  const buttonsRef = React.useRef<Record<string, HTMLButtonElement | null>>({})

  const currentIndex = Math.max(0, items.findIndex((i) => i.id === activeTab))

  const focusByIndex = (idx: number) => {
    const safeIdx = ((idx % items.length) + items.length) % items.length
    const id = items[safeIdx]?.id
    if (id && buttonsRef.current[id]) buttonsRef.current[id]!.focus()
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      const next = currentIndex + 1
      onTabChange(items[((next % items.length) + items.length) % items.length].id)
      focusByIndex(next)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      const prev = currentIndex - 1
      onTabChange(items[((prev % items.length) + items.length) % items.length].id)
      focusByIndex(prev)
    }
  }

  const glassStyle = useMemo(() => ({
    depth: 20,
    segments: 88,
    radius: 10,
    tint: null,
    reflectivity: 0.9,
    thickness: 50,
    dispersion: 5,
    roughness: 0.2,
  }), []);




  return (
    <div className={classNames(
      "fixed bottom-10 left-0 right-0 p-4 z-50",
      className
    )}>
      <div className="max-w-md mx-auto grid place-items-center rounded-b-xl">
        <LiquidGlass
          glassStyle={glassStyle}
          wrapperStyle={{
            position: 'fixed',
            bottom: 10,
            left: 0,
            right: 0,
            width: 'fit-content',
            margin: '0 auto',
          }}
        >

          <div className="p-4 rounded-3xl">
            <nav role="tablist" aria-label="Primary" onKeyDown={onKeyDown}>
              <div className="relative flex items-center gap-4">
                {items.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon

                  return (
                    <motion.button
                      key={item.id}
                      ref={(el) => {
                        buttonsRef.current[item.id] = el
                      }}
                      role="tab"
                      aria-selected={isActive}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => onTabChange(item.id)}
                      className={classNames(
                        "relative isolate h-16 w-16 rounded-3xl outline-none",
                        "flex items-center justify-center",
                        "transition-[transform,opacity] duration-200",
                        "focus-visible:ring-2 focus-visible:ring-white/80",
                        isActive ? "text-white" : "text-gray-600 dark:text-gray-300"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <AnimatePresence mode="popLayout">
                        {isActive && (
                          <motion.span
                            layoutId="activeTab"
                            className="absolute inset-0 -z-10 rounded-3xl bg-gray-900/90"
                            initial={{ opacity: 0.0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      <Icon className={classNames("h-7 w-7", isActive ? "text-white" : "text-gray-600 dark:text-gray-300")} />
                    </motion.button>
                  )
                })}
              </div>
            </nav>
          </div>
        </LiquidGlass>
      </div>
    </div >
  )
}

export default LiquidNavbar

/*
USAGE
-----
const [tab, setTab] = React.useState("dashboard")
<LiquidNavbar activeTab={tab} onTabChange={setTab} />
*/
