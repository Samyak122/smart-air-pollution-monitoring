import "server-only";
import { ForecastData, AQILevel, AirQualityData } from "@/lib/types";

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5";
const OPENWEATHER_ONE_CALL_URL = "https://api.openweathermap.org/data/3.0/onecall";
const OPENWEATHER_AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution";
const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

// OpenWeather API Response Types
export interface OpenWeatherCurrent {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  visibility?: number;
  clouds: { all: number };
  rain?: { "1h"?: number };
  snow?: { "1h"?: number };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone?: number;
  name: string;
  cod: number;
}

export interface OpenWeatherForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
    }>;
    wind: { speed: number };
    clouds: { all: number };
    visibility: number;
    pop: number;
    rain?: { "3h"?: number };
  }>;
  city: {
    name: string;
    country: string;
    coord: { lat: number; lon: number };
  };
}

export interface OpenWeatherOneCall {
  lat: number;
  lon: number;
  timezone: string;
  current: {
    dt: number;
    temp: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
    }>;
  };
  daily: Array<{
    dt: number;
    temp: { max: number; min: number };
    weather: Array<{ main: string; description: string }>;
  }>;
}

export interface OpenWeatherAirPollution {
  coord: { lon: number; lat: number };
  list: Array<{
    dt: number;
    main: {
      aqi: number; // 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
  }>;
}

// Fetch current weather data by city name
export async function fetchWeatherByCity(
  city: string
): Promise<OpenWeatherCurrent | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const cityName = city.split(",")[0].trim();

    const response = await fetch(
      `${OPENWEATHER_API_URL}/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch weather data for ${cityName}:`,
        response.statusText
      );
      return null;
    }

    const data: OpenWeatherCurrent = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Fetch weather data by coordinates
export async function fetchWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<OpenWeatherCurrent | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.error("Failed to fetch weather data:", response.statusText);
      return null;
    }

    const data: OpenWeatherCurrent = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Fetch 5-day weather forecast by city name
export async function fetchForecastByCity(
  city: string
): Promise<OpenWeatherForecast | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const cityName = city.split(",")[0].trim();

    const response = await fetch(
      `${OPENWEATHER_API_URL}/forecast?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch forecast data for ${cityName}:`,
        response.statusText
      );
      return null;
    }

    const data: OpenWeatherForecast = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
  }
}

// Fetch 5-day weather forecast by coordinates
export async function fetchForecastByCoordinates(
  latitude: number,
  longitude: number
): Promise<OpenWeatherForecast | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.error("Failed to fetch forecast data:", response.statusText);
      return null;
    }

    const data: OpenWeatherForecast = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return null;
  }
}

// Convert Kelvin to Celsius
function kelvinToCelsius(kelvin: number): number {
  return Math.round((kelvin - 273.15) * 10) / 10;
}

// Parse OpenWeather forecast data
export function parseOpenWeatherForecast(
  data: OpenWeatherForecast
): ForecastData[] {
  // Group forecast data by day (take one entry per day)
  const dailyForecasts: { [key: string]: OpenWeatherForecast["list"][0] } = {};

  data.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    // Keep the forecast closest to noon (12:00)
    if (!dailyForecasts[dateKey]) {
      dailyForecasts[dateKey] = forecast;
    } else {
      const existingHour = new Date(dailyForecasts[dateKey].dt * 1000).getHours();
      const newHour = date.getHours();
      if (Math.abs(newHour - 12) < Math.abs(existingHour - 12)) {
        dailyForecasts[dateKey] = forecast;
      }
    }
  });

  // Convert to ForecastData array
  const forecasts: ForecastData[] = Object.values(dailyForecasts)
    .sort((a, b) => a.dt - b.dt)
    .slice(0, 5) // Return 5 days
    .map((forecast) => {
      // Temperature is already in Celsius (units=metric), check if conversion needed
      const tempHigh = forecast.main.temp_max > 100 ? kelvinToCelsius(forecast.main.temp_max) : forecast.main.temp_max;
      const tempLow = forecast.main.temp_min > 100 ? kelvinToCelsius(forecast.main.temp_min) : forecast.main.temp_min;
      const tempCurrent = forecast.main.temp > 100 ? kelvinToCelsius(forecast.main.temp) : forecast.main.temp;
      
      return {
        date: new Date(forecast.dt * 1000),
        aqi: Math.round(forecast.clouds.all * 2),
        level: getAQILevelFromTemp(tempCurrent),
        temperature: {
          high: Math.round(tempHigh * 10) / 10,
          low: Math.round(tempLow * 10) / 10,
        },
        description: forecast.weather[0]?.description || "Unknown",
      }
    });

  return forecasts;
}

