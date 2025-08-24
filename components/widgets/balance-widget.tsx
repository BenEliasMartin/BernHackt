"use client"

import { TrendingUp, TrendingDown, LucidePieChart, Flame, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamic import with no SSR
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
)
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
)
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
)
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
)
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
)
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
)

const portfolioData = [
  { month: "Jul", value: 6800, growth: -1.2 },
  { month: "Aug", value: 6950, growth: 2.2 },
  { month: "Sep", value: 7100, growth: 2.2 },
  { month: "Oct", value: 6980, growth: -1.7 },
  { month: "Nov", value: 7200, growth: 3.2 },
  { month: "Dec", value: 7450, growth: 3.5 },
  { month: "Jan", value: 7680, growth: 3.1 },
  { month: "Feb", value: 7520, growth: -2.1 },
  { month: "Mar", value: 7750, growth: 3.1 },
  { month: "Apr", value: 7832, growth: 1.1 },
]

const dailySpendingData = [
  { day: "Mon", amount: 85, dayFull: "Monday" },
  { day: "Tue", amount: 45, dayFull: "Tuesday" },
  { day: "Wed", amount: 120, dayFull: "Wednesday" },
  { day: "Thu", amount: 65, dayFull: "Thursday" },
  { day: "Fri", amount: 140, dayFull: "Friday" },
  { day: "Sat", amount: 35, dayFull: "Saturday" },
  { day: "Sun", amount: 95, dayFull: "Sunday" },
]

const budgetData = [
  { category: "Food & Dining", spent: 1420, budget: 1500, color: "#10b981" },
  { category: "Transportation", spent: 580, budget: 600, color: "#3b82f6" },
  { category: "Entertainment", spent: 320, budget: 400, color: "#8b5cf6" },
  { category: "Shopping", spent: 780, budget: 800, color: "#f59e0b" },
  { category: "Bills & Utilities", spent: 950, budget: 1000, color: "#ef4444" },
  { category: "Healthcare", spent: 180, budget: 300, color: "#06b6d4" },
  { category: "Education", spent: 250, budget: 400, color: "#84cc16" },
]

const assetAllocation = [
  { name: "Swiss Stocks", value: 28, color: "#10b981" },
  { name: "US Stocks", value: 22, color: "#3b82f6" },
  { name: "Bonds", value: 20, color: "#8b5cf6" },
  { name: "Real Estate", value: 12, color: "#f59e0b" },
  { name: "Crypto", value: 8, color: "#ef4444" },
  { name: "Commodities", value: 6, color: "#06b6d4" },
  { name: "Cash", value: 4, color: "#6b7280" },
]

const debtData = [
  { name: "Credit Card", amount: 2340, apr: 19.9, minPayment: 45 },
  { name: "Car Loan", amount: 12450, apr: 4.2, minPayment: 285 },
  { name: "Student Loan", amount: 8750, apr: 3.8, minPayment: 220 },
]

interface BalanceWidgetProps {
  initialTab?: "overview" | "portfolio" | "budget" | "debt"
}

