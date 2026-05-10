"use client"

import { MapPin, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationAqi {
  id: string
  name: string
  aqi: number
  trend: "up" | "down" | "stable"
  distance: string
}

interface SidebarProps {
  nearbyLocations: LocationAqi[]
  healthTips: string[]
}

function getAqiColor(aqi: number) {
  if (aqi <= 50) return "text-aqi-good"
  if (aqi <= 100) return "text-aqi-moderate"
  if (aqi <= 150) return "text-aqi-unhealthy-sensitive"
  if (aqi <= 200) return "text-aqi-unhealthy"
  if (aqi <= 300) return "text-aqi-very-unhealthy"
  return "text-aqi-hazardous"
}

function getAqiBgColor(aqi: number) {
  if (aqi <= 50) return "bg-aqi-good/20"
  if (aqi <= 100) return "bg-aqi-moderate/20"
  if (aqi <= 150) return "bg-aqi-unhealthy-sensitive/20"
  if (aqi <= 200) return "bg-aqi-unhealthy/20"
  if (aqi <= 300) return "bg-aqi-very-unhealthy/20"
  return "bg-aqi-hazardous/20"
}

export function Sidebar({ nearbyLocations, healthTips }: SidebarProps) {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      {/* Mini Map Placeholder */}
      <div className="glass-card rounded-2xl p-4 overflow-hidden">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Location Overview
        </h3>
        <div className="relative h-32 bg-secondary/30 rounded-xl overflow-hidden">
          {/* Stylized map visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/20 animate-ping absolute inset-0" />
              <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.65 0.2 200) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.65 0.2 200) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        </div>
      </div>

      {/* Nearby Locations */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Nearby Areas</h3>
        <div className="space-y-3">
          {nearbyLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                    getAqiBgColor(location.aqi),
                    getAqiColor(location.aqi)
                  )}
                >
                  {location.aqi}
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {location.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{location.distance}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {location.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-destructive" />
                ) : location.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-accent" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Tips */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-aqi-moderate" />
          Health Recommendations
        </h3>
        <div className="space-y-2">
          {healthTips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary mt-1">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
