"use client"

import { useState } from "react"
import { Search, MapPin, Settings, Bell, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  currentCity: string
  onCityChange: (city: string) => void
}

const cities = [
  "New York, USA",
  "Los Angeles, USA",
  "London, UK",
  "Tokyo, Japan",
  "Paris, France",
  "Sydney, Australia",
]

export function Header({ currentCity, onCityChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <header className="glass rounded-2xl p-4 md:p-6 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Location Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300 group"
          >
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{currentCity}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl p-2 z-50 animate-fade-in">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onCityChange(city)
                    setIsDropdownOpen(false)
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 rounded-lg transition-all duration-200",
                    city === currentCity
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary/50 text-foreground"
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
          {searchQuery && filteredCities.length > 0 && (
            <div className="absolute mt-2 w-full max-w-md glass-card rounded-xl p-2 z-50">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    onCityChange(city)
                    setSearchQuery("")
                  }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-secondary/50 text-foreground transition-all duration-200"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300 group relative">
            <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          <button className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-300 group">
            <Settings className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors group-hover:rotate-90 duration-500" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">JD</span>
          </div>
        </div>
      </div>
    </header>
  )
}
