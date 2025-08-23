"use client"

import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react"
import { useState } from "react"

const newsItems = [
  {
    id: 1,
    title: "Swiss National Bank Holds Interest Rates Steady",
    summary: "SNB maintains policy rate at 1.75% amid inflation concerns and global economic uncertainty.",
    time: "2 hours ago",
    category: "Central Banking",
    impact: "neutral",
    icon: DollarSign,
    color: "text-blue-400",
  },
  {
    id: 2,
    title: "Tech Stocks Rally on AI Optimism",
    summary: "Major technology companies see significant gains as investors bet on artificial intelligence growth.",
    time: "4 hours ago",
    category: "Markets",
    impact: "positive",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    id: 3,
    title: "European Markets Mixed on Energy Concerns",
    summary: "Energy sector volatility continues to impact European indices amid geopolitical tensions.",
    time: "6 hours ago",
    category: "Markets",
    impact: "negative",
    icon: TrendingDown,
    color: "text-red-400",
  },
  {
    id: 4,
    title: "Cryptocurrency Regulation Updates",
    summary: "New regulatory framework for digital assets expected to impact trading volumes significantly.",
    time: "8 hours ago",
    category: "Crypto",
    impact: "neutral",
    icon: AlertCircle,
    color: "text-orange-400",
  },
  {
    id: 5,
    title: "Swiss Franc Strengthens Against Euro",
    summary: "CHF gains ground as safe-haven demand increases amid global market uncertainty.",
    time: "12 hours ago",
    category: "Currency",
    impact: "positive",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
]

export function NewsWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const categories = ["All", "Markets", "Central Banking", "Crypto", "Currency"]
  const filteredNews =
    selectedCategory && selectedCategory !== "All"
      ? newsItems.filter((item) => item.category === selectedCategory)
      : newsItems

  const displayedNews = isExpanded ? filteredNews : filteredNews.slice(0, 3)

  const handleCategoryChange = (category: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setSelectedCategory(category === "All" ? null : category)
      setIsLoading(false)
    }, 300)
  }

  return (
    <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Financial News</h3>
            <p className="text-sm text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                {filteredNews.length} updates today
              </span>
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-all duration-300 hover:scale-110"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-zinc-400 transition-transform duration-300" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-400 transition-transform duration-300" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="flex gap-2 overflow-x-auto pb-2 animate-in slide-in-from-top-2 duration-300">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category || (selectedCategory === null && category === "All")
                    ? "bg-zinc-700 text-white shadow-lg shadow-zinc-700/20"
                    : "bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-zinc-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNews.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div
                  key={item.id}
                  className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-zinc-900/20 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-all duration-300 group-hover:scale-110`}
                    >
                      <IconComponent className={`h-4 w-4 ${item.color} transition-all duration-300`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-xs text-zinc-500 whitespace-nowrap">{item.time}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2 group-hover:text-zinc-300 transition-colors duration-300">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-full group-hover:bg-zinc-600 transition-colors duration-300">
                          {item.category}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs transition-all duration-300 ${
                            item.impact === "positive"
                              ? "text-emerald-400"
                              : item.impact === "negative"
                                ? "text-red-400"
                                : "text-zinc-400"
                          }`}
                        >
                          {item.impact === "positive" && <TrendingUp className="h-3 w-3 animate-pulse" />}
                          {item.impact === "negative" && <TrendingDown className="h-3 w-3 animate-pulse" />}
                          {item.impact === "neutral" && <AlertCircle className="h-3 w-3" />}
                          <span className="capitalize">{item.impact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!isExpanded && filteredNews.length > 3 && (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full py-2 text-sm text-zinc-400 hover:text-white transition-all duration-300 border border-zinc-800 rounded-lg hover:bg-zinc-800/30 hover:border-zinc-700 transform hover:scale-105"
          >
            Show {filteredNews.length - 3} more updates
          </button>
        )}
      </div>
    </Card>
  )
}
