"use client"

import { Card } from "@/components/ui/card"
import { ChevronUp, MapPin, Star } from "lucide-react"
import { useState, useEffect, useRef } from "react"

function MapBox({ locations }: { locations: Array<{ name: string; lat: number; lng: number; color: string }> }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    // Simple map implementation using CSS and positioning
    // In a real app, you'd use Mapbox GL JS or Google Maps API
    const map = mapRef.current
    map.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        position: relative;
        border-radius: 8px;
        overflow: hidden;
      ">
        <!-- Starbucks location -->
        <div style="
          position: absolute;
          top: 20%;
          left: 25%;
          width: 12px;
          height: 12px;
          background: #1f2937;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          top: 32%;
          left: 20%;
          font-size: 10px;
          color: #6b7280;
          font-weight: 300;
        ">Starbucks</div>
        
        <!-- Café Central location -->
        <div style="
          position: absolute;
          top: 60%;
          right: 20%;
          width: 12px;
          height: 12px;
          background: #9ca3af;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          top: 72%;
          right: 15%;
          font-size: 10px;
          color: #6b7280;
          font-weight: 300;
        ">Café Central</div>
        
        <!-- Distance line -->
        <svg style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        ">
          <line x1="30%" y1="26%" x2="75%" y2="66%" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2"/>
        </svg>
        
        <!-- Distance label -->
        <div style="
          position: absolute;
          top: 45%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          color: #6b7280;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">100m</div>
      </div>
    `
    setMapLoaded(true)
  }, [])

  return <div ref={mapRef} className="h-32 w-full bg-gray-50 rounded-lg border border-gray-100" />
}

export function ChallengeWidget() {
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null)

  const toggleChallenge = (challengeId: string) => {
    setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId)
  }

  const coffeeLocations = [
    { name: "Starbucks", lat: 47.3769, lng: 8.5417, color: "#1f2937" },
    { name: "Café Central", lat: 47.3771, lng: 8.542, color: "#9ca3af" },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-extralight text-gray-900 mb-4">Challenges</h2>

      {/* Coffee Savings Challenge */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleChallenge("coffee")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-p3nM3kWXqXi4BuC33Lxn4SbSz86U6N.png"
                alt="Starbucks"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-base font-extralight text-gray-900">Coffee Savings Challenge</h3>
          </div>
          <ChevronUp
            className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${
              expandedChallenge === "coffee" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedChallenge === "coffee" && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
            <div className="pt-4">
              <p className="text-sm text-gray-600 leading-relaxed font-extralight">
                You've bought coffee at <span className="text-gray-900">Starbucks Zürich HB</span> for the last 3 days.
                There's a local café <span className="text-gray-900">Café Central</span> just 100m away that serves
                coffee for CHF 3.50 less per cup.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span>Current location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Alternative</span>
                </div>
              </div>

              <MapBox locations={coffeeLocations} />
            </div>

            {/* Café details */}
            <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>Café Central - 2 min walk</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>4.8</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-extralight">
                Potential savings: <span className="text-gray-900">CHF 17.50/week</span>
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Smart Shopping Challenge */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-200">
        <div
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => toggleChallenge("shopping")}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DJSf6UA3k3Im4hmyNFnIYb1MqHJXNb.png"
                alt="Migros"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-base font-extralight text-gray-900">Smart Shopping Challenge</h3>
          </div>
          <ChevronUp
            className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${
              expandedChallenge === "shopping" ? "rotate-180" : ""
            }`}
          />
        </div>

        {expandedChallenge === "shopping" && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-50">
            <div className="pt-4">
              <p className="text-sm text-gray-600 leading-relaxed font-extralight">
                Your average grocery spending at <span className="text-gray-900">Migros</span> is{" "}
                <span className="text-gray-900">CHF 120/week</span>. Try to save CHF 30 on your next shopping trip.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-500 mb-2">Money-saving tips:</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-gray-50 rounded p-2">M-Budget products</div>
                <div className="bg-gray-50 rounded p-2">Weekly promotions</div>
                <div className="bg-gray-50 rounded p-2">Seasonal produce</div>
                <div className="bg-gray-50 rounded p-2">Cumulus points</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 font-extralight">
                Target savings: <span className="text-gray-900">CHF 30/week</span>
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
