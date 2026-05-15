"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useApp } from "@/lib/context/app-context"
import { useRealTimeUpdates, useAirQualityAlerts } from "@/hooks/use-air-quality"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AqiDisplay } from "@/components/dashboard/aqi-display"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { Forecast } from "@/components/dashboard/forecast"
import { AqiChart } from "@/components/dashboard/aqi-chart"
import { Sidebar } from "@/components/dashboard/sidebar"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { WeatherAssistantButton } from "@/components/dashboard/weather-assistant-panel"
import { Skeleton } from "@/components/ui/skeleton"

interface ForecastDay {
  day: string
  date: string
  aqi: number
  icon: "sunny" | "cloudy" | "rainy" | "foggy" | "windy"
  high: number
  low: number
}

function DashboardContent() {
  const { currentData, isLoading, error, currentCity } = useApp()
  const { alerts } = useAirQualityAlerts()
  const [forecast, setForecast] = useState<ForecastDay[]>([])

  // Enable real-time updates (30 minutes interval)
  useRealTimeUpdates(1800000)

  // Fetch forecast data
  useEffect(() => {
    async function loadForecast() {
      try {
        const res = await fetch(`/api/forecast?city=${encodeURIComponent(currentCity)}`)
        if (res.ok) {
          const parsed = await res.json()
          const dayNames = ["Today", "Tomorrow", "Mon", "Tue", "Wed", "Thu", "Fri"]
          const formatted: ForecastDay[] = parsed.map((day: any, index: number) => {
            return {
              day: dayNames[index] || new Date(day.date).toLocaleDateString("en-US", { weekday: "short" }),
              date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              aqi: day.aqi,
              icon: "cloudy" as const,
              high: day.temperature?.high || 0,
              low: day.temperature?.low || 0,
            }
          })
          setForecast(formatted)
        }
      } catch (err) {
        console.error("Forecast fetch error:", err)
      }

    }

    if (currentCity) {
      loadForecast()
    }
  }, [currentCity])

  // Generate mock chart data
  const mockChartData = Array.from({ length: 9 }, (_, i) => ({
    time: `${i * 3}:00`,
    aqi: Math.round((currentData?.aqi || 72) + (Math.random() - 0.5) * 20),
    pm25: Math.round((currentData?.pollutants[0]?.value || 35) + (Math.random() - 0.5) * 10),
  }))

  if (error) {
    return (
      <div className="center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <DashboardHeader />

      {/* Alerts Panel */}
      {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* AQI Display */}
          {isLoading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : currentData ? (
            <AqiDisplay
              aqi={currentData.aqi}
              status={currentData.level.replace(/-/g, " ").toUpperCase()}
              description={getAQIDescription(currentData.aqi)}
              temperature={currentData.temperature}
              humidity={currentData.humidity}
              visibility={currentData.location.latitude}
              windSpeed={currentData.windSpeed}
            />
          ) : null}

          {/* Metrics Grid */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 animate-fade-in">Pollutant Levels</h3>
            {isLoading ? (
              <Skeleton className="h-32 rounded-2xl" />
            ) : currentData ? (
              <MetricsGrid metrics={currentData.pollutants} />
            ) : null}
          </div>

          {/* Chart and Forecast */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AqiChart data={mockChartData} />
            {forecast.length > 0 ? <Forecast forecast={forecast} /> : <Skeleton className="h-64 rounded-2xl" />}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Sidebar nearbyLocations={[]} healthTips={getHealthTips(currentData?.aqi || 0)} />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
        <p suppressHydrationWarning>
          Last updated: {currentData?.lastUpdate ? new Date(currentData.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "..."} • Data sourced from OpenWeather
        </p>
      </footer>
    </>
  )
}

export default function Dashboard() {
  const { currentData } = useApp()
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/city-bg.jpg"
          alt="City skyline background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/85 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <DashboardContent />
        </div>
      </div>

      {/* Weather Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <WeatherAssistantButton defaultLocation={currentData?.location.name} />
      </div>
    </div>
  )
}

// Helper functions
function getAQIDescription(aqi: number): string {
  if (aqi <= 50) return "Good - Air quality is satisfactory, and air pollution poses little or no risk."
  if (aqi <= 100) return "Moderate - Air quality is acceptable; however, there may be some pollution."
  if (aqi <= 150) return "Unhealthy for Sensitive Groups - Members of sensitive groups may experience health effects."
  if (aqi <= 200) return "Unhealthy - Everyone may begin to experience health effects."
  if (aqi <= 300) return "Very Unhealthy - Health alert: Everyone may experience serious health effects."
  return "Hazardous - Health Warn: Emergency conditions; the entire population is more likely to be affected."
}

function getHealthTips(aqi: number): string[] {
  if (aqi > 200) {
    return [
      "Stay indoors and keep activity levels low",
      "Close windows and doors",
      "Run air purifiers with HEPA filters",
      "Wear N95 masks if you must go outside",
      "Consult doctor if experiencing symptoms",
    ]
  }
  if (aqi > 150) {
    return [
      "Limit prolonged outdoor exertion",
      "Sensitive groups should reduce outdoor activities",
      "Use air purifiers indoors",
      "Keep emergency medications nearby",
      "Monitor air quality regularly",
    ]
  }
  if (aqi > 100) {
    return [
      "Sensitive groups should limit outdoor exposure",
      "Consider wearing masks for outdoor activities",
      "Keep windows closed during peak hours",
      "Use air purifiers for better air quality",
      "Stay hydrated and monitor your health",
    ]
  }
  if (aqi > 50) {
    return [
      "Air quality is acceptable for most people",
      "Unusually sensitive people should consider limiting outdoor exposure",
      "Regular exercise is still recommended",
      "Keep track of air quality changes",
      "Use appropriate ventilation indoors",
    ]
  }
  return [
    "Air quality is good - enjoy outdoor activities",
    "This is an excellent day for exercise",
    "Open windows for natural ventilation",
    "Perfect conditions for outdoor sports",
    "No air quality concerns for today",
  ]
}
