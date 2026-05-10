"use client"

import { Cloud, Flame, Wind, Droplets, Factory, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Pollutant } from "@/lib/types"

interface MetricBase {
  id: string
  label: string
  value: number
  unit: string
  level: "good" | "moderate" | "unhealthy-for-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous"
  maxValue: number
}

interface MetricsGridProps {
  metrics: (Pollutant | MetricBase)[]
}

function getIconForPollutant(id: string) {
  switch (id) {
    case "pm25":
      return <Droplets className="w-5 h-5" />
    case "pm10":
      return <Cloud className="w-5 h-5" />
    case "o3":
      return <Zap className="w-5 h-5" />
    case "no2":
      return <Factory className="w-5 h-5" />
    case "so2":
      return <Wind className="w-5 h-5" />
    case "co":
      return <Flame className="w-5 h-5" />
    default:
      return <Cloud className="w-5 h-5" />
  }
}

function getNormalizedLevel(level: string): "good" | "moderate" | "unhealthy-for-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous" {
  if (level === "good") return "good"
  if (level === "moderate") return "moderate"
  if (level === "unhealthy-for-sensitive") return "unhealthy-for-sensitive"
  if (level === "unhealthy") return "unhealthy"
  if (level === "very-unhealthy") return "very-unhealthy"
  if (level === "hazardous") return "hazardous"
  return "moderate"
}

function getLevelColor(level: string) {
  const normalized = getNormalizedLevel(level)
  switch (normalized) {
    case "good":
      return "text-aqi-good"
    case "moderate":
      return "text-aqi-moderate"
    case "unhealthy-for-sensitive":
      return "text-aqi-moderate"
    case "unhealthy":
      return "text-aqi-unhealthy"
    case "very-unhealthy":
      return "text-aqi-very-unhealthy"
    case "hazardous":
      return "text-aqi-hazardous"
    default:
      return "text-muted-foreground"
  }
}

function getLevelBgColor(level: string) {
  const normalized = getNormalizedLevel(level)
  switch (normalized) {
    case "good":
      return "bg-aqi-good"
    case "moderate":
      return "bg-aqi-moderate"
    case "unhealthy-for-sensitive":
      return "bg-aqi-moderate"
    case "unhealthy":
      return "bg-aqi-unhealthy"
    case "very-unhealthy":
      return "bg-aqi-very-unhealthy"
    case "hazardous":
      return "bg-aqi-hazardous"
    default:
      return "bg-muted"
  }
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      {metrics.map((metric, index) => {
        const percentage = Math.min((metric.value / metric.maxValue) * 100, 100)
        const levelColor = getLevelColor(metric.level)
        const levelBgColor = getLevelBgColor(metric.level)
        const normalizedLevel = getNormalizedLevel(metric.level)
        const icon = "icon" in metric ? metric.icon : getIconForPollutant(metric.id)

        return (
          <div
            key={metric.id}
            className="glass-card rounded-2xl p-4 md:p-5 group hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${0.1 * index}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg bg-secondary/50", levelColor)}>
                {icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full capitalize",
                  levelColor,
                  "bg-secondary/50"
                )}
              >
                {normalizedLevel.replace(/-/g, " ")}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl md:text-3xl font-bold", levelColor)}>
                  {metric.value}
                </span>
                <span className="text-sm text-muted-foreground">{metric.unit}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{metric.label}</div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-1000", levelBgColor)}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
