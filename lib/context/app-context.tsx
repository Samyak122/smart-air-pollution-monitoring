"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { AirQualityData, AlertConfig } from "@/lib/types"

interface AppContextType {
  // Current data
  currentCity: string
  currentData: AirQualityData | null
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentCity: (city: string) => void
  fetchAirQuality: (city: string) => Promise<void>
  fetchByCoordinates: (lat: number, lon: number) => Promise<void>
  clearError: () => void

  // Settings
  alertConfig: AlertConfig
  setAlertConfig: (config: Partial<AlertConfig>) => void

  // Favorites
  favoriteCities: string[]
  addFavorite: (city: string) => void
  removeFavorite: (city: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCity] = useState("Delhi")
  const [currentData, setCurrentData] = useState<AirQualityData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favoriteCities, setFavoriteCities] = useState<string[]>([
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Kolkata",
    "Chennai",
    "Hyderabad",
  ])
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    pm25Threshold: 35,
    pm10Threshold: 50,
    no2Threshold: 40,
    o3Threshold: 100,
    aqiThreshold: 100,
  })

  const fetchAirQuality = useCallback(async (city: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`)
      if (!res.ok) {
        setError(`Could not fetch data for ${city}`)
        return
      }
      const data = await res.json()
      if (data) {
        setCurrentData(data)
        setCurrentCity(data.location.name)
      }
    } catch (err) {
      setError(`Error fetching data: ${err}`)
    } finally {
      setIsLoading(false)
    }

  }, [])

  const fetchByCoordinates = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`)
      if (!res.ok) {
        setError("Could not fetch data for current location")
        return
      }
      const data = await res.json()
      if (data) {
        setCurrentData(data)
        setCurrentCity(data.location.name)
      }
    } catch (err) {
      setError(`Error fetching data: ${err}`)
    } finally {
      setIsLoading(false)
    }

  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const addFavorite = useCallback((city: string) => {
    setFavoriteCities((prev) => (prev.includes(city) ? prev : [...prev, city]))
  }, [])

  const removeFavorite = useCallback((city: string) => {
    setFavoriteCities((prev) => prev.filter((c) => c !== city))
  }, [])

  // Fetch initial data on mount
  useEffect(() => {
    fetchAirQuality(currentCity)
  }, [])

  const value: AppContextType = {
    currentCity,
    currentData,
    isLoading,
    error,
    setCurrentCity,
    fetchAirQuality,
    fetchByCoordinates,
    clearError,
    alertConfig,
    setAlertConfig,
    favoriteCities,
    addFavorite,
    removeFavorite,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
