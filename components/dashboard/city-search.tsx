"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import { searchCities, getDemoData } from "@/lib/api/aqicn"
import { CitySearchResult } from "@/lib/types"
import { cn } from "@/lib/utils"

// Popular cities fallback - expanded list with major Indian cities for better coverage
const POPULAR_CITIES: CitySearchResult[] = [
  // Major Indian Cities
  { name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8776 },
  { name: "Bangalore", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { name: "Kolkata", country: "India", latitude: 22.5726, longitude: 88.3639 },
  { name: "Chennai", country: "India", latitude: 13.0827, longitude: 80.2707 },
  { name: "Hyderabad", country: "India", latitude: 17.3850, longitude: 78.4867 },
  { name: "Pune", country: "India", latitude: 18.5204, longitude: 73.8567 },
  { name: "Ahmedabad", country: "India", latitude: 23.0225, longitude: 72.5714 },
  { name: "Jaipur", country: "India", latitude: 26.9124, longitude: 75.7873 },
  { name: "Lucknow", country: "India", latitude: 26.8467, longitude: 80.9462 },
  { name: "Kanpur", country: "India", latitude: 25.3690, longitude: 75.8577 },
  { name: "Ghaziabad", country: "India", latitude: 28.6692, longitude: 77.4538 },
  { name: "Indore", country: "India", latitude: 22.7196, longitude: 75.8577 },
  { name: "Chandigarh", country: "India", latitude: 30.7333, longitude: 76.7794 },
  { name: "Amritsar", country: "India", latitude: 31.6340, longitude: 74.8711 },
  { name: "Srinagar", country: "India", latitude: 34.0836, longitude: 74.7973 },
  { name: "Bhopal", country: "India", latitude: 23.1815, longitude: 79.9864 },
  { name: "Visakhapatnam", country: "India", latitude: 17.6869, longitude: 83.2185 },
  { name: "Nagpur", country: "India", latitude: 21.1458, longitude: 79.0882 },
  { name: "Pimpri-Chinchwad", country: "India", latitude: 18.6298, longitude: 73.7997 },
  
  // International Cities
  { name: "Beijing", country: "China", latitude: 39.9042, longitude: 116.4074 },
  { name: "Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737 },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
  { name: "New York", country: "USA", latitude: 40.7128, longitude: -74.006 },
  { name: "Los Angeles", country: "USA", latitude: 34.0522, longitude: -118.2437 },
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522 },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
  { name: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018 },
  { name: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { name: "Dubai", country: "UAE", latitude: 25.2048, longitude: 55.2708 },
  { name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332 },
  { name: "São Paulo", country: "Brazil", latitude: -23.5505, longitude: -46.6333 },
  { name: "Moscow", country: "Russia", latitude: 55.7558, longitude: 37.6173 },
  { name: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784 },
  { name: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357 },
  { name: "Lahore", country: "Pakistan", latitude: 31.5497, longitude: 74.3436 },
  { name: "Dhaka", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125 },
  { name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978 },
  { name: "Hong Kong", country: "Hong Kong", latitude: 22.3193, longitude: 114.1694 },
  { name: "Amsterdam", country: "Netherlands", latitude: 52.374, longitude: 4.8952 },
  { name: "Toronto", country: "Canada", latitude: 43.6629, longitude: -79.3957 },
]

interface CitySearchProps {
  onClose?: () => void
}

export function CitySearch({ onClose }: CitySearchProps) {
  const { fetchAirQuality } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<CitySearchResult[]>(POPULAR_CITIES)
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setResults(POPULAR_CITIES)
      return
    }

    setIsSearching(true)
    try {
      // Try to search via API, fall back to local filtering
      const apiResults = await searchCities(query)
      if (apiResults.length > 0) {
        setResults(apiResults)
      } else {
        // Filter from popular cities
        const filtered = POPULAR_CITIES.filter((city) =>
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.country.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered.length > 0 ? filtered : POPULAR_CITIES)
      }
    } catch (error) {
      console.error("Search error:", error)
      setResults(POPULAR_CITIES)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectCity = async (city: CitySearchResult) => {
    const cityName = city.country && city.country !== "Unknown" ? `${city.name}, ${city.country}` : city.name
    await fetchAirQuality(cityName)
    setIsOpen(false)
    setSearchQuery("")
    onClose?.()
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search cities..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          )}
        />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No cities found</div>
          ) : (
            results.map((city, index) => (
              <button
                key={`${city.name}-${city.country}-${city.latitude}-${city.longitude}-${index}`}
                onClick={() => handleSelectCity(city)}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm hover:bg-secondary transition-colors",
                  "flex items-center gap-2 border-b border-border last:border-0"
                )}
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{city.name}</div>
                  <div className="text-xs text-muted-foreground">{city.country}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
