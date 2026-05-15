"use client"

import { Bell, MapPin, Settings, RefreshCw, Map } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import { useAirQualityAlerts } from "@/hooks/use-air-quality"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CitySearch } from "./city-search"
import { AlertsPanel } from "./alerts-panel"
import { SettingsPanel } from "./settings-panel"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardHeader() {
  const { currentCity, isLoading, currentData, fetchAirQuality } = useApp()
  const { alerts } = useAirQualityAlerts()

  return (
    <header className="glass rounded-2xl p-4 md:p-6 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: City and Info */}
        <div className="flex-1 w-full">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 mb-2 p-2 px-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-all duration-300 cursor-pointer w-full md:w-auto">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-semibold text-lg truncate">{currentCity}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Select a City</DialogTitle>
              <DialogDescription>Search and select from available cities</DialogDescription>
              <div className="p-4">
                <CitySearch />
              </div>
            </DialogContent>
          </Dialog>

          {currentData && (
            <div className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(currentData.lastUpdate).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAirQuality(currentCity)}
            disabled={isLoading}
            className="flex items-center gap-2"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {alerts.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-2 relative">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Alerts</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogTitle>Active Alerts</DialogTitle>
                <DialogDescription>View current air quality alerts</DialogDescription>
                <div className="p-4">
                  <AlertsPanel alerts={alerts} />
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2" title="Settings">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Configure alert thresholds and preferences</DialogDescription>
              <div className="p-4">
                <SettingsPanel />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading && <Skeleton className="h-4 w-full mt-4" />}
    </header>
  )
}
