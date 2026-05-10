# Quick Reference Guide

## 🚀 Start Here

```bash
# 1. Navigate to project
cd "e:\MIT AOE\sy\EVS\Smart Air Pollution Monitoring System"

# 2. Install dependencies (first time only)
npm install

# 3. Configure API key
# Edit .env.local - get key from https://aqicn.org/api/

# 4. Run development server
npm run dev

# 5. Open browser
http://localhost:3000
```

## 📁 Project Structure

```
/ (root)
├── app/
│   ├── page.tsx             ← Main dashboard
│   ├── layout.tsx           ← Root layout with ThemeProvider
│   └── globals.css
├── components/
│   └── dashboard/
│       ├── dashboard-header.tsx    ← Header with controls
│       ├── city-search.tsx         ← City selector
│       ├── alerts-panel.tsx        ← Alert notifications
│       ├── settings-panel.tsx      ← Settings & thresholds
│       ├── map-view.tsx            ← Map visualization
│       ├── aqi-display.tsx         ← Main AQI card
│       ├── metrics-grid.tsx        ← Pollutant cards
│       ├── aqi-chart.tsx           ← Trend chart
│       ├── forecast.tsx            ← 7-day forecast
│       └── sidebar.tsx             ← Info sidebar
├── lib/
│   ├── api/
│   │   └── aqicn.ts         ← API integration
│   ├── context/
│   │   └── app-context.tsx  ← State management
│   ├── types.ts             ← TypeScript types
│   └── utils.ts             ← Utilities
├── hooks/
│   ├── use-air-quality.ts   ← Custom hooks
│   └── use-mobile.ts        ← Mobile detection
├── .env.local               ← Environment variables
├── package.json             ← Dependencies
├── tsconfig.json            ← TypeScript config
├── tailwind.config.mjs      ← Tailwind config
├── README.md                ← Full documentation
├── GETTING_STARTED.md       ← Quick start
├── ARCHITECTURE.md          ← Technical details
├── DEPLOYMENT.md            ← Deployment guide
└── QUICK_REFERENCE.md       ← This file
```

## 🔑 Key Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm install      # Install dependencies
```

## 🎨 UI Features

### Main Dashboard
- Large AQI number with color coding
- Current weather data (temp, humidity, wind)
- Health recommendations

### Pollutant Metrics
- PM2.5, PM10, O₃, NO₂, SO₂, CO
- Progress bars showing concentration
- Color-coded severity levels

### Controls
- **City Search**: Click city name to search/change
- **Refresh**: Manually update data
- **Alerts**: View active pollution warnings
- **Settings**: Customize thresholds & favorites

### Real-Time Features
- Auto-refresh every 30 minutes
- Manual refresh anytime
- Live data from AQICN API

## 🔧 Configuration

### .env.local
```env
NEXT_PUBLIC_AQICN_API_KEY=your_api_key_here
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
```

### Alert Thresholds (Settings → Alert Thresholds)
```
AQI: 0-500 (100 recommended)
PM2.5: 0-500 µg/m³ (35 recommended)
PM10: 0-500 µg/m³ (50 recommended)
NO₂: 0-200 µg/m³ (40 recommended)
O₃: 0-300 µg/m³ (100 recommended)
```

## 🌍 API Integration

### AQICN (Free, 10,000+ cities)
- Get key: https://aqicn.org/api/
- Supports city search and coordinates
- Real-time pollution data
- No authentication required after key setup

### Data Returned
```json
{
  "aqi": 72,                    // 0-500
  "level": "moderate",          // Quality level
  "dominantPollutant": "PM2.5", // Worst pollutant
  "pollutants": {
    "pm25": 35,
    "pm10": 48,
    "no2": 28,
    "o3": 25,
    "so2": 12,
    "co": 1.2
  },
  "temperature": 18,
  "humidity": 65,
  "windSpeed": 12,
  "location": {
    "name": "New Delhi",
    "country": "India"
  }
}
```

## 🎯 Testing Checklist

- [ ] Can see AQI for New Delhi
- [ ] Can search for different cities
- [ ] Refresh button works
- [ ] Can add favorites
- [ ] Can modify alert thresholds
- [ ] Alerts appear for high AQI
- [ ] Layout responsive on mobile
- [ ] Dark theme works
- [ ] No errors in console
- [ ] All animations smooth

## 🚀 Deployment

### Quickest: Vercel
```bash
# 1. Push to GitHub
git push

# 2. Connect GitHub repo to Vercel
# https://vercel.com/new

