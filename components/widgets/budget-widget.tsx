import { Card } from "@/components/ui/card"

const categories = [
  { name: "Restaurant", spent: 580, budget: 500, color: "bg-gray-900" },
  { name: "Lebensmittel", spent: 420, budget: 600, color: "bg-gray-700" },
  { name: "Transport", spent: 180, budget: 300, color: "bg-gray-600" },
  { name: "Unterhaltung", spent: 150, budget: 200, color: "bg-gray-500" },
]

export function BudgetWidget() {
  return (
    <Card className="p-8 bg-white border border-gray-100 shadow-sm">
      <div className="space-y-6">
        <h3 className="text-xl font-extralight text-gray-900 tracking-wide">Monatliches Budget</h3>

        <div className="space-y-6">
          {categories.map((category) => {
            const percentage = (category.spent / category.budget) * 100
            const isOverBudget = percentage > 100

            return (
              <div key={category.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-light text-gray-900 text-sm">{category.name}</span>
                  <span className={isOverBudget ? "text-gray-900 font-medium text-sm" : "text-gray-500 text-sm"}>
                    CHF {category.spent} / {category.budget}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${isOverBudget ? "bg-gray-900" : "bg-gray-700"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="text-xs text-gray-600 font-light">{Math.round(percentage - 100)}% über Budget</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
