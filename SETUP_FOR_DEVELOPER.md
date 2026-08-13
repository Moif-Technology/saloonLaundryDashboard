# Setup Guide for Frontend Developer

Temporary UI with real API backend ready to deploy.

## What's Done

✅ Backend API (`api/src/dashboard/`) — Complete
- 10 endpoints covering counter close, sales, staff, inventory, customers
- Read-only queries from production database
- Authentication required via JWT token
- Mounted at `/api/salon-dashboard`

✅ Frontend Dashboard (`salon-laundry-dashboard/`) — Temporary UI
- 6 dashboard pages (Overview, Counter Close, Daily Sales, Staff, Inventory, Customer Ledger)
- Mock data layer (fallback for testing without backend)
- Authentication flow with JWT
- Ready to deploy to production

## What You Need to Do

1. **Improve UI/UX**
   - Replace placeholder cards with proper design system
   - Add charts/visualizations (Recharts already in package.json)
   - Improve responsive design for mobile
   - Add loading states, error handling improvements

2. **Enhance Features**
   - Add date range pickers (currently text inputs)
   - Add export to PDF/Excel
   - Add real-time WebSocket updates
   - Add filtering by staff/product/payment method
   - Add drill-down details on charts

3. **Test Thoroughly**
   - Test with different user roles/permissions
   - Test on iOS/Android via Capacitor
   - Test network failures + offline mode
   - Performance test with large datasets

## Project Structure

```
salon-laundry-dashboard/
├── src/
│   ├── lib/
│   │   ├── api.ts           ← All API endpoints (update paths here)
│   │   ├── auth.ts          ← Auth helper functions
│   │   └── mockData.ts      ← Mock data (for fallback testing)
│   ├── components/
│   │   └── Layout.tsx       ← Main layout + navigation
│   ├── pages/
│   │   ├── Dashboard.tsx    ← Overview page
│   │   ├── CounterClose.tsx ← Priority: shift settlement
│   │   ├── DailySales.tsx
│   │   ├── StaffPerformance.tsx
│   │   ├── Inventory.tsx
│   │   ├── CustomerLedger.tsx
│   │   └── Login.tsx
│   ├── App.tsx              ← Routes + auth guard
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts           ← Dev server port 5011
├── capacitor.config.ts      ← Mobile app config
└── .env                     ← API base URL
```

## API Endpoints Available

All at: `https://api.moifone.com/api/salon-dashboard/`

**Counter Close:**
- `GET /counter-close/summary?date=YYYY-MM-DD`
- `GET /counter-close/pending-bills`
- `POST /counter-close/shift/:shiftId/close` (body: `{actualCash, notes}`)

**Sales:**
- `GET /sales?from=DATE&to=DATE`
- `GET /sales/products?from=DATE&to=DATE`
- `GET /sales/payment-methods?from=DATE&to=DATE`

**Staff:**
- `GET /staff/performance?from=DATE&to=DATE`

**Inventory:**
- `GET /inventory/stock`

**Customers:**
- `GET /customers/ledger`
- `GET /customers/unpaid-bills`

See `api/src/dashboard/README.md` for full documentation.

## Running Locally

**Backend (Terminal 1):**
```bash
cd api
npm start
# Runs on :5010
```

**Frontend (Terminal 2):**
```bash
cd salon-laundry-dashboard
npm run dev
# Opens http://localhost:5011
```

## Development Tips

### Add a New Dashboard Page

1. Create `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add nav link in `src/components/Layout.tsx`
4. Create API helper in `src/lib/api.ts` if needed
5. Import and use API: `const data = await yourAPI.getData()`

### Add Charts

```bash
npm install recharts
```

Then in your component:
```jsx
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar } from 'recharts';

<BarChart width={600} height={400} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

### Toggle Mock Data

Edit `.env`:
```env
VITE_USE_MOCK=false  # Use real API
VITE_USE_MOCK=true   # Use mock data
```

### Build for Production

```bash
npm run build
# Creates dist/ folder
# Deploy to web server or Capacitor app
```

### Mobile Build (iOS)

```bash
npm run build
npx cap add ios
# Opens Xcode
# Select simulator, press Play to run
```

### Mobile Build (Android)

```bash
npm run build
npx cap add android
# Opens Android Studio
# Select device, run
```

## Database Notes

Backend queries from production database:
- **Host:** localhost:5433 (production port)
- **Database:** moifone_uae
- **Tables:** pos.sales_master, pos.shift_master, hr.staff_master, etc.

All data scoped by authenticated user's company_id + branch_id.

## Deployment

### Web

```bash
npm run build
# dist/ folder contains static files
# Deploy to Nginx / S3 / Vercel / GitHub Pages
```

Set `.env.production`:
```env
VITE_API_BASE=https://api.moifone.com
```

### iOS App

```bash
npm run build
npx cap open ios
# Xcode: Product → Archive → Distribute → App Store
```

### Android App

```bash
npm run build
npx cap open android
# Android Studio: Build → Generate Signed Bundle
```

## Troubleshooting

**"Cannot find module 'axios'"**
```bash
npm install
```

**Port 5011 already in use?**
```bash
npx vite --port 5012
```

**API not responding?**
- Check production backend is reachable: `curl https://api.moifone.com/health`
- Check `.env` has correct `VITE_API_BASE`
- Check browser console for error messages

**Login not working?**
- Verify backend has `/api/auth/login` endpoint
- Check credentials are correct
- Check JWT token is being stored in localStorage

## Next Steps

1. Run both backend + frontend
2. Test all 6 dashboard pages
3. Verify data matches production database
4. Improve UI design
5. Add charts/exports
6. Test on mobile devices
7. Deploy to production

---

**Questions?** See `QUICKSTART.md` for quick run instructions.
