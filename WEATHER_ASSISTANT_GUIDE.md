# OpenWeather AI Weather Assistant Integration

## Overview

The AI Weather Assistant is integrated into your Smart Air Pollution Monitoring System, allowing users to ask weather-related questions in natural language and receive intelligent responses powered by OpenWeather's AI.

**Key Features:**
- ✅ Natural language weather queries
- ✅ 50+ language support
- ✅ Global coverage
- ✅ Free to use (counts toward One Call API quota)
- ✅ Interactive chat interface
- ✅ Activity recommendations
- ✅ Clothing suggestions
- ✅ Health-related advice

## How to Use

### UI Component

Click the **Weather Assistant** button (💬 icon) in the bottom-right corner of the dashboard to open the chat panel.

**Supported Questions:**
- "What's the weather like in London?"
- "Should I bring an umbrella?"
- "Is it a good idea to go for a swim?"
- "What should my 8-year-old child wear?"
- "Will it rain tomorrow in Paris?"
- "Where is it better to go on holiday next weekend: London or Paris?"

### Programmatic API

#### Basic Weather Question

```typescript
import { askWeatherAssistant } from '@/lib/api/weather-assistant';

const response = await askWeatherAssistant("What's the weather in London?");
console.log(response?.answer);
```

#### Activity Suitability

```typescript
import { isSuitableForActivity } from '@/lib/api/weather-assistant';

const suitable = await isSuitableForActivity("swimming", "today", "Miami");
if (suitable) {
  console.log("Perfect day for swimming!");
}
```

#### Clothing Recommendations

```typescript
import { getClothingRecommendation } from '@/lib/api/weather-assistant';

const advice = await getClothingRecommendation("Paris", "adult");
console.log(advice); // "Wear a light jacket and umbrella..."
```

#### Compare Locations

```typescript
import { compareLocations } from '@/lib/api/weather-assistant';

const comparison = await compareLocations("London", "Paris", "for a holiday");
console.log(comparison);
```

#### Health Advice

```typescript
import { getHealthAdvice } from '@/lib/api/weather-assistant';

const advice = await getHealthAdvice("asthma", "New York");
console.log(advice); // Air quality and weather advice for asthma sufferers
```

#### Allergy Information

```typescript
import { getAllergyInfo } from '@/lib/api/weather-assistant';

const info = await getAllergyInfo("pollen", "spring", "Denver");
console.log(info);
```

#### Forecast Summary

```typescript
import { getForecastSummary } from '@/lib/api/weather-assistant';

const forecast = await getForecastSummary("Tokyo", "next 7 days");
console.log(forecast);
```

## API Response

```typescript
interface WeatherAssistantResponse {
  answer: string;        // Human-readable response
  location?: string;     // Location context if provided
  confidence?: number;   // Confidence score (0-1)
}
```

## Supported Languages

The AI Weather Assistant understands and responds in over 50 languages:

**Major Languages:**
- English, French, Italian, German, Spanish, Portuguese
- Chinese, Japanese, Korean, Arabic, Hindi
- Thai, Turkish, Vietnamese, Polish, Russian
- Ukrainian, Greek, Hebrew, Farsi, Filipino
- Indonesian, Malaysian, Burmese, Khmer, Lao
- And 25+ more...

**Example:**
```typescript
// Ask in French
const response = await askWeatherAssistant("Quel temps fait-il à Paris?");

// Ask in German  
const response = await askWeatherAssistant("Wird es morgen regnen in Berlin?");

// Ask in Arabic
const response = await askWeatherAssistant("ما هو الطقس في دبي؟");
```

## Available Functions

### `askWeatherAssistant(question, location?)`
Send any weather question to the AI assistant.

### `getWeatherAdvice(activity, location)`
Get advice on whether an activity is suitable.

### `getClothingRecommendation(location, person?)`
Get clothing recommendations (supports custom person descriptions).

### `compareLocations(location1, location2, purpose?)`
Compare weather between two locations.

### `isSuitableForActivity(activity, timeframe?, location)`
Check if weather is suitable for an activity (returns boolean).

### `getWeatherInfo(question)`
Get general weather information.

### `getForecastSummary(location, timeframe?)`
Get a summary of the weather forecast.

### `getHealthAdvice(condition, location)`
Get weather-related health advice for specific conditions.

### `getAllergyInfo(allergen, season, location)`
Get allergy information for specific seasons and locations.

## UI Components

### WeatherAssistantPanel
Main chat interface component.

```typescript
import { WeatherAssistantPanel } from '@/components/dashboard/weather-assistant-panel';

<WeatherAssistantPanel 
  defaultLocation="London"
  onClose={() => setIsOpen(false)}
/>
```

### WeatherAssistantButton
Floating button that opens/closes the chat panel.

```typescript
import { WeatherAssistantButton } from '@/components/dashboard/weather-assistant-panel';

<WeatherAssistantButton defaultLocation="London" />
```

## Implementation in Dashboard

The Weather Assistant is automatically integrated into your dashboard:

```typescript
// In app/page.tsx
import { WeatherAssistantButton } from '@/components/dashboard/weather-assistant-panel';
import { useApp } from '@/lib/context/app-context';

export default function Dashboard() {
  const { currentData } = useApp();
  
  return (
    <div>
      {/* Dashboard content */}
      
      {/* Weather Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <WeatherAssistantButton defaultLocation={currentData?.location.name} />
      </div>
    </div>
  );
}
```

## Best Practices

1. **Location Context**: Always provide location for more accurate responses
2. **Be Specific**: Include timeframe ("today", "tomorrow", "next week")
3. **Activity Details**: Mention age groups or specific needs when asking
4. **Error Handling**: Check for null responses

```typescript
const response = await askWeatherAssistant(question, location);
if (!response) {
  console.error("Failed to get response from Weather Assistant");
} else {
  console.log(response.answer);
}
```

## API Limits

- **Cost**: Free (counts toward One Call API quotas)
- **Rate Limits**: Follow your OpenWeather API plan limits
- **Coverage**: Global (supports 50+ languages)
- **Data Sources**: Current weather, minutely, hourly, and 7-day forecast

## Configuration

The API key from `.env.local` is automatically used:

```
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

## Testing

You can test the web interface at:
```
https://openweathermap.org/weather-assistant?apikey=YOUR_API_KEY
```

## Limitations

- The AI Weather Assistant is continuously being improved
- May not handle extremely specific or niche queries
- Responses are based on current and forecast data only

## Examples in Use

### Example 1: Outdoor Planning
```typescript
const isSuitable = await isSuitableForActivity("hiking", "tomorrow", "Colorado");
const clothing = await getClothingRecommendation("Colorado", "hiker");
console.log(`Hiking suitable: ${isSuitable}`);
console.log(`What to wear: ${clothing}`);
```

### Example 2: Health Management
```typescript
const allergyInfo = await getAllergyInfo("pollen", "spring", "Denver");
const healthAdvice = await getHealthAdvice("asthma", "Denver");
console.log("Allergy Info:", allergyInfo);
console.log("Health Advice:", healthAdvice);
```

### Example 3: Travel Planning
```typescript
const comparison = await compareLocations("Barcelona", "Athens", "summer vacation");
const forecast = await getForecastSummary("Barcelona", "next 7 days");
console.log(comparison);
console.log(forecast);
```

## Future Enhancements

- Add conversation history persistence
- Multi-turn conversations
- Advanced analytics on common questions
- Integration with alerts system
- Custom AI recommendations based on user history
