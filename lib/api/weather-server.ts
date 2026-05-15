"use server"

import "server-only"

if (typeof window !== "undefined") {
  throw new Error("Weather assistant logic must only run on the server!")
}

/**
 * AI Weather Assistant — Hugging Face Edition
 * ─────────────────────────────────────────────
 * Flow:
 *  1. Extract location from conversation
 *  2. Geocode location → lat/lon  (free OWM Geocoding API)
 *  3. Fetch current weather + 5-day forecast  (free OWM 2.5 APIs)
 *  4. Build a rich system prompt with the weather data
 *  5. Send user question + weather context to HF Inference API (free)
 *  6. Return the AI-generated natural language response
 *
 * Models used (both free on HF):
 *  Primary  → mistralai/Mistral-7B-Instruct-v0.3
 *  Fallback → HuggingFaceH4/zephyr-7b-beta
 */

const OWM_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ""
const HF_KEY  = process.env.HF_API_KEY || process.env.NEXT_PUBLIC_HF_API_KEY || ""

// HF models to try in order (all free)
const HF_MODELS = [
  "mistralai/Mistral-7B-Instruct-v0.3",
  "HuggingFaceH4/zephyr-7b-beta",
  "microsoft/Phi-3-mini-4k-instruct",
]

/* ─────────────────────────────────────────────────────────────── */
/* Types                                                           */
/* ─────────────────────────────────────────────────────────────── */
import type { WeatherAssistantMessage, WeatherAssistantResponse } from "./weather-types"


interface GeoResult {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

interface CurrentWeather {
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_deg: number
  clouds: number
  visibility: number
  description: string
  icon: string
  rain_1h?: number
  snow_1h?: number
}

interface ForecastDay {
  date: string
  weekday: string
  temp_min: number
  temp_max: number
  description: string
  pop: number   // probability of precipitation 0-1
  humidity: number
  wind_speed: number
}

/* ─────────────────────────────────────────────────────────────── */
/* 1. Geocoding (free OWM API)                                     */
/* ─────────────────────────────────────────────────────────────── */
async function geocode(city: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_KEY}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.[0] ?? null
  } catch {
    return null
  }
}

/* ─────────────────────────────────────────────────────────────── */
/* 2. Current Weather (free OWM 2.5 API)                          */
/* ─────────────────────────────────────────────────────────────── */
async function fetchCurrentWeather(lat: number, lon: number): Promise<CurrentWeather | null> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OWM_KEY}`
    )
    if (!res.ok) return null
    const d = await res.json()
    return {
      temp:        d.main.temp,
      feels_like:  d.main.feels_like,
      temp_min:    d.main.temp_min,
      temp_max:    d.main.temp_max,
      humidity:    d.main.humidity,
      pressure:    d.main.pressure,
      wind_speed:  d.wind?.speed ?? 0,
      wind_deg:    d.wind?.deg ?? 0,
      clouds:      d.clouds?.all ?? 0,
      visibility:  Math.round((d.visibility ?? 10000) / 1000),
      description: d.weather?.[0]?.description ?? "clear sky",
      icon:        d.weather?.[0]?.icon ?? "01d",
      rain_1h:     d.rain?.["1h"],
      snow_1h:     d.snow?.["1h"],
    }
  } catch {
    return null
  }
}

/* ─────────────────────────────────────────────────────────────── */
/* 3. 5-day Forecast (free OWM 2.5 API)                           */
/* ─────────────────────────────────────────────────────────────── */
async function fetchForecast(lat: number, lon: number): Promise<ForecastDay[]> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${OWM_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()

    // Bucket 3-hourly items by calendar date
    const buckets: Record<string, { temps: number[]; pops: number[]; descs: string[]; hums: number[]; winds: number[] }> = {}
    for (const item of data.list ?? []) {
      const key = new Date(item.dt * 1000).toISOString().slice(0, 10)
      if (!buckets[key]) buckets[key] = { temps: [], pops: [], descs: [], hums: [], winds: [] }
      buckets[key].temps.push(item.main.temp)
      buckets[key].pops.push(item.pop ?? 0)
      buckets[key].descs.push(item.weather?.[0]?.description ?? "")
      buckets[key].hums.push(item.main.humidity)
      buckets[key].winds.push(item.wind?.speed ?? 0)
    }

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 6)
      .map(([date, v]) => {
        const dt = new Date(date + "T12:00:00Z")
        return {
          date,
          weekday: dt.toLocaleDateString("en-US", { weekday: "long" }),
          temp_min: Math.round(Math.min(...v.temps)),
          temp_max: Math.round(Math.max(...v.temps)),
          description: v.descs[Math.floor(v.descs.length / 2)],
          pop: Math.max(...v.pops),
          humidity: Math.round(v.hums.reduce((a, b) => a + b, 0) / v.hums.length),
          wind_speed: Math.round(v.winds.reduce((a, b) => a + b, 0) / v.winds.length),
        }
      })
  } catch {
    return []
  }
}

/* ─────────────────────────────────────────────────────────────── */
/* 4. Build system prompt with live weather data                   */
/* ─────────────────────────────────────────────────────────────── */
function buildSystemPrompt(
  locationName: string,
  cur: CurrentWeather,
  forecast: ForecastDay[]
): string {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const wind = (ms: number) =>
    ms < 0.5 ? "calm" : ms < 3.3 ? "light breeze" : ms < 7.9 ? "moderate breeze" : ms < 13.8 ? "fresh breeze" : "strong wind"

  const forecastText = forecast.map((d, i) =>
    `  ${i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.weekday}: ${capitalize(d.description)}, ` +
    `${d.temp_min}–${d.temp_max}°C, Rain: ${Math.round(d.pop * 100)}%, ` +
    `Humidity: ${d.humidity}%, Wind: ${d.wind_speed} m/s`
  ).join("\n")

  return `You are a friendly and knowledgeable AI Weather Assistant. Answer weather questions conversationally and helpfully.
