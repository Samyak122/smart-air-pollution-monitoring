"use client"

import { Wind, Droplets, Thermometer, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface AqiDisplayProps {
  aqi: number
  status: string
  description: string
  temperature: number
  humidity: number
  visibility: number
  windSpeed: number
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

function getAqiRingColor(aqi: number) {
  if (aqi <= 50) return "ring-aqi-good"
  if (aqi <= 100) return "ring-aqi-moderate"
  if (aqi <= 150) return "ring-aqi-unhealthy-sensitive"
  if (aqi <= 200) return "ring-aqi-unhealthy"
  if (aqi <= 300) return "ring-aqi-very-unhealthy"
  return "ring-aqi-hazardous"
}

export function AqiDisplay({
  aqi,
  status,
  description,
  temperature,
  humidity,
  visibility,
  windSpeed,
}: AqiDisplayProps) {
  const aqiPercentage = Math.min((aqi / 500) * 100, 100)

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Main AQI Circle */}
        <div className="relative">
          <div
            className={cn(
              "w-48 h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center relative",
              getAqiBgColor(aqi),
              "ring-4",
              getAqiRingColor(aqi),
              "animate-pulse-glow"
            )}
            style={{
              boxShadow: `0 0 60px oklch(0.7 0.18 160 / 0.3)`,
            }}
          >
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border/30"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className={getAqiColor(aqi)}
                strokeDasharray={`${aqiPercentage * 2.83} 283`}
                style={{
                  transition: "stroke-dasharray 1s ease-out",
                }}
              />
            </svg>

            <div className="text-center z-10">
              <div className={cn("text-6xl md:text-7xl font-bold", getAqiColor(aqi))}>
                {aqi}
              </div>
              <div className="text-lg text-muted-foreground mt-1">AQI</div>
            </div>
          </div>
        </div>

        {/* Status and Description */}
        <div className="flex-1 text-center lg:text-left">
          <div
            className={cn(
              "inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4",
              getAqiBgColor(aqi),
              getAqiColor(aqi)
            )}
          >
            {status}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-balance">
            Air Quality Index
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            {description}
          </p>

          {/* Weather Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <Thermometer className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Temp</div>
                <div className="font-semibold text-foreground">{temperature}°C</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <Droplets className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Humidity</div>
                <div className="font-semibold text-foreground">{humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Visibility</div>
                <div className="font-semibold text-foreground">{visibility} km</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
              <Wind className="w-5 h-5 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">Wind</div>
                <div className="font-semibold text-foreground">{windSpeed} km/h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
