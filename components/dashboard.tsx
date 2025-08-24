"use client"

import { BalanceWidget } from "@/components/widgets/balance-widget"
import { ChallengeWidget } from "@/components/widgets/challenge-widget"
import { BudgetWidget } from "@/components/widgets/budget-widget"
import { GoalsWidget } from "@/components/widgets/goals-widget"
import { NewsWidget } from "@/components/widgets/news-widget"
import { PortfolioWidget } from "@/components/widgets/portfolio-widget"

export function Dashboard() {

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="pt-4 sm:pt-12 pb-4 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">Fin's Dashboard</h1>
        </div>

        <div className="space-y-8">
          <BalanceWidget />
          <ChallengeWidget />
          <BudgetWidget />
          <GoalsWidget />
          <NewsWidget />
          <PortfolioWidget />
        </div>

        <div className="h-16 sm:h-32"></div>
      </div>
    </div>
  )
}
