import { NextResponse } from "next/server"
import { askWeatherAssistant } from "@/lib/api/weather-server"

export async function POST(req: Request) {
  try {
    const { messages, defaultLocation } = await req.json()
    const result = await askWeatherAssistant(messages, defaultLocation)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Weather API Route Error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
