# Getting Started Guide - AirWatch

## 📖 Overview

AirWatch is a **production-ready air quality monitoring system** with real-time data fetching, intelligent alerts, and responsive UI. Follow this guide to get it running on your machine.

## ✅ Prerequisites

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))

Verify installation:
```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```

## 🚀 Installation & Setup

### 1. Project Setup (Already Done!)

All project files have been created and configured. Dependencies are already installed.

### 2. Configure API Key

The project uses AQICN API for air quality data.

**Get your API key:**

1. Visit https://aqicn.org/api/
2. Click "Sign Up" and create an account
3. Verify your email
4. Go to Admin Panel → API Key
5. Copy your API token

**Add to project:**

Update `.env.local` in the project root:

```env
NEXT_PUBLIC_AQICN_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ENABLE_GEOLOCATION=true
```

**Replace `your_actual_api_key_here` with your real API key**

### 3. Run Development Server

```bash
cd "e:\MIT AOE\sy\EVS\Smart Air Pollution Monitoring System"
npm run dev
```

**Output should show:**
```
  ▲ Next.js 16.2.0
  - Local:        http://localhost:3000
  - Environments: .env.local
```

**Open in browser:** http://localhost:3000

## 🎯 Key Features to Test

### 1. Dashboard Overview
- [ ] See current AQI for New Delhi
- [ ] View all pollutant metrics
- [ ] Check last update time
- [ ] View health tips based on AQI

### 2. City Search
- [ ] Click city name button at top
- [ ] Search for a different city
- [ ] Verify data updates for new city
- [ ] Try searching: "London", "Tokyo", "Beijing"

### 3. Refresh Data
- [ ] Click "Refresh" button
- [ ] Verify data updates (check timestamp)
- [ ] Confirm no errors in browser console

### 4. Alerts
- [ ] Click "Alerts" button if showing (only appears when AQI exceeds threshold)
- [ ] View active pollution warnings
- [ ] Different warning levels shown

### 5. Settings Panel
- [ ] Click "Settings" button
- [ ] Check "Alert Thresholds" tab
- [ ] Adjust AQI threshold slider
- [ ] Check "Favorite Cities" tab
- [ ] Add current city to favorites
- [ ] Remove from favorites

### 6. Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle Device Toolbar
- [ ] Test on different screen sizes:
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)
- [ ] Verify layout adapts properly
- [ ] Check buttons are touch-friendly

### 7. Charts & Data
- [ ] View AQI chart (24-hour trend)
- [ ] Check forecast panel
- [ ] View metrics grid (all pollutants)
- [ ] See map visualization

## 🧪 Testing Scenarios

### Scenario 1: High AQI Alert
1. Navigate to a city with high pollution
2. Try Beijing, Delhi, or Mumbai
3. Verify alerts appear when AQI > 100
4. Check alert thresholds in settings

### Scenario 2: Favorites Management
1. Add 3-4 cities to favorites
2. Verify they appear in Settings > Favorite Cities
3. Remove one favorite
4. Add it back
5. Click favorite to navigate to it (requires click on city in favorites list)

### Scenario 3: Real-Time Updates
1. Note the "Last updated" time
2. Wait 30 seconds
3. Refresh data manually
4. Check timestamp updates
5. Verify health tips update if AQI changed

### Scenario 4: Responsive Design
1. Start on desktop (full size)
2. Gradually resize window smaller
3. Watch layout change from 4-cols → 2-cols → 1-col
4. Test on actual mobile device
5. Verify all buttons are clickable

## 📊 Understanding AQI

| Range | Level | Status |
|-------|-------|--------|
| 0-50 | Good | ✅ Safe for outdoor activities |
| 51-100 | Moderate | ⚠️ Sensitive groups may feel effects |
| 101-150 | Unhealthy for Sensitive | 🟡 General public unaffected |
| 151-200 | Unhealthy | 🔴 Everyone may feel effects |
| 201-300 | Very Unhealthy | 🔴🔴 Serious health effects |
| 301+ | Hazardous | 🔴🔴🔴 Stay indoors |

## 🔧 Troubleshooting

### "API key not configured"
**Solution:** 
- Check `.env.local` exists
- Verify key is correct in file
- Restart dev server: `npm run dev`
- Check browser console for exact error

### "Data not updating"
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Open in incognito window
- Check network tab in DevTools (F12)
- Verify API key is still valid

### "Map not showing stations"
**Solution:**
- This is normal on first load
- Refresh page
- Check browser console for errors
- Stations load from demo data by default

### "Mobile layout broken"
**Solution:**
- Clear browser cache
- Check viewport meta tag (should be in layout.tsx)
- Test in different browser
- Check Tailwind CSS classes applied

### "Port 3000 already in use"
**Solution:**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

## 📈 Next Steps

After verifying the app works:

1. **Get Real API Key** (if using demo)
   - Register at AQICN
   - Update .env.local
   - Refresh to see real data

2. **Customize Settings**
   - Adjust alert thresholds
   - Change health tips text
   - Modify update interval

3. **Deploy to Production**
   - See README.md for deployment options
   - Vercel hosting recommended
   - Requires paid plan for production domain

4. **Add Advanced Features**
   - Integration with health apps
   - Email alerts
   - Advanced mapping (Leaflet.js)
   - Historical data analysis

## 🏗️ Project Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Install dependencies
npm install
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (API keys) |
| `app/page.tsx` | Main dashboard page |
| `lib/api/aqicn.ts` | API integration |
| `lib/context/app-context.tsx` | State management |
| `components/dashboard/` | UI components |
| `hooks/use-air-quality.ts` | Custom hooks |

## 🆘 Need Help?

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Check network requests (Network tab)

2. **Read the README**
   - Comprehensive documentation
   - Troubleshooting section
   - API integration details

3. **Verify API key**
   - Is it in .env.local?
   - Is format correct?
   - Is it active on AQICN?

4. **Try demo mode**
   - Keep API key as "demo"
   - App generates test data
   - Useful for UI testing

## ✨ Tips & Tricks

1. **Use Demo Mode for Testing**
   - Set `NEXT_PUBLIC_AQICN_API_KEY=demo`
   - Useful for UI testing without API limits
   - Reset to real key when done

2. **Keyboard Shortcuts**
   - F12: Open DevTools
   - Ctrl+Shift+I: Open DevTools (alternative)
   - Ctrl+Shift+Delete: Clear cache
   - Right-click → Inspect: Inspect element

3. **Browser DevTools**
   - Network tab: Monitor API calls
   - Console tab: Check for errors
   - Device toolbar: Test responsiveness
   - Performance: Check loading time

4. **Faster Development**
   - Keep dev server running
   - Changes auto-reload
   - Check console for errors
   - Use browser DevTools extensively

## 🎉 You're All Set!

Your AirWatch dashboard is now ready to monitor air quality in real-time. Start by:

1. Opening http://localhost:3000
2. Searching for your city
3. Checking the AQI and health recommendations
4. Exploring all features

Happy monitoring! 🌍

---

**Questions?** Check README.md for more detailed documentation.