Use the real-time weather data below to answer the user's question. Be concise but informative.
Use emojis sparingly to make responses engaging. Format important numbers in bold.

=== LIVE WEATHER DATA FOR ${locationName.toUpperCase()} ===

CURRENT CONDITIONS (right now):
- Temperature: ${Math.round(cur.temp)}°C (feels like ${Math.round(cur.feels_like)}°C)
- Today's range: ${Math.round(cur.temp_min)}°C – ${Math.round(cur.temp_max)}°C
- Sky: ${capitalize(cur.description)}
- Humidity: ${cur.humidity}%
- Wind: ${cur.wind_speed} m/s (${wind(cur.wind_speed)})
- Cloud cover: ${cur.clouds}%
- Visibility: ${cur.visibility} km
- Pressure: ${cur.pressure} hPa
${cur.rain_1h != null ? `- Rain (last hour): ${cur.rain_1h} mm` : ""}
${cur.snow_1h != null ? `- Snow (last hour): ${cur.snow_1h} mm` : ""}

5-DAY FORECAST:
${forecastText}

=== END OF WEATHER DATA ===

Instructions:
- Answer ONLY weather-related questions using the data above
- If asked about clothing, give specific advice based on temperature and rain chance
- If asked about umbrella, check rain probability from the forecast
- If asked about activities (swimming, hiking, etc.), assess suitability based on the weather
- If user asks about a DIFFERENT location, say you need to check and ask them to specify
- Keep answers under 120 words unless detailed forecast is requested
- Always mention the location name in your response`
}

/* ─────────────────────────────────────────────────────────────── */
/* 5. Call Hugging Face Inference API                              */
/* ─────────────────────────────────────────────────────────────── */
async function callHuggingFace(
  systemPrompt: string,
  messages: WeatherAssistantMessage[]
): Promise<string | null> {
  if (!HF_KEY || HF_KEY === "hf_your_token_here") return null

  // Build the messages array in OpenAI-compatible format
  const chatMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  for (const model of HF_MODELS) {
    try {
      console.log(`[Server] Calling Hugging Face model: ${model}`)
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: chatMessages,
            max_tokens: 350,
            temperature: 0.65,
            top_p: 0.9,
            stream: false,
          }),
          signal: AbortSignal.timeout(20000),
        }
      )

      if (!res.ok) {
        const err = await res.text()
        console.warn(`HF model ${model} failed:`, res.status, err)
        continue
      }

      const data = await res.json()
      const content = data?.choices?.[0]?.message?.content?.trim()
      if (content) return content
    } catch (e) {
      console.warn(`HF model ${model} error:`, e)
    }
  }

  return null
}

/* ─────────────────────────────────────────────────────────────── */
/* 6. Extract location from conversation                           */
/* ─────────────────────────────────────────────────────────────── */
function extractLocation(
  question: string,
  history: WeatherAssistantMessage[],
  defaultLocation?: string
): string | null {
  // Strip trailing time/qualifier words BEFORE matching city names
  const TIME_WORDS = /\b(today|tomorrow|tonight|now|this week|next week|this weekend|next weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi
  const clean = (s: string) => s.replace(TIME_WORDS, "").replace(/\s{2,}/g, " ").trim()

  const patterns = [
    // "weather in Mumbai", "weather for London", "weather at Paris"
    /weather\s+(?:in|for|at|of)\s+([A-Za-z][a-zA-Z\s\-]{1,30})/i,
    // "in Mumbai", "for London"
    /\b(?:in|for|at|near|about|to)\s+([a-zA-Z][a-zA-Z\s\-]{1,28}?)(?:\s*[?,!.]|$)/i,
    // "Mumbai weather"
    /([a-zA-Z][a-zA-Z\s\-]{1,28}?)\s+weather\b/i,
    // "visit/go to/travel to Mumbai"
    /(?:visit|go to|travel to|trip to|weather in)\s+([a-zA-Z][a-zA-Z\s\-]{1,28})/i,
    // Just a city name (for short queries like "London?")
    /^([A-Z][a-z]{2,20})\?*$/
  ]

  const tryExtract = (text: string): string | null => {
    const cleanText = clean(text)
    for (const pat of patterns) {
      const m = cleanText.match(pat)
      const loc = m?.[1]?.trim()
      if (loc && loc.length > 1) {
        // Final cleanup: remove trailing time words from extracted location
        return clean(loc).replace(/\s+/g, " ").trim() || null
      }
    }
    return null
  }

  // Check current question first
  const fromQuestion = tryExtract(question)
  if (fromQuestion) return fromQuestion

  // Scan history most-recent-first
  for (let i = history.length - 1; i >= 0; i--) {
    const loc = tryExtract(history[i].content)
    if (loc) return loc
  }

  // ONLY use defaultLocation if the question is actually about weather
  const isWeatherQ = /weather|temp|rain|sun|cloud|sky|hot|cold|condition|how is it|forecast/i.test(question)
  if (isWeatherQ && defaultLocation) {
    return defaultLocation
  }

  return null
}


/* ─────────────────────────────────────────────────────────────── */
/* 7. Local smart fallback (no AI needed)                          */
/* ─────────────────────────────────────────────────────────────── */
function localAnswer(
  question: string,
  locationName: string,
  cur: CurrentWeather,
  forecast: ForecastDay[]
): string {
  const q = question.toLowerCase()
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const today = forecast[0]
  const tomorrow = forecast[1]
  const wind = (ms: number) =>
    ms < 0.5 ? "calm" : ms < 3.3 ? "light breeze" : ms < 7.9 ? "moderate breeze" : ms < 13.8 ? "fresh breeze" : "strong wind"

  const clothing = (temp: number, rainPop: number, windSpd: number) => {
    const parts: string[] = []
    if (temp > 30)       parts.push("light, breathable clothing")
    else if (temp > 22)  parts.push("light clothing")
    else if (temp > 15)  parts.push("a light jacket")
    else if (temp > 8)   parts.push("a warm jacket and layers")
    else                 parts.push("a heavy coat, hat, and gloves")
    if (rainPop > 0.4)   parts.push("umbrella/rain jacket ☔")
    if (windSpd > 8)     parts.push("windproof layer")
    return parts.join(" + ")
  }

  // Umbrella / rain
  if (/umbrella|rain|raincoat/.test(q)) {
    const day = /tomorrow/.test(q) ? tomorrow : today
    if (!day) return `🌂 Current sky: **${cap(cur.description)}**, Humidity: **${cur.humidity}%**`
    const pct = Math.round(day.pop * 100)
    return (
      `🌂 **${/tomorrow/.test(q) ? "Tomorrow" : "Today"} in ${locationName}** — ${cap(day.description)}\n\n` +
      `Rain probability: **${pct}%**\n\n` +
      (pct > 50 ? "Yes, definitely bring an umbrella! ☔" :
       pct > 20 ? "A light chance of rain — umbrella optional." :
       "No umbrella needed today! ☀️")
    )
  }

  // Clothing
  if (/wear|dress|cloth|outfit|jacket/.test(q)) {
    const pop = today?.pop ?? 0
    return (
      `👕 **Clothing for ${locationName}:**\n\n` +
      `Currently **${Math.round(cur.temp)}°C**, ${cap(cur.description)}.\n\n` +
      `Wear: **${clothing(cur.temp, pop, cur.wind_speed)}**\n` +
      `Feels like ${Math.round(cur.feels_like)}°C with ${cur.humidity}% humidity.`
    )
  }

  // Swimming
  if (/swim|beach|surf|pool/.test(q)) {
    const suitable = cur.temp >= 26 && !cur.description.includes("storm") && !cur.description.includes("rain")
    return (
      `🏊 **Swimming in ${locationName}:**\n\n` +
      `Temperature: **${Math.round(cur.temp)}°C** — ${suitable ? "Great day for a swim! 🏖️" : "Not ideal for swimming today."}\n` +
      `Sky: ${cap(cur.description)} | Wind: ${cur.wind_speed} m/s`
    )
  }

  // Weekend
  if (/weekend/.test(q)) {
    const sat = forecast[5] ?? forecast[forecast.length - 1]
    const sun = forecast[6] ?? forecast[forecast.length - 1]
    return (
      `📅 **Weekend in ${locationName}:**\n\n` +
      `**Saturday:** ${cap(sat?.description ?? "—")} | ${sat?.temp_min ?? "—"}–${sat?.temp_max ?? "—"}°C | Rain: ${Math.round((sat?.pop ?? 0) * 100)}%\n` +
      `**Sunday:** ${cap(sun?.description ?? "—")} | ${sun?.temp_min ?? "—"}–${sun?.temp_max ?? "—"}°C | Rain: ${Math.round((sun?.pop ?? 0) * 100)}%`
    )
  }

  // Tomorrow
  if (/tomorrow/.test(q) && tomorrow) {
    return (
      `📅 **Tomorrow in ${locationName} (${tomorrow.weekday}):**\n\n` +
      `${cap(tomorrow.description)}\n\n` +
      `🌡️ **${tomorrow.temp_min}–${tomorrow.temp_max}°C** | 💧 Rain: ${Math.round(tomorrow.pop * 100)}% | ` +
      `💨 Wind: ${tomorrow.wind_speed} m/s`
    )
  }

  // 5-day / weekly
  if (/week|5.day|forecast|next few/.test(q)) {
    const lines = forecast.map((d, i) =>
      `• **${i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.weekday}** — ${cap(d.description)} | ${d.temp_min}–${d.temp_max}°C | 💧${Math.round(d.pop * 100)}%`
    )
    return `📆 **5-day forecast for ${locationName}:**\n\n${lines.join("\n")}`
  }

  // Wind
  if (/wind|gust|breeze/.test(q)) {
    return `💨 **Wind in ${locationName}:** **${cur.wind_speed} m/s** — ${wind(cur.wind_speed)}.`
  }

  // Temperature
  if (/temp|hot|cold|degree|celsius/.test(q)) {
    return (
      `🌡️ **Temperature in ${locationName}:**\n\n` +
      `Now: **${Math.round(cur.temp)}°C** (feels like ${Math.round(cur.feels_like)}°C)\n` +
      `Today: ${Math.round(cur.temp_min)}–${Math.round(cur.temp_max)}°C`
    )
  }

  // Default: full current conditions
  return (
    `🌤️ **Weather in ${locationName} right now:**\n\n` +
    `${cap(cur.description)}\n\n` +
    `🌡️ **${Math.round(cur.temp)}°C** (feels like ${Math.round(cur.feels_like)}°C)\n` +
    `📊 High ${Math.round(cur.temp_max)}°C / Low ${Math.round(cur.temp_min)}°C\n` +
    `💧 Humidity: ${cur.humidity}% | 💨 Wind: ${cur.wind_speed} m/s\n` +
    `☁️ Clouds: ${cur.clouds}% | 👁️ Visibility: ${cur.visibility} km\n` +
    (today ? `\n**Today's rain chance:** ${Math.round(today.pop * 100)}%` : "") +
    (tomorrow ? `\n**Tomorrow:** ${cap(tomorrow.description)}, ${tomorrow.temp_min}–${tomorrow.temp_max}°C` : "")
  )
}

