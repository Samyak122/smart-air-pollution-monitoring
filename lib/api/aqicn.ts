import { AQICNResponse, AirQualityData, AQILevel, CitySearchResult } from "@/lib/types";

const AQICN_API_URL = "https://api.waqi.info";
const API_KEY = process.env.NEXT_PUBLIC_AQICN_API_KEY;

// Map AQICN AQI index to level
function getAQILevel(aqi: number): AQILevel {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy-for-sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very-unhealthy";
  return "hazardous";
}

// Convert AQICN response to our AirQualityData format
export function parseAQICNResponse(response: AQICNResponse): AirQualityData {
  const { data } = response;
  const aqi = Math.round(data.aqi);
  const level = getAQILevel(aqi);

  // Pollutant mappings
  const pollutantData = [
    {
      id: "pm25",
      label: "PM2.5",
      unit: "µg/m³",
      maxValue: 100,
      value: data.iaqi.pm25?.v,
    },
    {
      id: "pm10",
      label: "PM10",
      unit: "µg/m³",
      maxValue: 150,
      value: data.iaqi.pm10?.v,
    },
    { id: "o3", label: "O₃", unit: "µg/m³", maxValue: 200, value: data.iaqi.o3?.v },
    { id: "no2", label: "NO₂", unit: "µg/m³", maxValue: 100, value: data.iaqi.no2?.v },
    { id: "so2", label: "SO₂", unit: "µg/m³", maxValue: 350, value: data.iaqi.so2?.v },
    { id: "co", label: "CO", unit: "mg/m³", maxValue: 10, value: data.iaqi.co?.v },
  ];

  const pollutants = pollutantData
    .filter((p) => p.value !== undefined)
    .map((p) => ({
      id: p.id,
      label: p.label,
      value: Math.round(p.value! * 10) / 10,
      unit: p.unit,
      maxValue: p.maxValue,
      level: getAQILevel(p.value! * 2), // Simple conversion for individual pollutants
    }));

  // Find dominant pollutant (highest normalized value)
  const dominantPollutant =
    pollutants.length > 0
      ? pollutants.reduce((prev, current) =>
          current.value / current.maxValue > prev.value / prev.maxValue ? current : prev
        ).label
      : "N/A";

  return {
    aqi,
    level,
    lastUpdate: new Date(data.time.iso),
    dominantPollutant,
    pollutants,
    temperature: data.iaqi.t?.v,
    humidity: data.iaqi.h?.v,
    windSpeed: data.iaqi.w?.v,
    location: {
      name: data.city.name,
      country: data.city.country || "Unknown",
      latitude: data.city.geo[0],
      longitude: data.city.geo[1],
    },
  };
}

export async function fetchAirQualityByCity(city: string): Promise<AirQualityData | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("AQICN API key not configured. Using demo data.");
    return getDemoData(city);
  }

  try {
    // Extract just the city name (before any comma for "City, Country" format)
    const cityName = city.split(",")[0].trim();
    
    const response = await fetch(
      `${AQICN_API_URL}/feed/${encodeURIComponent(cityName)}/?token=${API_KEY}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch AQI data for ${cityName}:`, response.statusText);
      return getDemoData(city);
    }

    const data: AQICNResponse = await response.json();

    if (data.status === "error") {
      console.error(`AQICN API error for ${cityName}:`, data);
      return getDemoData(city);
    }

    return parseAQICNResponse(data);
  } catch (error) {
    console.error("Error fetching AQI data:", error);
    return getDemoData(city);
  }
}

export async function fetchAirQualityByCoordinates(
  latitude: number,
  longitude: number
): Promise<AirQualityData | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("AQICN API key not configured. Using demo data.");
    return getDemoData(latitude.toFixed(2) + "," + longitude.toFixed(2));
  }

  try {
    const response = await fetch(
      `${AQICN_API_URL}/feed/geo:${latitude};${longitude}/?token=${API_KEY}`
    );

    if (!response.ok) {
      console.error("Failed to fetch AQI data by coordinates:", response.statusText);
      return getDemoData("Current Location");
    }

    const data: AQICNResponse = await response.json();

    if (data.status === "error") {
      console.error("AQICN API error:", data);
      return getDemoData("Current Location");
    }

    return parseAQICNResponse(data);
  } catch (error) {
    console.error("Error fetching AQI data by coordinates:", error);
    return getDemoData("Current Location");
  }
}

// Search for cities - using Nominatim API for better coverage
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    // Use Nominatim (OpenStreetMap) for city search - covers 1000s of cities
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&limit=15`,
      {
        headers: {
          'User-Agent': 'AirWatch Air Quality Monitor'
        }
      }
    );

    if (!response.ok) {
      // Fallback to AQICN search
      return searchAQICN(query);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data
        .filter((item: any) => item.lat && item.lon)
        .map((item: any) => ({
          name: item.name || item.address?.town || item.address?.city || "",
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          country: item.address?.country || "Unknown",
          state: item.address?.state,
        }))
        .filter((city: any) => city.name);
    }

    return [];
  } catch (error) {
    console.error("Error searching cities:", error);
    return searchAQICN(query);
  }
}

// Fallback AQICN search
async function searchAQICN(query: string): Promise<CitySearchResult[]> {
  try {
    const response = await fetch(
      `https://api.waqi.info/search/${encodeURIComponent(query)}/?token=${API_KEY}`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    if (data.status === "ok" && Array.isArray(data.data)) {
      return data.data.map((city: any) => ({
        name: city.station.name.split(",")[0],
        latitude: city.station.geo[0],
        longitude: city.station.geo[1],
        country: city.station.country || "Unknown",
        state: city.station.name.split(",")[1]?.trim(),
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching AQICN:", error);
    return [];
  }
}

// Demo data generator (for development)
export function getDemoData(cityName: string): AirQualityData {
  const aqi = Math.floor(Math.random() * 250) + 20;
  const level = getAQILevel(aqi);

  return {
    aqi,
    level,
    lastUpdate: new Date(),
    dominantPollutant: "PM2.5",
    pollutants: [
      {
        id: "pm25",
        label: "PM2.5",
        value: Math.floor(Math.random() * 80),
        unit: "µg/m³",
        level: getAQILevel(Math.random() * 200),
        maxValue: 100,
      },
      {
        id: "pm10",
        label: "PM10",
        value: Math.floor(Math.random() * 120),
        unit: "µg/m³",
        level: getAQILevel(Math.random() * 250),
        maxValue: 150,
      },
      {
        id: "no2",
        label: "NO₂",
        value: Math.floor(Math.random() * 50),
        unit: "µg/m³",
        level: getAQILevel(Math.random() * 100),
        maxValue: 100,
      },
      {
        id: "o3",
        label: "O₃",
        value: Math.floor(Math.random() * 120),
        unit: "µg/m³",
        level: getAQILevel(Math.random() * 150),
        maxValue: 200,
      },
    ],
    temperature: Math.floor(Math.random() * 25) + 5,
    humidity: Math.floor(Math.random() * 60) + 30,
    windSpeed: Math.floor(Math.random() * 20),
    location: {
      name: cityName,
      country: "Demo",
      latitude: 28.6139,
      longitude: 77.209,
    },
  };
}
