"use client"

import { useState } from "react"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, AlertCircle } from "lucide-react"
import { CitySearch } from "./city-search"

export function SettingsPanel() {
  const {
    alertConfig,
    setAlertConfig,
    favoriteCities,
    addFavorite,
    removeFavorite,
    currentCity,
  } = useApp()

  const isFavorite = favoriteCities.includes(currentCity)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">Alert Thresholds</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Cities</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card className="glass-card p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    AQI Threshold
                  </Label>
                  <span className="text-sm font-medium">{alertConfig.aqiThreshold}</span>
                </div>
                <Slider
                  value={[alertConfig.aqiThreshold]}
                  onValueChange={([value]) =>
                    setAlertConfig({ ...alertConfig, aqiThreshold: value })
                  }
                  min={0}
                  max={500}
                  step={10}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>PM2.5 Threshold (µg/m³)</Label>
                  <span className="text-sm font-medium">{alertConfig.pm25Threshold}</span>
                </div>
                <Slider
                  value={[alertConfig.pm25Threshold]}
                  onValueChange={([value]) =>
                    setAlertConfig({ ...alertConfig, pm25Threshold: value })
                  }
                  min={0}
                  max={500}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>PM10 Threshold (µg/m³)</Label>
                  <span className="text-sm font-medium">{alertConfig.pm10Threshold}</span>
                </div>
                <Slider
                  value={[alertConfig.pm10Threshold]}
                  onValueChange={([value]) =>
                    setAlertConfig({ ...alertConfig, pm10Threshold: value })
                  }
                  min={0}
                  max={500}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>NO₂ Threshold (µg/m³)</Label>
                  <span className="text-sm font-medium">{alertConfig.no2Threshold}</span>
                </div>
                <Slider
                  value={[alertConfig.no2Threshold]}
                  onValueChange={([value]) =>
                    setAlertConfig({ ...alertConfig, no2Threshold: value })
                  }
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>O₃ Threshold (µg/m³)</Label>
                  <span className="text-sm font-medium">{alertConfig.o3Threshold}</span>
                </div>
                <Slider
                  value={[alertConfig.o3Threshold]}
                  onValueChange={([value]) =>
                    setAlertConfig({ ...alertConfig, o3Threshold: value })
                  }
                  min={0}
                  max={300}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <Card className="glass-card p-4">
            <div className="mb-4">
              <Label className="mb-2 block">Add City to Favorites</Label>
              <CitySearch />
            </div>

            <div className="space-y-2">
              <Label className="block">Saved Favorites</Label>
              {favoriteCities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No favorite cities yet</p>
              ) : (
                <div className="space-y-2">
                  {favoriteCities.map((city) => (
                    <div
                      key={city}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                    >
                      <span className="text-sm">{city}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(city)}
                        className={`w-8 h-8 p-0 ${
                          city === currentCity ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isFavorite && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => addFavorite(currentCity)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Add {currentCity} to Favorites
              </Button>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