/* ─────────────────────────────────────────────────────────────── */
/* Public API — used by the chatbot component                      */
/* ─────────────────────────────────────────────────────────────── */
export async function askWeatherAssistant(
  messages: WeatherAssistantMessage[],
  defaultLocation?: string
): Promise<WeatherAssistantResponse | null> {
  if (!OWM_KEY) {
    return {
      answer: "⚠️ OpenWeather API key is missing. Please add `NEXT_PUBLIC_OPENWEATHER_API_KEY` to your `.env.local` file.",
    }
  }

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? ""

  // Step 1: Extract location (defaulting to the detected city if none specified)
  const location = extractLocation(lastUserMsg, messages, defaultLocation) || defaultLocation

  if (!location) {
    return {
      answer:
        "🌍 I'm ready to help! Could you please specify which city you'd like to check? (e.g., Mumbai, London, etc.)",
    }
  }

  // Step 2: Geocode (with fallback for complex names like "Shivajinagar, Pune, Pune")
  let geo = await geocode(location)
  
  if (!geo && location.includes(",")) {
    // Fallback: Try just the first part (e.g., "Shivajinagar" or "Pune")
    const simplified = location.split(",")[0].trim()
    console.log(`[Server] Geocode failed for "${location}", retrying with "${simplified}"`)
    geo = await geocode(simplified)
  }

  if (!geo) {
    return {
      answer: `😕 I couldn't find **"${location}"** on the map. Try using a simpler city name (e.g., just "Pune").`,
    }
  }

  const locationName = `${geo.name}${geo.state ? `, ${geo.state}` : ""}, ${geo.country}`

  // Step 3: Fetch weather data (both free APIs)
  const [cur, forecast] = await Promise.all([
    fetchCurrentWeather(geo.lat, geo.lon),
    fetchForecast(geo.lat, geo.lon),
  ])

  if (!cur) {
    return {
      answer:
        `😕 Couldn't fetch weather data for **${locationName}**.\n\n` +
        "Please check that your OpenWeather API key is valid at openweathermap.org.",
    }
  }

  // Step 4: Try Hugging Face AI response
  const hfAvailable = HF_KEY && HF_KEY !== "hf_your_token_here"

  if (hfAvailable) {
    const systemPrompt = buildSystemPrompt(locationName, cur, forecast)
    const aiAnswer = await callHuggingFace(systemPrompt, messages)
    if (aiAnswer) {
      return { answer: aiAnswer, location: locationName }
    }
    // HF failed → fall through to local answers
    console.warn("HF Inference failed, using local answer generation.")
  }

  // Step 5: Local smart answer (always works, no AI needed)
  const answer = localAnswer(lastUserMsg, locationName, cur, forecast)
  return { answer, location: locationName }
}

