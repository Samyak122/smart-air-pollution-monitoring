"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/lib/context/app-context"

export function useRealTimeUpdates(intervalMs: number = 1800000) {
  // 30 minutes default
  const { currentCity, isLoading, fetchAirQuality } = useApp()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Set up initial interval
    intervalRef.current = setInterval(() => {
      if (!isLoading) {
        fetchAirQuality(currentCity)
      }
    }, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentCity, intervalMs, isLoading, fetchAirQuality])
}

export function useGeolocation() {
  const { fetchByCoordinates, setCurrentCity } = useApp()

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchByCoordinates(latitude, longitude)
      },
      (error) => {
        console.error("Geolocation error:", error)
      }
    )
  }

  return { requestLocation }
}

export function useAirQualityAlerts() {
  const { currentData, alertConfig } = useApp()

  const checkAlerts = () => {
    if (!currentData) return []

    const alerts: Array<{ type: string; message: string; severity: "low" | "medium" | "high" }> = []

    // Check AQI threshold
    if (currentData.aqi > alertConfig.aqiThreshold) {
      alerts.push({
        type: "AQI",
        message: `Air Quality Index is ${currentData.aqi} (${currentData.level})`,
        severity: currentData.aqi > 200 ? "high" : "medium",
      })
    }

    // Check individual pollutants
    currentData.pollutants.forEach((pollutant) => {
      let threshold = alertConfig.aqiThreshold
      if (pollutant.id === "pm25") threshold = alertConfig.pm25Threshold
      else if (pollutant.id === "pm10") threshold = alertConfig.pm10Threshold
      else if (pollutant.id === "no2") threshold = alertConfig.no2Threshold
      else if (pollutant.id === "o3") threshold = alertConfig.o3Threshold

      if (pollutant.value > threshold) {
        alerts.push({
          type: pollutant.label,
          message: `${pollutant.label} level is ${pollutant.value} ${pollutant.unit}`,
          severity: pollutant.value > threshold * 2 ? "high" : "medium",
        })
      }
    })

    return alerts
  }

  return { alerts: checkAlerts() }
}
