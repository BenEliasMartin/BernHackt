"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, LucidePieChart, Flame, CreditCard } from "lucide-react"
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { useState, useEffect } from "react"

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

  useEffect(() => {
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
    <Card className="p-6 bg-white border border-gray-100 shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-0 border-b border-gray-200">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-6 py-3 text-sm font-light transition-all duration-300 border-b-2 ${
              activeTab === "overview"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange("portfolio")}
            className={`px-6 py-3 text-sm font-light transition-all duration-300 border-b-2 ${
              activeTab === "portfolio"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => handleTabChange("budget")}
            className={`px-6 py-3 text-sm font-light transition-all duration-300 border-b-2 ${
              activeTab === "budget"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => handleTabChange("debt")}
            className={`px-6 py-3 text-sm font-light transition-all duration-300 border-b-2 ${
              activeTab === "debt"
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Debt
          </button>
        </div>

        <div
          className={`transition-all duration-300 ${isAnimating ? "opacity-0 transform translate-y-2" : "opacity-100 transform translate-y-0"}`}
        >
          {activeTab === "overview" && (
            <>
              <div className="text-center space-y-2">
                <div className="text-5xl font-extralight text-gray-900 tracking-tight">CHF 11,847.50</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">TOTAL BALANCE</div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-light">+2.3% this month</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-end justify-between gap-2 h-20 px-2">
                  {[
                    { height: 60, day: "Mon" },
                    { height: 40, day: "Tue" },
                    { height: 75, day: "Wed" },
                    { height: 50, day: "Thu" },
                    { height: 85, day: "Fri" },
                    { height: 35, day: "Sat" },
                    { height: 65, day: "Sun" },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="bg-gray-200 rounded-sm w-full transition-all duration-500 hover:bg-gray-300"
                        style={{
                          height: `${bar.height}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                      <span className="text-xs text-gray-400 font-light">{bar.day}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-xs text-gray-400 uppercase tracking-wide font-light">
                  Daily Spending This Week
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-extralight text-gray-900">CHF 7,832</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-light">Investments</div>
                  <div className="text-xs text-gray-600">+5.2%</div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-300 rounded-full transition-all duration-1000"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-extralight text-gray-900">CHF 4,015</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide font-light">Savings</div>
                  <div className="text-xs text-gray-600">+8.1%</div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-300 rounded-full transition-all duration-1000"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-light text-gray-900">Recent Transactions</h3>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-p3nM3kWXqXi4BuC33Lxn4SbSz86U6N.png"
                          alt="Starbucks"
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">Starbucks Zürich HB</div>
                        <div className="text-xs text-gray-400">Today, 9:15 AM • Food & Dining</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-900">-CHF 6.40</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DJSf6UA3k3Im4hmyNFnIYb1MqHJXNb.png"
                          alt="Migros"
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">Migros Supermarket</div>
                        <div className="text-xs text-gray-400">Yesterday, 6:30 PM • Groceries</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-900">-CHF 87.23</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">SBB</span>
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">SBB Train Ticket</div>
                        <div className="text-xs text-gray-400">Yesterday, 2:45 PM • Transportation</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-900">-CHF 24.60</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">N26</span>
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">Investment Deposit</div>
                        <div className="text-xs text-gray-400">2 days ago • Investment</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-600">+CHF 500.00</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">Salary Deposit</div>
                        <div className="text-xs text-gray-400">3 days ago • Income</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-600">+CHF 4,200.00</div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">UPC</span>
                      </div>
                      <div>
                        <div className="text-sm font-light text-gray-900">Internet & TV Bill</div>
                        <div className="text-xs text-gray-400">4 days ago • Bills & Utilities</div>
                      </div>
                    </div>
                    <div className="text-sm font-light text-gray-900">-CHF 89.90</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-extralight text-gray-900">CHF 7,832</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">PORTFOLIO VALUE</div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-light">+5.2% (CHF 387) this month</span>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioData}>
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
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-light text-gray-900">Top Holdings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-light text-xs">AAPL</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900 font-light">Apple Inc.</div>
                        <div className="text-xs text-gray-400">12 shares</div>
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
                  Asset Allocation
                </h4>
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart
                        data={assetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {assetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </ResponsiveContainer>
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
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-extralight text-gray-900">CHF 4,480</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-light">MONTHLY SPENDING</div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-light">CHF 520 under budget</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <div className="text-center">
                    <div className="text-2xl font-extralight text-gray-900">12</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-light">Day Streak</div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600 font-light">
                  You've stayed within budget for 12 consecutive days!
                </div>
                <div className="text-center text-xs text-gray-400 mt-1">Keep it up to reach your 30-day goal</div>
                <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-1000"
                    style={{ width: "40%" }}
                  />
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
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOverBudget ? "bg-red-400" : "bg-gray-400"
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            animationDelay: `${index * 100}ms`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(percentage)}% used</span>
                        <span>CHF {item.budget - item.spent} remaining</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "debt" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-extralight text-gray-900">Paydown Plan</div>
                <div className="text-sm text-gray-500 font-light">Your action plan to becoming debt-free</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-center space-y-4">
                  <div className="text-sm text-gray-600 font-light">Your new estimated debt-free date</div>
                  <div className="text-5xl font-extralight text-gray-900 tracking-tight">May 2028</div>
                  <div className="w-full h-px bg-gray-200 my-4"></div>
                  <div className="text-sm text-gray-600 font-light">Estimated time saved</div>
                  <div className="text-3xl font-extralight text-gray-900">2 years 6 months</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-extralight text-gray-900">$1,004.47</div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wide">
                      Est. Interest Avoided
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-extralight text-gray-900">Mar, 2027</div>
                    <div className="text-xs text-gray-500 font-light uppercase tracking-wide">First Debt Paid</div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-500 font-light">Total to repay each month</div>
                <div className="text-4xl font-extralight text-gray-900">$550</div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-light text-gray-900">Current Debts</h3>
                  <CreditCard className="h-4 w-4 text-gray-400" />
                </div>

                <div className="space-y-3">
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
                          <div className="text-xs text-gray-400">{`${debt.apr}% APR • Min. $${debt.minPayment}/month`}</div>
                        </div>
                      </div>
                      <div className="text-sm font-light text-gray-900">${debt.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
