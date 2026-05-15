import { NextResponse } from "next/server"
import { fetchAirQualityByCity, fetchAirQualityByCoordinates } from "@/lib/api/aqicn"
import { fetchWeatherByCity, fetchWeatherByCoordinates, mergeWeatherWithAirQuality } from "@/lib/api/openweather"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    let data
    let weather
    if (city) {
      data = await fetchAirQualityByCity(city)
      weather = await fetchWeatherByCity(city)
    } else if (lat && lon) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lon)
      data = await fetchAirQualityByCoordinates(latitude, longitude)
      weather = await fetchWeatherByCoordinates(latitude, longitude)
    } else {
      return NextResponse.json({ error: "City or coordinates required" }, { status: 400 })
    }

    if (data && weather) {
      data = mergeWeatherWithAirQuality(data, weather)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("AQI Route Error:", error)
    return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: 500 })
  }
}
