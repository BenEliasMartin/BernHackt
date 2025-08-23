import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", value: 4250, change: 2.4, shares: 15 },
  { symbol: "MSFT", name: "Microsoft", value: 3180, change: -0.8, shares: 12 },
  { symbol: "GOOGL", name: "Alphabet", value: 2890, change: 1.6, shares: 8 },
  { symbol: "TSLA", name: "Tesla", value: 1527, change: -3.2, shares: 5 },
]

export function PortfolioWidget() {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)

  return (
    <Card className="p-6 bg-card text-card-foreground">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Depot
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold">CHF {totalValue.toLocaleString()}</div>
            <div className="text-sm text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2,3%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {holdings.map((holding) => (
            <div key={holding.symbol} className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{holding.symbol}</div>
                <div className="text-xs text-muted-foreground">{holding.shares} Anteile</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">CHF {holding.value.toLocaleString()}</div>
                <div
                  className={`text-xs flex items-center gap-1 ${
                    holding.change >= 0 ? "text-accent" : "text-destructive"
                  }`}
                >
                  {holding.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {holding.change >= 0 ? "+" : ""}
                  {holding.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
