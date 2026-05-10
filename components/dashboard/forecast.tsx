"use client"

import { Cloud, Sun, CloudRain, CloudFog, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForecastDay {
  day: string
  date: string
  aqi: number
  icon: "sunny" | "cloudy" | "rainy" | "foggy" | "windy"
  high: number
  low: number
}

interface ForecastProps {
  forecast: ForecastDay[]
}

function getWeatherIcon(icon: ForecastDay["icon"]) {
  switch (icon) {
    case "sunny":
      return <Sun className="w-8 h-8" />
    case "cloudy":
      return <Cloud className="w-8 h-8" />
    case "rainy":
      return <CloudRain className="w-8 h-8" />
    case "foggy":
      return <CloudFog className="w-8 h-8" />
    case "windy":
      return <Wind className="w-8 h-8" />
    default:
      return <Sun className="w-8 h-8" />
  }
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

export function Forecast({ forecast }: ForecastProps) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">7-Day Forecast</h3>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {forecast.map((day, index) => (
          <div
            key={day.day}
            className={cn(
              "flex-shrink-0 w-28 p-4 rounded-xl transition-all duration-300 hover:scale-105",
              index === 0 ? "bg-primary/20 ring-2 ring-primary/50" : "bg-secondary/30 hover:bg-secondary/50"
            )}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-foreground">{day.day}</div>
              <div className="text-xs text-muted-foreground mb-3">{day.date}</div>

              <div className={cn("flex justify-center mb-3", getAqiColor(day.aqi))}>
                {getWeatherIcon(day.icon)}
              </div>

              <div
                className={cn(
                  "inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-bold mb-2",
                  getAqiBgColor(day.aqi),
                  getAqiColor(day.aqi)
                )}
              >
                {day.aqi}
              </div>

              <div className="flex justify-center gap-2 text-sm">
                <span className="text-foreground font-medium">{day.high}°</span>
                <span className="text-muted-foreground">{day.low}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
