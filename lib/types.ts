// AQI related types
export type AQILevel = "good" | "moderate" | "unhealthy-for-sensitive" | "unhealthy" | "very-unhealthy" | "hazardous";

export interface Pollutant {
  id: string;
  label: string;
  value: number;
  unit: string;
  level: AQILevel;
  maxValue: number;
}

export interface AirQualityData {
  aqi: number;
  level: AQILevel;
  lastUpdate: Date;
  dominantPollutant: string;
  pollutants: Pollutant[];
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

export interface ForecastData {
  date: Date;
  aqi: number;
  level: AQILevel;
  temperature?: {
    high: number;
    low: number;
  };
  description?: string;
}

// AQICN API Response Types
export interface AQICNResponse {
  status: string;
  data: {
    aqi: number;
    idx: number;
    attributions: Array<{ url: string; name: string }>;
    city: {
      name: string;
      geo: [number, number];
      country?: string;
      url: string;
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
      t?: { v: number };
      h?: { v: number };
      w?: { v: number };
      [key: string]: { v: number } | undefined;
    };
    time: {
      s: string;
      tz: string;
      iso: string;
    };
  };
}

export interface CitySearchResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

export interface AlertConfig {
  pm25Threshold: number;
  pm10Threshold: number;
  no2Threshold: number;
  o3Threshold: number;
  aqiThreshold: number;
}
