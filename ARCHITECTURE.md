# Architecture Documentation

## System Overview

AirWatch is built using modern web technologies with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│           (React Components + Tailwind CSS)              │
├─────────────────────────────────────────────────────────┤
│  Dashboard │ City Search │ Alerts │ Settings │ Map View │
├─────────────────────────────────────────────────────────┤
│                    State Management                      │
│              (React Context + Custom Hooks)              │
├─────────────────────────────────────────────────────────┤
│                    API Layer                             │
│          (AQICN API Integration + Data Parsing)          │
├─────────────────────────────────────────────────────────┤
│  AQICN API │ OpenWeather API │ Geolocation API          │
└─────────────────────────────────────────────────────────┘
```

## Core Architecture

### 1. **Presentation Layer** (`/components`)

Responsible for UI rendering and user interaction.

#### Main Components:
- **`DashboardHeader`**: Navigation, city selection, controls
- **`AqiDisplay`**: Main AQI metric visualization
- **`MetricsGrid`**: Individual pollutant cards
- **`AqiChart`**: Historical trend using Recharts
- **`Forecast`**: Weather and AQI forecast
- **`MapView`**: Geographic station visualization
- **`AlertsPanel`**: Alert notifications
- **`SettingsPanel`**: Configuration and thresholds
- **`CitySearch`**: City selector with search

#### UI Components (from Radix UI):
- `Card`, `Button`, `Dialog`, `Input`, `Slider`
- `Badge`, `Tabs`, `Skeleton`, `Alert`
- Custom icons from Lucide React

### 2. **State Management Layer** (`/lib/context`)

**File**: `app-context.tsx`

Centralized state using React Context API:

```typescript
interface AppContextType {
  // Current Data
  currentCity: string
  currentData: AirQualityData | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchAirQuality(city: string): Promise<void>
  fetchByCoordinates(lat: number, lon: number): Promise<void>
  
  // Settings
  alertConfig: AlertConfig
  favoriteCities: string[]
  addFavorite(city: string): void
  removeFavorite(city: string): void
}
```

**Why Context?**
- Simple state tree (no complex interactions)
- No need for Redux complexity
- Sufficient for this use case
- Built-in React feature

**State Flow**:
1. App mounts → `useEffect` initializes with default city
2. User selects city → `fetchAirQuality()` called
3. API returns data → stored in context
4. Components subscribe → re-render automatically
5. Settings update → threshold changes persist

### 3. **Data Access Layer** (`/lib/api`)

**File**: `aqicn.ts`

Handles all API communication:

```
┌──────────────────────────┐
│   UserAction (City Search)│
└────────────┬─────────────┘
             │
        ┌────▼────────────────────┐
        │ searchCities(query)     │
        │  ↓ validate input       │
        │  ↓ call API             │
        │  ↓ filter results       │
        └────┬────────────────────┘
             │
        ┌────▼─────────────────────┐
        │ fetchAirQualityByCity()   │
        │  ↓ validate city          │
        │  ↓ call API               │
        │  ↓ check response status  │
        │  ↓ parse response         │
        │  ↓ return AirQualityData  │
        └────┬─────────────────────┘
             │
        ┌────▼──────────────────────┐
        │ parseAQICNResponse()       │
        │  ↓ extract AQI            │
        │  ↓ calculate level        │
        │  ↓ get pollutants         │
        │  ↓ return typed data      │
        └────┬──────────────────────┘
             │
        ┌────▼─────────────────┐
        │   Return to Context   │
        │   Update UI Component │
        └──────────────────────┘
```

**Key Functions**:

```typescript
// Fetch by city name
fetchAirQualityByCity(city: string): Promise<AirQualityData>

// Fetch by GPS coordinates
fetchAirQualityByCoordinates(lat: number, lon: number): Promise<AirQualityData>

// Search for cities
searchCities(query: string): Promise<CitySearchResult[]>

