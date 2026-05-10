# AirWatch - Smart Air Pollution Monitoring System

A next-generation real-time air quality monitoring dashboard built with modern web technologies. Track AQI (Air Quality Index), pollutant levels, and get intelligent alerts for unhealthy air conditions.

## 🌟 Features

### Core Functionality
- **Real-Time AQI Monitoring**: Live air quality data from AQICN API
- **Multiple Pollutant Tracking**: PM2.5, PM10, O₃, NO₂, SO₂, CO
- **Dynamic Alerts**: Customizable thresholds for each pollutant
- **City Search**: Search and monitor air quality across 10,000+ cities
- **Favorites Management**: Save your frequently checked locations

### Advanced Features
- **Real-Time Updates**: Auto-refresh every 30 minutes (configurable)
- **Geolocation Support**: Get air quality for your current location
- **Map Visualization**: View nearby monitoring stations
- **Health Tips**: Dynamic recommendations based on current AQI level
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Theme**: System preference aware theme switching

### Data Visualization
- **AQI Display**: Large, easy-to-read current AQI index
- **Metrics Grid**: Individual pollutant cards with progress bars
- **Historical Chart**: 24-hour AQI trend
- **Forecast**: 7-day air quality forecast
- **Map View**: Geographic distribution of monitoring stations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/airwatch.git
cd airwatch

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local

# Add your AQICN API key
# Register at: https://aqicn.org/api/
# Update NEXT_PUBLIC_AQICN_API_KEY in .env.local
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## 📋 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: AQICN API Key
# Get your free key at: https://aqicn.org/api/
NEXT_PUBLIC_AQICN_API_KEY=your_api_key_here

# Optional: OpenWeatherMap API (for future enhancements)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here

# Optional: Enable geolocation detection
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
```

## 🏗️ Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── dashboard/
│   │   ├── dashboard-header.tsx      # Header with controls
│   │   ├── aqi-display.tsx           # Main AQI indicator
│   │   ├── metrics-grid.tsx          # Pollutant metrics
│   │   ├── aqi-chart.tsx             # Historical chart
│   │   ├── forecast.tsx              # Weather forecast
│   │   ├── sidebar.tsx               # Side information
│   │   ├── city-search.tsx           # City selector
│   │   ├── alerts-panel.tsx          # Alert notifications
│   │   ├── settings-panel.tsx        # Settings & thresholds
│   │   ├── map-view.tsx              # Map visualization
│   │   └── header.tsx                # Legacy header
│   ├── ui/                          # Reusable UI components
│   └── theme-provider.tsx           # Theme configuration
├── hooks/
│   ├── use-air-quality.ts           # Custom hooks
│   └── use-mobile.ts                # Mobile detection
├── lib/
│   ├── api/
│   │   └── aqicn.ts                 # AQICN API integration
│   ├── context/
│   │   └── app-context.tsx          # Global state management
│   ├── types.ts                     # Type definitions
│   └── utils.ts                     # Utility functions
├── public/
│   └── images/                      # Public assets
└── styles/
    └── globals.css                  # Global styles
```

## 🔌 API Integration

### AQICN API

The application uses the AQICN (Air Quality Index China) API for real-time air quality data.

**Features:**
- Free tier available
- 10,000+ cities and monitoring stations
- Real-time and historical data
- No rate limiting for reasonable usage

**Setup:**
1. Visit https://aqicn.org/api/
2. Register for a free account
3. Get your API token
4. Add to `.env.local`

**Data Provided:**
```json
{
  "aqi": 72,
  "dominantPollutant": "PM2.5",
  "pollutants": {
    "pm25": 35,
    "pm10": 48,
    "o3": 25,
    "no2": 28,
    "so2": 12,
    "co": 1.2
  },
  "temperature": 18,
  "humidity": 65,
  "windSpeed": 12
}
```

## 📊 AQI Scale

