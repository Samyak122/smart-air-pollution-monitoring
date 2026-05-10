"use client"

import { useApp } from "@/lib/context/app-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

interface CityLocation {
  name: string
  aqi: number
  latitude: number
  longitude: number
  level: string
}

export function MapView() {
  const { currentData } = useApp()

  // Sample nearby cities/monitoring stations
  const nearbyStations: CityLocation[] = [
    currentData
      ? {
          name: currentData.location.name,
          aqi: currentData.aqi,
          latitude: currentData.location.latitude,
          longitude: currentData.location.longitude,
          level: currentData.level,
        }
      : null,
    { name: "Station A", aqi: 75, latitude: 28.65, longitude: 77.25, level: "moderate" },
    { name: "Station B", aqi: 92, latitude: 28.58, longitude: 77.18, level: "unhealthy-for-sensitive" },
    { name: "Station C", aqi: 45, latitude: 28.68, longitude: 77.35, level: "good" },
  ].filter(Boolean) as CityLocation[]

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500"
    if (aqi <= 100) return "bg-yellow-500"
    if (aqi <= 150) return "bg-orange-500"
    if (aqi <= 200) return "bg-red-500"
    if (aqi <= 300) return "bg-purple-500"
    return "bg-maroon-900"
  }

  const getAQIColorBadge = (aqi: number) => {
    if (aqi <= 50) return "default"
    if (aqi <= 100) return "secondary"
    if (aqi <= 150) return "destructive"
    if (aqi <= 200) return "destructive"
    return "destructive"
  }

  return (
    <Card className="glass-card rounded-2xl p-6 animate-fade-in overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Monitoring Stations Map</h3>
        <p className="text-sm text-muted-foreground">AQI levels of nearby monitoring stations</p>
      </div>

      {/* Simple grid-based map visualization */}
      <div className="relative w-full h-80 bg-secondary/30 rounded-lg border border-border overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="col-span-1 border-r border-border/20"
              style={{ gridColumn: i + 1, gridRow: "1 / -1" }}
            />
          ))}
        </div>

        {/* Station markers */}
        {nearbyStations.map((station, index) => {
          // Normalize latitude and longitude to percentage (rough approximation)
          const lat = ((station.latitude - 28.5) / 0.3) * 100
          const lon = ((station.longitude - 77.0) / 0.4) * 100

          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${Math.max(5, Math.min(95, lon))}%`,
                top: `${Math.max(5, Math.min(95, lat))}%`,
              }}
            >
              <div className={`w-8 h-8 rounded-full ${getAQIColor(station.aqi)} opacity-70 animate-pulse`} />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg px-2 py-2 whitespace-nowrap text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg pointer-events-none">
                <div className="font-semibold">{station.name}</div>
                <div className="text-muted-foreground">AQI: {station.aqi}</div>
              </div>
            </div>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur border border-border rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Very Unhealthy (151+)</span>
          </div>
        </div>
      </div>

      {/* Stations list */}
      <div className="mt-4 space-y-2">
        {nearbyStations.map((station, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-sm">{station.name}</div>
                <div className="text-xs text-muted-foreground">
                  {station.latitude.toFixed(2)}°, {station.longitude.toFixed(2)}°
                </div>
              </div>
            </div>
            <Badge variant={getAQIColorBadge(station.aqi)}>{station.aqi}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