// Fallback demo data
getDemoData(cityName: string): AirQualityData
```

**Error Handling**:
- Network errors → fallback to demo data
- API errors → user-friendly message
- Invalid input → validation before API call
- Type safety → TypeScript ensures data shape

### 4. **Hooks Layer** (`/hooks`)

**File**: `use-air-quality.ts`

Custom React hooks for business logic:

```typescript
// Real-time updates with configurable interval
useRealTimeUpdates(intervalMs: number): void
  ├─ Sets up polling
  ├─ Auto-refreshes data
  └─ Handles cleanup

// Geolocation
useGeolocation(): { requestLocation(): void }
  ├─ Requests user permission
  ├─ Gets GPS coordinates
  └─ Fetches data for location

// Alert checking
useAirQualityAlerts(): { alerts: AlertItem[] }
  ├─ Compares data to thresholds
  ├─ Generates alert messages
  └─ Returns severity levels
```

### 5. **Data Flow**

```
User Action
    ↓
Component calls useApp() / useRealTimeUpdates()
    ↓
Hook calls context function (fetchAirQuality)
    ↓
Context function calls API (aqicn.ts)
    ↓
API returns data
    ↓
Parse and type-check
    ↓
Update context state
    ↓
Components subscribe to context
    ↓
Components re-render with new data
    ↓
UI updates automatically
```

## Data Types

**File**: `lib/types.ts`

### Main Types:

```typescript
interface AirQualityData {
  aqi: number
  level: AQILevel  // "good" | "moderate" | "unhealthy" | ...
  lastUpdate: Date
  dominantPollutant: string
  pollutants: Pollutant[]
  temperature?: number
  humidity?: number
  windSpeed?: number
  location: {
    name: string
    country: string
    latitude: number
    longitude: number
  }
}

interface Pollutant {
  id: string        // "pm25", "pm10", "no2", "o3", "so2", "co"
  label: string     // "PM2.5", "PM10", etc.
  value: number     // numeric concentration
  unit: string      // "µg/m³", "mg/m³"
  level: AQILevel
  maxValue: number  // for progress bar calculation
}

type AQILevel = 
  | "good"
  | "moderate"
  | "unhealthy-for-sensitive"
  | "unhealthy"
  | "very-unhealthy"
  | "hazardous"
```

## Component Hierarchy

```
RootLayout
├── AppProvider
│   ├── ThemeProvider
│   └── DashboardContent
│       ├── DashboardHeader
│       │   ├── CitySearch (Dialog)
│       │   ├── AlertsPanel (Dialog)
│       │   └── SettingsPanel (Dialog)
│       │       ├── AlertThresholds
│       │       └── FavoriteCities
│       ├── AlertsPanel (always visible if alerts exist)
│       ├── Main Layout Grid
│       │   ├── Content Area (3 cols)
│       │   │   ├── AqiDisplay
│       │   │   ├── MetricsGrid
│       │   │   ├── AqiChart
│       │   │   └── Forecast
│       │   └── Sidebar (1 col)
│       │       └── Sidebar Component
│       │           ├── NearbyLocations
│       │           └── HealthTips
│       └── Footer
└── Toaster
```

## API Integration

### AQICN API

**Endpoint**: `https://api.waqi.info`

**Request Types**:

1. **City Search**
   ```
   GET /search/{query}?token=KEY
   Returns: Array of matching stations
   ```

2. **By City**
   ```
   GET /feed/{city}/?token=KEY
   Returns: Current AQI data for city
   ```

3. **By Coordinates**
   ```
   GET /feed/geo:{lat};{lon}/?token=KEY
   Returns: Current AQI data for location
   ```

**Response Format**:
```json
{
  "status": "ok|error",
  "data": {
    "aqi": 72,
    "city": {
      "name": "New Delhi",
      "geo": [28.6139, 77.209]
    },
    "iaqi": {
      "pm25": { "v": 35 },
      "pm10": { "v": 48 },
      ...
    },
    "time": { "iso": "2024-03-22T15:45:00Z" }
  }
}
```

## Real-Time Updates

**Strategy**: Client-side polling

