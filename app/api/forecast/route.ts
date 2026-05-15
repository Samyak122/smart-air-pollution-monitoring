import { NextResponse } from "next/server"
import { fetchForecastByCity, fetchForecastByCoordinates, parseOpenWeatherForecast } from "@/lib/api/openweather"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    let data
    if (city) {
      data = await fetchForecastByCity(city)
    } else if (lat && lon) {
      data = await fetchForecastByCoordinates(parseFloat(lat), parseFloat(lon))
    } else {
      return NextResponse.json({ error: "City or coordinates required" }, { status: 400 })
    }

    return NextResponse.json(data ? parseOpenWeatherForecast(data) : [])
  } catch (error) {
    console.error("Forecast Route Error:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}
