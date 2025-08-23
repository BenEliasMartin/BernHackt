"use client"

import React, { useMemo, useEffect, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { IoHome, IoChatbubbleEllipses } from "react-icons/io5"
import { LiquidGlass } from '@specy/liquid-glass-react';

export interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

const DEFAULT_ITEMS: NavItem[] = [
  { id: "dashboard", icon: IoHome, label: "Dashboard" },
  { id: "agent", icon: IoChatbubbleEllipses, label: "Agent" },
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

  // Smooth tracking of viewport changes
  const [viewportWidth, setViewportWidth] = useState(0)
  const x = useMotionValue(0)
  const smoothX = useSpring(x, { damping: 25, stiffness: 200 })

  const currentIndex = Math.max(0, items.findIndex((i) => i.id === activeTab))

  // Track viewport changes and adjust position
  useEffect(() => {
    const updatePosition = () => {
      const newWidth = window.innerWidth
      setViewportWidth(newWidth)

      // Center the navbar based on viewport
      const navbarWidth = 320 // Approximate navbar width
      const centerOffset = (newWidth - navbarWidth) / 2 // True center position
      x.set(centerOffset) // This will center it perfectly
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [x])

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
    depth: 0,
    segments: 150,
    radius: 50,
    tint: null,
    reflectivity: 0.98,
    thickness: 80,
    dispersion: 2,
    roughness: 0.1,
  }), []);

  return (
    <motion.div
      className={classNames(
        "fixed bottom-4 z-[2147483647]",
        className
      )}
      style={{
        x: smoothX,
        left: 0,
      }}
    >
      <LiquidGlass
        glassStyle={glassStyle}
        wrapperStyle={{
          position: 'relative',
          borderRadius: '50px',
          background: 'rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          width: 'fit-content',
          zIndex: 2147483647,
        }}
      >
        <div className="px-8 py-4">
          <nav role="tablist" aria-label="Primary" onKeyDown={onKeyDown}>
            <div className="relative flex items-center gap-8">
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
                      "relative isolate px-6 py-3 rounded-full outline-none",
                      "flex flex-col items-center justify-center gap-1",
                      "transition-all duration-300 ease-out",
                      "focus-visible:ring-2 focus-visible:ring-blue-400/50"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence mode="popLayout">
                      {isActive && (
                        <motion.span
                          layoutId="activeTab"
                          className="absolute inset-0 -z-10 rounded-full bg-blue-500/20"
                          style={{
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30
                          }}
                        />
                      )}
                    </AnimatePresence>

                    <Icon className={classNames(
                      "h-6 w-6 transition-all duration-300 ease-out",
                      isActive ? "text-blue-600" : "text-gray-700"
                    )} />

                    <span className={classNames(
                      "text-xs font-medium transition-all duration-300 ease-out",
                      isActive ? "text-blue-600" : "text-gray-700"
                    )}>
                      {item.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </nav>
        </div>
      </LiquidGlass>
    </motion.div>
  )
}

export default LiquidNavbar