export function BalanceWidget({ initialTab }: BalanceWidgetProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "budget" | "debt">(initialTab || "overview")
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const handleTabChange = (tab: "overview" | "portfolio" | "budget" | "debt") => {
    if (tab === activeTab) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveTab(tab)
      setIsAnimating(false)
    }, 150)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-3 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "overview"
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Übersicht
          </button>
          <button
            onClick={() => handleTabChange("portfolio")}
            className={`px-3 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "portfolio"
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => handleTabChange("budget")}
            className={`px-3 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "budget"
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Budget
          </button>
          <button
            onClick={() => handleTabChange("debt")}
            className={`px-3 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "debt"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
          >
            Schulden
          </button>
        </div>

        <div
          className={`transition-all duration-300 ${isAnimating ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"}`}
        >
          {activeTab === "overview" && (
            <>
              <div className="text-center space-y-4">
                <div className="text-3xl sm:text-4xl font-light text-slate-900">CHF 11,847.50</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Gesamtkontostand</div>
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">+2,3% in diesem Monat</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-16 sm:h-20 w-full flex justify-center">
                  {mounted ? (
                    <BarChart
                      width={300}
                      height={64}
                      data={dailySpendingData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          color: "#111827",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value, name) => [`CHF ${value}`, 'Spent']}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload
                          return item ? item.dayFull : label
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#9ca3af"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Diagramm wird geladen...</span>
                    </div>
                  )}
                </div>
                <div className="text-center text-xs text-slate-500">
                  Tägliche Ausgaben diese Woche
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                <div className="text-center space-y-2">
                  <div className="text-xl sm:text-2xl font-light text-slate-900">CHF 7,832</div>
                  <div className="text-xs text-slate-500">Investitionen</div>
                  <div className="text-xs text-slate-600">+5.2%</div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-xl sm:text-2xl font-light text-slate-900">CHF 4,015</div>
                  <div className="text-xs text-slate-500">Ersparnisse</div>
                  <div className="text-xs text-slate-600">+8.1%</div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Letzte Transaktionen</h3>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-p3nM3kWXqXi4BuC33Lxn4SbSz86U6N.png"
                          alt="Starbucks"
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Starbucks Zürich HB</div>
                        <div className="text-xs text-slate-500">Heute, 09:15 • Essen & Trinken</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">-CHF 6.40</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DJSf6UA3k3Im4hmyNFnIYb1MqHJXNb.png"
                          alt="Migros"
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Migros Supermarkt</div>
                        <div className="text-xs text-slate-500">Gestern, 18:30 • Lebensmittel</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">-CHF 87.23</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xs">SBB</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">SBB Zugticket</div>
                        <div className="text-xs text-slate-500">Gestern, 14:45 • Transport</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">-CHF 24.60</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xs">N26</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Investitionseinzahlung</div>
                        <div className="text-xs text-slate-500">Vor 2 Tagen • Investition</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-600">+CHF 500.00</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Gehaltseingang</div>
                        <div className="text-xs text-slate-500">Vor 3 Tagen • Einkommen</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-600">+CHF 4,200.00</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xs">UPC</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Internet & TV Rechnung</div>
                        <div className="text-xs text-slate-500">Vor 4 Tagen • Rechnungen</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-900">-CHF 89.90</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="text-3xl font-extralight text-gray-900">CHF 7,832</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">PORTFOLIOWERT</div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-light">+5,2% (387 CHF) in diesem Monat</span>
                </div>
              </div>

              <div className="h-48 w-full flex justify-center">
                {mounted ? (
                  <AreaChart
                    width={400}
                    height={192}
                    data={portfolioData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#111827",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#6b7280"
                      strokeWidth={2}
                      fill="url(#portfolioGradient)"
                    />
                  </AreaChart>
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Diagramm wird geladen...</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-light text-gray-900">Grösste Positionen</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">AAPL</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-light">Apple Inc.</div>
                        <div className="text-xs text-gray-400">12 Aktien</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 font-light">CHF 2,184</div>
                      <div className="text-xs text-gray-600">+3.2%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">MSFT</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-light">Microsoft Corp.</div>
                        <div className="text-xs text-gray-400">8 shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 font-light">CHF 1,896</div>
                      <div className="text-xs text-gray-600">+1.8%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">NESN</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-light">Nestlé SA</div>
                        <div className="text-xs text-gray-400">15 shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 font-light">CHF 1,650</div>
                      <div className="text-xs text-gray-400">-0.5%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-light text-gray-900 flex items-center gap-2">
                  <LucidePieChart className="h-4 w-4" />
                  Vermögensaufteilung
                </h4>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 flex justify-center">
                    {mounted ? (
                      <PieChart width={128} height={128}>
                        <Pie
                          data={assetAllocation}
                          cx={64}
                          cy={64}
                          innerRadius={25}
                          outerRadius={50}
                          dataKey="value"
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            color: "#111827",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                      </PieChart>
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Wird geladen...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {assetAllocation.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-400 font-light">
                        {item.name} {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="text-3xl font-extralight text-gray-900">CHF 4,480</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">MONATLICHE AUSGABEN</div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-light">520 CHF unter Budget</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-600 font-light">Ihr Budget-Status</div>
                  <div className="text-5xl font-extralight text-gray-900 tracking-tight">12</div>
                  <div className="w-full h-px bg-gray-200 my-4"></div>
                  <div className="text-sm text-gray-600 font-light">Tage in Folge, an denen Sie Ihr Budget eingehalten haben</div>
                </div>
              </div>

              <div className="space-y-4">
                {budgetData.map((item, index) => {
                  const percentage = (item.spent / item.budget) * 100
                  const isOverBudget = percentage > 100
                  return (
                    <div
                      key={index}
                      className="space-y-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 font-light">{item.category}</span>
                        <span className={`text-sm font-light ${isOverBudget ? "text-red-600" : "text-gray-600"}`}>
                          CHF {item.spent} / {item.budget}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${isOverBudget ? "bg-red-400" : "bg-gray-400"
                            }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(percentage)}% verbraucht</span>
                        <span>Noch {item.budget - item.spent} CHF übrig</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "debt" && (
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <div className="text-3xl font-extralight text-gray-900">Tilgungsplan</div>
                <div className="text-sm text-gray-500 font-light">Ihr Aktionsplan zur Schuldenfreiheit</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-600 font-light">Ihr voraussichtliches Schuldenfrei-Datum</div>
                  <div className="text-5xl font-extralight text-gray-900 tracking-tight">Mai 2028</div>
                  <div className="w-full h-px bg-gray-200 my-4"></div>
                  <div className="text-sm text-gray-600 font-light">Eingesparte Zeit</div>
                  <div className="text-3xl font-extralight text-gray-900">2 Jahre 6 Monate</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-extralight text-gray-900">1'004.47 CHF</div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wide">
                      Geschätzte Zinsen gespart
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-extralight text-gray-900">März 2027</div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wide">Erste Schuld getilgt</div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 font-light">Gesamtbetrag, der jeden Monat zurückgezahlt werden muss</div>
                <div className="text-4xl font-extralight text-gray-900">550 CHF</div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-light text-gray-900">Aktuelle Schulden</h3>
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {debtData.map((debt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-light text-gray-900">{debt.name}</div>
                          <div className="text-xs text-gray-400">{`${debt.apr}% Zinssatz • Min. ${debt.minPayment} CHF/Monat`}</div>
                        </div>
                      </div>
                      <div className="text-sm font-light text-gray-900">{debt.amount} CHF</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}