// Helper function to estimate AQI level from temperature (simplified)
function getAQILevelFromTemp(temp: number): AQILevel {
  // This is a simplified estimation
  // In reality, you'd want to use proper air quality data
  if (temp > 30) return "moderate";
  if (temp > 20) return "good";
  if (temp > 10) return "moderate";
  return "good";
}

// Merge weather data with air quality data
export function mergeWeatherWithAirQuality(
  airQuality: AirQualityData,
  weather: OpenWeatherCurrent
): AirQualityData {
  // Convert temperature from Kelvin to Celsius if it looks like Kelvin
  const temp = weather.main.temp > 100 ? kelvinToCelsius(weather.main.temp) : weather.main.temp;
  
  return {
    ...airQuality,
    temperature: temp,
    humidity: weather.main.humidity,
    windSpeed: weather.wind.speed,
  };
}

// Fetch air pollution data by city name
export async function fetchAirPollutionByCity(
  city: string
): Promise<OpenWeatherAirPollution | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const cityName = city.split(",")[0].trim();
    
    // First, get city coordinates
    const weatherData = await fetchWeatherByCity(city);
    if (!weatherData) return null;

    const { lat, lon } = weatherData.coord;
    return fetchAirPollutionByCoordinates(lat, lon);
  } catch (error) {
    console.error("Error fetching air pollution data by city:", error);
    return null;
  }
}

// Fetch air pollution data by coordinates
export async function fetchAirPollutionByCoordinates(
  latitude: number,
  longitude: number
): Promise<OpenWeatherAirPollution | null> {
  if (!API_KEY || API_KEY === "demo") {
    console.warn("OpenWeather API key not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_AIR_POLLUTION_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.error("Failed to fetch air pollution data:", response.statusText);
      return null;
    }

    const data: OpenWeatherAirPollution = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching air pollution data:", error);
    return null;
  }
}

// Convert OpenWeather AQI index to our AQILevel
function openWeatherAQIToLevel(aqi: number): AQILevel {
  // OpenWeather AQI: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
  switch (aqi) {
    case 1:
      return "good";
    case 2:
      return "moderate";
    case 3:
      return "unhealthy-for-sensitive";
    case 4:
      return "unhealthy";
    case 5:
      return "very-unhealthy";
    default:
      return "good";
  }
}

// Convert OpenWeather AQI to 0-500 scale (similar to AQICN)
function openWeatherAQITo500Scale(aqi: number): number {
  // Rough conversion: 1=0-50, 2=51-100, 3=101-150, 4=151-200, 5=201+
  const scales: { [key: number]: number } = {
    1: 25,
    2: 75,
    3: 125,
    4: 175,
    5: 250,
  };
  return scales[aqi] || 50;
}

// Parse OpenWeather air pollution data
export function parseOpenWeatherAirPollution(
  data: OpenWeatherAirPollution,
  location?: { name: string; country: string }
): AirQualityData {
  const current = data.list[0];
  const components = current.components;
  const aqi = openWeatherAQITo500Scale(current.main.aqi);
  const level = openWeatherAQIToLevel(current.main.aqi);

  // Map components to our pollutant format
  const pollutantData = [
    {
      id: "pm25",
      label: "PM2.5",
      unit: "µg/m³",
      maxValue: 100,
      value: components.pm2_5,
    },
    {
      id: "pm10",
      label: "PM10",
      unit: "µg/m³",
      maxValue: 150,
      value: components.pm10,
    },
    { id: "o3", label: "O₃", unit: "µg/m³", maxValue: 200, value: components.o3 },
    { id: "no2", label: "NO₂", unit: "µg/m³", maxValue: 100, value: components.no2 },
    { id: "so2", label: "SO₂", unit: "µg/m³", maxValue: 350, value: components.so2 },
    { id: "co", label: "CO", unit: "mg/m³", maxValue: 10, value: components.co / 1000 }, // Convert μg/m³ to mg/m³
  ];

  const pollutants = pollutantData
    .filter((p) => p.value !== undefined && p.value > 0)
    .map((p) => ({
      id: p.id,
      label: p.label,
      value: Math.round(p.value! * 10) / 10,
      unit: p.unit,
      maxValue: p.maxValue,
      level: getAQILevelFromTemp(p.value! / p.maxValue * 100), // Simple conversion
    }));

  const dominantPollutant =
    pollutants.length > 0
      ? pollutants.reduce((prev, current) =>
          current.value / current.maxValue > prev.value / prev.maxValue ? current : prev
        ).label
      : "N/A";

  return {
    aqi,
    level,
    lastUpdate: new Date(current.dt * 1000),
    dominantPollutant,
    pollutants,
    location: location || {
      name: "Unknown",
      country: "Unknown",
      latitude: data.coord.lat,
      longitude: data.coord.lon,
    },
  };
}
