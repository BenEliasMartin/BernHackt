import { Card } from "@/components/ui/card"
import { Target, PiggyBank, Plane } from "lucide-react"

const goals = [
  {
    name: "Notfallfonds",
    current: 6800,
    target: 10000,
    icon: PiggyBank,
    color: "text-gray-700",
  },
  {
    name: "Urlaubskasse",
    current: 2100,
    target: 5000,
    icon: Plane,
    color: "text-gray-600",
  },
  {
    name: "Sparziel",
    current: 15000,
    target: 20000,
    icon: Target,
    color: "text-gray-800",
  },
]

export function GoalsWidget() {
  return (
    <Card className="p-8 bg-white border border-gray-100 shadow-sm">
      <div className="space-y-6">
        <h3 className="text-xl font-extralight text-gray-900 tracking-wide">Finanzielle Ziele</h3>

        <div className="space-y-6">
          {goals.map((goal) => {
            const percentage = (goal.current / goal.target) * 100
            const Icon = goal.icon

            return (
              <div key={goal.name} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${goal.color}`} />
                  <span className="font-light text-gray-900 text-sm flex-1">{goal.name}</span>
                  <span className="text-xs text-gray-500 font-light">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gray-700 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-light">
                  <span>CHF {goal.current.toLocaleString()}</span>
                  <span>CHF {goal.target.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
