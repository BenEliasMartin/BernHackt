"use client"

import React, { memo, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  Clock,
  Globe,
  ChevronDown,
  type LucideIcon,
} from "lucide-react"

// --- Types
type Impact = "positive" | "negative" | "neutral"

type NewsItem = {
  id: number
  title: string
  summary: string
  time: string
  category: string
  impact: Impact
  icon: LucideIcon
}

// --- Example data (replace with real feed)
const newsItems: NewsItem[] = [
  { id: 1, title: "Schweizer Nationalbank hält Leitzins stabil", summary: "Die SNB hält den Leitzins bei 1,75 % angesichts von Inflationssorgen und globaler wirtschaftlicher Unsicherheit.", time: "Vor 2 Stunden", category: "Zentralbanken", impact: "neutral", icon: DollarSign },
  { id: 2, title: "Technologieaktien legen dank KI-Optimismus zu", summary: "Große Technologieunternehmen verzeichnen deutliche Gewinne, da Anleger auf das Wachstum der künstlichen Intelligenz setzen.", time: "Vor 4 Stunden", category: "Märkte", impact: "positive", icon: TrendingUp },
  { id: 3, title: "Europäische Börsen uneinheitlich wegen Energiesorgen", summary: "Die Volatilität im Energiesektor beeinflusst weiterhin die europäischen Indizes angesichts geopolitischer Spannungen.", time: "Vor 6 Stunden", category: "Märkte", impact: "negative", icon: TrendingDown },
  { id: 4, title: "Aktualisierungen zur Kryptowährungsregulierung", summary: "Neuer regulatorischer Rahmen für digitale Vermögenswerte dürfte die Handelsvolumina erheblich beeinflussen.", time: "Vor 8 Stunden", category: "Krypto", impact: "neutral", icon: AlertCircle },
  { id: 5, title: "Schweizer Franken gewinnt gegenüber dem Euro", summary: "Der CHF gewinnt an Stärke, da die Nachfrage nach sicheren Häfen angesichts der globalen Marktunsicherheit zunimmt.", time: "Vor 12 Stunden", category: "Währung", impact: "positive", icon: TrendingUp },
]

// --- Config
const NEWS_PER_COLLAPSED = 2

const impactColor = (impact: Impact) => {
  switch (impact) {
    case "positive":
      return "text-green-600"
    case "negative":
      return "text-red-600"
    default:
      return "text-gray-500"
  }
}

const NewsRow = memo(function NewsRow({ item, isExpanded }: { item: NewsItem; isExpanded: boolean }) {
  const Icon = item.icon
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
      {/* Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-light text-gray-900 leading-tight">
            {item.title}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span>{item.time}</span>
          </div>
        </div>

        {/* Summary - only show when expanded */}
        {isExpanded && (
          <p className="text-xs text-gray-600 leading-relaxed font-light">
            {item.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {item.category}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs">🇨🇭</span>
              <span className="text-xs text-gray-400">SRF</span>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-xs font-light ${impactColor(item.impact)}`}>
            {item.impact === "positive" && <TrendingUp className="h-3 w-3" />}
            {item.impact === "negative" && <TrendingDown className="h-3 w-3" />}
            {item.impact === "neutral" && <AlertCircle className="h-3 w-3" />}
            <span className="capitalize">{item.impact}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export function NewsWidget() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(newsItems.map((n) => n.category)))],
    []
  )

  const filteredNews = useMemo(() => {
    return selectedCategory && selectedCategory !== "All"
      ? newsItems.filter((i) => i.category === selectedCategory)
      : newsItems
  }, [selectedCategory])

  const visibleItems = filteredNews.slice(0, NEWS_PER_COLLAPSED)
  const extraItems = filteredNews.slice(NEWS_PER_COLLAPSED)

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "All" ? null : category)
    setExpandedItems(new Set()) // reset expanded items on filter change
  }

  const toggleItemExpansion = (itemId: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <Card className="p-8 bg-white border border-gray-100 shadow-sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-gray-600" />
          <div className="flex-1">
            <h3 className="text-xl font-extralight text-gray-900 tracking-wide">Finanznachrichten</h3>
            <div className="text-xs text-gray-500 font-light">
              {filteredNews.length} Aktualisierungen heute
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap pb-2">
          {categories.map((category) => {
            const active = selectedCategory === category || (selectedCategory === null && category === "Alle")
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 font-light ${active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        {/* Always-visible news items */}
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer"
              onClick={() => toggleItemExpansion(item.id)}
            >
              <NewsRow item={item} isExpanded={expandedItems.has(item.id)} />
            </div>
          ))}
        </div>

        {/* Additional items (collapsible) */}
        {extraItems.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => {
                // Toggle all extra items at once
                const allExtraIds = extraItems.map(item => item.id)
                const newExpanded = new Set(expandedItems)
                const someExtraExpanded = allExtraIds.some(id => newExpanded.has(id))

                if (someExtraExpanded) {
                  // Remove all extra items
                  allExtraIds.forEach(id => newExpanded.delete(id))
                } else {
                  // Add all extra items
                  allExtraIds.forEach(id => newExpanded.add(id))
                }
                setExpandedItems(newExpanded)
              }}
              className="flex items-center justify-center gap-2 w-full p-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-100"
            >
              <span>
                {extraItems.some(item => expandedItems.has(item.id))
                  ? "Weniger anzeigen"
                  : `${extraItems.length} weitere Meldungen anzeigen`}
              </span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${extraItems.some(item => expandedItems.has(item.id)) ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Extra items */}
            {extraItems.some(item => expandedItems.has(item.id)) && (
              <div className="space-y-2 border-t border-gray-100 pt-4">
                {extraItems.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => toggleItemExpansion(item.id)}
                  >
                    <NewsRow item={item} isExpanded={expandedItems.has(item.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

export default NewsWidget