| AQI Range | Level | Health Effect |
|-----------|-------|---------------|
| 0-50 | Good | No health effect |
| 51-100 | Moderate | Acceptable; Sensitive people may need limitations |
| 101-150 | Unhealthy for Sensitive Groups | Sensitive people experience adverse effects |
| 151-200 | Unhealthy | General public begins to experience adverse effects |
| 201-300 | Very Unhealthy | Health alert; everyone at risk |
| 301+ | Hazardous | Health warning; avoid outdoor activities |

## 🎨 Customization

### Alert Thresholds

Users can customize alert thresholds in Settings:
- AQI threshold (triggers main alert)
- PM2.5 threshold
- PM10 threshold
- NO₂ threshold
- O₃ threshold

### Theme

The app supports dark and light themes with system preference detection. Configure in `components/theme-provider.tsx`.

### Health Tips

Health tips are dynamically generated based on current AQI level. Customize recommendations in `app/page.tsx` `getHealthTips()` function.

## 🔄 Real-Time Updates

Updates are configured for every 30 minutes by default. Change in `hooks/use-air-quality.ts`:

```typescript
useRealTimeUpdates(1800000) // 30 minutes in milliseconds
```

## 📱 Mobile Optimization

The dashboard is fully responsive:
- **Desktop**: Multi-column layout with sidebar
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single column with bottom navigation

Key responsive breakpoints:
- Small screens (< 640px): Full-width single column
- Medium (640px - 1024px): Two-column stacked
- Large (> 1024px): Four-column layout with sidebar

## 🧪 Testing

### Manual Testing Checklist

- [ ] API data fetching works
- [ ] City search functions correctly
- [ ] Alerts display when AQI exceeds threshold
- [ ] Manual refresh updates data
- [ ] Favorites add/remove functionality
- [ ] Settings thresholds save correctly
- [ ] Real-time updates trigger every 30 minutes
- [ ] Mobile layout is responsive
- [ ] Theme switching works (dark/light)
- [ ] Geolocation request works (if enabled)

### Testing with Demo Data

When API key is not configured or set to "demo", the app automatically uses generated demo data. This is useful for testing without API calls.

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted

```bash
npm run build
npm start
```

## 🔐 Security

- Environment variables never exposed to client (use `NEXT_PUBLIC_` prefix only for safe keys)
- API calls made from server-side where possible
- Input validation on all user searches
- CORS-friendly API usage

## 📈 Performance

- Built with Next.js 16 for optimal performance
- Images optimized with Next.js Image component
- Lazy loading for components
- Efficient state management with React Context
- Debounced search input
- Memoized components where appropriate

## 🐛 Troubleshooting

### API Key Issues
- Ensure `NEXT_PUBLIC_AQICN_API_KEY` is set in `.env.local`
- Check key is valid at https://aqicn.org/api/
- Verify network request isn't blocked by CORS or firewall

### City Search Not Working
- Check browser console for errors
- Ensure API key is configured
- Try searching with different city names
- Popular cities are always available as fallback

### Alerts Not Showing
- Check alert thresholds are set correctly (Settings > Alert Thresholds)
- Verify current AQI exceeds configured threshold
- Check browser notifications are enabled

### Mobile Layout Issues
- Clear browser cache
- Check viewport meta tag in layout.tsx
- Test in device emulation mode
- Verify Tailwind CSS is properly compiled

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **AQICN** - Air quality data provider
- **Tailwind CSS** - Styling framework
- **Radix UI** - Component library
- **Recharts** - Charting library
- **Next.js** - React framework

## 📚 Additional Resources

- [AQICN API Docs](https://aqicn.org/api/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 🎯 Future Enhancements

- [ ] Historical data analysis
- [ ] Advanced map with Leaflet.js
- [ ] Email/SMS alerts
- [ ] Multiple city comparison
- [ ] Air quality predictions (ML)
- [ ] PWA support for offline mode
- [ ] Integration with health apps
- [ ] Weather integration
- [ ] Pollution source tracking
- [ ] Community reports and feedback

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@airwatch.local
- Join our community Discord

---

**Made with ❤️ by the AirWatch Team**