```
Timer starts (30 minutes default)
    ↓
Timer fires
    ↓
Check if not already loading
    ↓
Call fetchAirQuality()
    ↓
Fetch complete
    ↓
Update UI
    ↓
Wait 30 minutes
    ↓
Repeat
```

**Benefits**:
- Simple to implement
- Works without WebSocket setup
- Configurable interval
- Auto-cleanup on unmount

**Trade-offs**:
- Not true real-time (30-minute delay)
- More API calls if interval is short
- Client-side only (no server push)

## Alert System

**How Alerts Work**:

```
User sets thresholds (Settings Panel)
    ↓
Thresholds saved in context
    ↓
Component calls useAirQualityAlerts()
    ↓
Hook compares current data to thresholds
    ↓
Creates alert messages
    ↓
AlertsPanel displays them
    ↓
Severity level determines styling (color, icon)
```

**Alert Levels**:
- **Low**: General pollution info
- **Medium**: Sensitive groups affected
- **High**: General population affected

**Threshold Configuration**:
- AQI threshold (global)
- PM2.5, PM10 thresholds (µg/m³)
- NO₂, O₃ thresholds (µg/m³)
- User-configurable via Settings

## Styling Architecture

**Stack**:
- **Tailwind CSS v4**: Utility-first CSS framework
- **CSS Variables**: For theme colors
- **Glass Morphism**: Modern, blurred background effect
- **Responsive Classes**: Mobile-first approach

**Color System**:
```
Primary colors       → Action buttons, highlights
Secondary colors    → Backgrounds, borders
Danger/Destructive  → High AQI alerts
AQI-specific        → Level-based colors (green, yellow, red, purple)
```

**Responsive Breakpoints**:
- **sm**: 640px (small phones)
- **md**: 768px (tablets)
- **lg**: 1024px (small desktop)
- **xl**: 1280px (desktop)
- **2xl**: 1536px (large desktop)

## Performance Optimizations

1. **Code Splitting**: Next.js handles automatic splitting
2. **Image Optimization**: Using Next.js Image component
3. **Lazy Loading**: Components load on-demand
4. **Memoization**: useCallback for stable function references
5. **Debouncing**: Search input debounced
6. **Caching**: Fetch results cached locally

## Security Considerations

1. **API Key**: 
   - Only `NEXT_PUBLIC_` prefixed variables sent to client
   - API key visible but safe (rate-limited by AQICN)

2. **Input Validation**:
   - City search input sanitized
   - Coordinate ranges checked
   - API responses type-checked

3. **Error Handling**:
   - API errors don't crash app
   - Fallback to demo data
   - User-friendly error messages

## Scalability

**Current Architecture Supports**:
- ~1000 concurrent users (client-side only)
- ~100 cities searched per session
- ~48 API calls per city per day (30-min updates)

**For Scale-Up**:
- Add backend server for API caching
- Implement WebSocket for real-time updates
- Add database for historical data
- Use CDN for assets
- Implement service worker for offline mode

## Testing Strategy

**Unit Testing** (recommended additions):
- API parsing functions
- Alert calculation logic
- Component rendering

**Integration Testing** (recommended additions):
- Full data flow (API → Context → UI)
- City search → data update flow
- Settings → threshold → alerts flow

**E2E Testing** (recommended additions):
- User workflows
- Mobile responsiveness
- Error scenarios

**Manual Testing**:
- Currently rely on browser testing
- Check browser console for errors
- Test on real devices

## Deployment Architecture

```
Local Development
    ↓ npm run build
Production Build (Optimized)
    ↓ Upload to Vercel / Own Server
Running Instance
    ↓
Web Browser
    ↓
     ├→ Requests HTML/JS/CSS
     ├→ Executes React app
     └→ Calls AQICN API directly
```

**Environment Setup**:
- Development: `.env.local` (API key, debugging)
- Production: Environment variables from host platform
- Demo mode: `API_KEY=demo` for testing

---

**This architecture is designed to be**:
- ✅ **Simple**: Easy to understand and modify
- ✅ **Scalable**: Can grow with additional features
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Testable**: Components are independent
- ✅ **Flexible**: API can be swapped easily