/* ─────────────────────────────────────────────────────────────── */
/* Convenience wrappers                                            */
/* ─────────────────────────────────────────────────────────────── */
export async function askSingleQuestion(question: string, location?: string) {
  return askWeatherAssistant([{ role: "user", content: question }], location)
}

export async function getClothingRecommendation(location: string, person = "adult") {
  return askSingleQuestion(`What should ${person} wear in ${location} today?`, location)
}

export async function getForecastSummary(location: string, timeframe = "5 days") {
  return askSingleQuestion(`What is the ${timeframe} weather forecast for ${location}?`, location)
}

export async function compareLocations(loc1: string, loc2: string, purpose = "") {
  return askSingleQuestion(`Which is better ${purpose}: ${loc1} or ${loc2}?`)
}

export async function getHealthAdvice(condition: string, location: string) {
  return askSingleQuestion(
    `What weather advice do you have for someone with ${condition} in ${location}?`,
    location
  )
}

export async function isSuitableForActivity(
  activity: string,
  timeframe = "today",
  location: string
): Promise<boolean> {
  const res = await askSingleQuestion(
    `Is it a good idea to go ${activity} ${timeframe}?`,
    location
  )
  if (!res?.answer) return false
  const negatives = ["not", "no", "don't", "bad", "worse", "terrible", "avoid", "too cold", "unsafe"]
  return !negatives.some((w) => res.answer.toLowerCase().includes(w))
}