# 3. Add environment variable in Vercel UI
NEXT_PUBLIC_AQICN_API_KEY=your_key

# 4. Deploy (automatic on push)
```

### Docker
```bash
docker build -t airwatch .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_AQICN_API_KEY=key \
  airwatch
```

### Self-Hosted
```bash
npm install
npm run build
npm start
# Access at: http://server-ip:3000
```

## 🎨 Styling

### Colors
```css
Primary:    #3b82f6 (blue)
Secondary:  #e5e7eb (gray)
Good:       #10b981 (green)
Moderate:   #f59e0b (amber)
Unhealthy:  #ef4444 (red)
Hazardous:  #7c2d12 (maroon)
```

### Responsive Breakpoints
```
sm: 640px   (small phones)
md: 768px   (tablets)
lg: 1024px  (laptops)
xl: 1280px  (desktops)
2xl: 1536px (large screens)
```

## 🐛 Troubleshooting

### Site won't load
```
→ Check .env.local exists
→ Verify API key is correct
→ Clear browser cache (Ctrl+Shift+Delete)
→ Check console (F12)
```

### API key error
```
→ Register at https://aqicn.org/api/
→ Copy actual key from account
→ Add to .env.local
→ Restart dev server
```

### Data not updating
```
→ Click Refresh button
→ Check network tab (F12 → Network)
→ Verify API key validity
→ Try different city
```

### Mobile layout broken
```
→ Hard refresh (Ctrl+F5)
→ Check viewport meta tag
→ Test in incognito window
→ Try different browser
```

## 📊 AQI Scale

| AQI | Level | Color | Action |
|-----|-------|-------|--------|
| 0-50 | Good | 🟢 | Safe for all |
| 51-100 | Moderate | 🟡 | Sensitive groups limit |
| 101-150 | Unhealthy-Sensitive | 🟠 | Sensitive groups indoors |
| 151-200 | Unhealthy | 🔴 | General population limit |
| 201-300 | Very Unhealthy | 🔴🔴 | Everyone limit outdoors |
| 301+ | Hazardous | 🔴🔴🔴 | Stay indoors |

## 💡 Tips

1. **Use Demo Mode** for testing without API calls
   ```env
   NEXT_PUBLIC_AQICN_API_KEY=demo
   ```

2. **Check Console** for detailed error messages
   - F12 → Console tab
   - Network tab to see API calls

3. **Popular Cities** to test
   - New Delhi (high AQI)
   - Beijing (very high)
   - London (low)
   - Tokyo (moderate)

4. **Mobile Testing** in DevTools
   - F12 → Device Toolbar Icon
   - Test iPhone, iPad, Android sizes

5. **Faster Updates** in development
   - Manually click Refresh
   - Change interval in `use-air-quality.ts`

## 📞 Support Resources

| Resource | Link |
|----------|------|
| AQICN API | https://aqicn.org/api/ |
| Next.js Docs | https://nextjs.org/docs |
| React Docs | https://react.dev |
| Tailwind Docs | https://tailwindcss.com |

## 📋 File References

### Core Application Files
- **Main Page**: `app/page.tsx` - Dashboard
- **API Service**: `lib/api/aqicn.ts` - API calls
- **State**: `lib/context/app-context.tsx` - Global state
- **Types**: `lib/types.ts` - TypeScript definitions
- **Hooks**: `hooks/use-air-quality.ts` - Custom logic

### Component Files
- **Header**: `components/dashboard/dashboard-header.tsx`
- **City Search**: `components/dashboard/city-search.tsx`
- **Alerts**: `components/dashboard/alerts-panel.tsx`
- **Settings**: `components/dashboard/settings-panel.tsx`
- **Map**: `components/dashboard/map-view.tsx`

## 🔑 Environment Variables

```env
# Required
NEXT_PUBLIC_AQICN_API_KEY=your_actual_key

# Optional
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key
```

## 📈 Performance Tips

1. Keep API key secured
2. Use production build for large traffic
3. Enable Vercel caching
4. Optimize images (already done)
5. Monitor bundle size

## ✅ Pre-Deployment Checklist

- [ ] All features tested
- [ ] Environment variables set
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Mobile layout checked
- [ ] API key is active
- [ ] No hardcoded values
- [ ] Documentation reviewed

---

**Quick Links:**
- Full Documentation: `README.md`
- Getting Started: `GETTING_STARTED.md`
- Architecture: `ARCHITECTURE.md`
- Deployment: `DEPLOYMENT.md`
