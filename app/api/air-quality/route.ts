import { NextResponse } from "next/server"
import { fetchAirQualityByCity, fetchAirQualityByCoordinates } from "@/lib/api/aqicn"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get("city")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  try {
    let data
    if (city) {
      data = await fetchAirQualityByCity(city)
    } else if (lat && lon) {
      data = await fetchAirQualityByCoordinates(parseFloat(lat), parseFloat(lon))
    } else {
      return NextResponse.json({ error: "City or coordinates required" }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("AQI Route Error:", error)
    return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: 500 })
  }
}
