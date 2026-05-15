# OpenWeather API Integration Guide

## API Key Configuration

Your API key has been added to `.env.local`:
```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Available Functions

### Current Weather

#### `fetchWeatherByCity(city: string): Promise<OpenWeatherCurrent | null>`
Get current weather data for a specific city.

```typescript
import { fetchWeatherByCity } from '@/lib/api/openweather';

const weather = await fetchWeatherByCity('London');
// Returns: temperature, humidity, wind speed, weather description, etc.
```

#### `fetchWeatherByCoordinates(latitude: number, longitude: number): Promise<OpenWeatherCurrent | null>`
Get current weather data using GPS coordinates.

```typescript
const weather = await fetchWeatherByCoordinates(51.5074, -0.1278);
```

### Weather Forecast

#### `fetchForecastByCity(city: string): Promise<OpenWeatherForecast | null>`
Get 5-day weather forecast for a specific city.

```typescript
import { fetchForecastByCity, parseOpenWeatherForecast } from '@/lib/api/openweather';

const forecast = await fetchForecastByCity('London');
const parsed = parseOpenWeatherForecast(forecast);
// Returns array of 5 ForecastData objects with daily highs/lows
```

#### `fetchForecastByCoordinates(latitude: number, longitude: number): Promise<OpenWeatherForecast | null>`
Get 5-day forecast using GPS coordinates.

```typescript
const forecast = await fetchForecastByCoordinates(51.5074, -0.1278);
const parsed = parseOpenWeatherForecast(forecast);
```

### Data Merging

#### `mergeWeatherWithAirQuality(airQuality: AirQualityData, weather: OpenWeatherCurrent): AirQualityData`
Combines air quality data from AQICN with weather data from OpenWeather.

```typescript
import { fetchAirQualityByCity } from '@/lib/api/aqicn';
import { fetchWeatherByCity, mergeWeatherWithAirQuality } from '@/lib/api/openweather';

const aq = await fetchAirQualityByCity('London');
const weather = await fetchWeatherByCity('London');

if (aq && weather) {
  const combined = mergeWeatherWithAirQuality(aq, weather);
  // Now has both air quality and weather data
}
```

## Example Usage in React Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { fetchWeatherByCity, fetchForecastByCity, parseOpenWeatherForecast } from '@/lib/api/openweather';
import { fetchAirQualityByCity } from '@/lib/api/aqicn';
import { AirQualityData, ForecastData } from '@/lib/types';

export function Dashboard({ city }: { city: string }) {
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch air quality data
        const aqData = await fetchAirQualityByCity(city);
        setAirQuality(aqData);

        // Fetch weather forecast
        const forecastData = await fetchForecastByCity(city);
        if (forecastData) {
          const parsed = parseOpenWeatherForecast(forecastData);
          setForecast(parsed);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [city]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Display air quality data */}
      {airQuality && (
        <div>
          <h2>{airQuality.location.name}</h2>
          <p>AQI: {airQuality.aqi}</p>
          <p>Temperature: {airQuality.temperature}°C</p>
          <p>Humidity: {airQuality.humidity}%</p>
        </div>
      )}

      {/* Display forecast */}
      {forecast.length > 0 && (
        <div>
          <h3>5-Day Forecast</h3>
          {forecast.map((day, idx) => (
            <div key={idx}>
              <p>{day.date.toLocaleDateString()}</p>
              <p>High: {day.temperature?.high}°C</p>
              <p>Low: {day.temperature?.low}°C</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## API Endpoints Used

- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/2.5/forecast`

## Response Data Available

### Current Weather
- Temperature (current, feels like, min, max)
- Humidity
- Pressure
- Wind speed and direction
- Cloud coverage
- Weather description
- Sunrise/sunset times
- Visibility
- Rain/snow data

### Forecast
- Hourly forecasts for 5 days (3-hour intervals)
- Temperature highs/lows
- Humidity
- Wind speed
- Cloud coverage
- Precipitation probability
- Rain/snow amount

## Units

All requests use metric units:
- Temperature: Celsius (°C)
- Wind speed: meters/second (m/s)
- Pressure: hPa
- Visibility: meters
- Precipitation: millimeters

## Error Handling

All functions return `null` on error and log detailed error messages to the console. Check for null returns in your components:

```typescript
const weather = await fetchWeatherByCity('Unknown City');
if (!weather) {
  console.log('Failed to fetch weather');
}
```

## Rate Limits

OpenWeather API free tier includes:
- 1,000 calls/day
- 60 calls/minute

Monitor your usage on the [OpenWeather dashboard](https://openweathermap.org/api).

## Next Steps

1. Use the functions in your components to display weather alongside air quality data
2. Create weather widgets or forecast cards
3. Combine with alerts for hazardous conditions
4. Add weather-based recommendations
