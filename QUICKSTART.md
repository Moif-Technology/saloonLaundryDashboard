# Quick Start Guide - Salon Laundry Dashboard

## 🚀 Setup & Run

### Option A: With Real Backend (Recommended for Development)

**Terminal 1 — Start Backend API:**
```bash
cd "d:\ERP SOFTWARE DESKTOP\ERP new version\api"
npm install
npm start
```
Expected output:
```
✓ Database connected: moifone_uae
✓ Server running on :5010
```

**Terminal 2 — Start Frontend Dashboard:**
```bash
cd "d:\ERP SOFTWARE DESKTOP\ERP new version\salon-laundry-dashboard"
npm install
npm run dev
```
Expected output:
```
  ➜  Local:   http://localhost:5011/
```

**Open in browser:** http://localhost:5011

**Login:**
```
Email:    your UAE salon/laundry admin user from the DB
Password: (actual password from DB)
```

### Option B: With Mock Data (No Backend Needed)

Edit `.env`:
```env
VITE_USE_MOCK=true
```

Then:
```bash
npm install
npm run dev
```

**Login:**
```
Email:    any email (mock accepts anything)
Password: any password
```

---

## 📊 What You Can Test

### Counter Close (Priority Feature)
- View shift summary (staff name, total revenue, transactions)
- See expected cash amount
- Enter actual cash counted
- View cash discrepancy (live calculation)
- See pending bills table
- Add shift notes
- Click "Close Shift" button (mock)

### Daily Sales
- Revenue breakdown by product
- Sales count per product
- Payment method breakdown (cash/card/credit)
- Date range filter

### Staff Performance
- Revenue per staff member
- Transaction count
- Tips collected
- Performance rating (stars)
- Date range filter

### Inventory
- Stock levels with status (ok/low/critical)
- Low stock alerts
- Reorder levels
- Filter by status (all/low/critical)

### Customer Ledger
- Customer credit balances
- Debit/credit tracking
- Unpaid bills with overdue days
- Tabs for ledger view + unpaid bills

---

## 🔧 Configuration

### Mock Data Settings

File: `.env`

```env
VITE_USE_MOCK=true    # Set to false to use real API
VITE_API_BASE=http://localhost:5010
```

### Switch to Real API (when backend ready)

Edit `.env`:
```env
VITE_USE_MOCK=false
VITE_API_BASE=https://api.moifone.com  # Production
# or
VITE_API_BASE=http://localhost:5010    # Development
```

Then restart dev server.

---

## 📁 Mock Data Locations

All mock data defined in: `src/lib/mockData.ts`

- `mockAuthUser` - Login user
- `mockCounterCloseSummary` - Shift data
- `mockPendingBills` - Credit sales
- `mockDailySalesData` - Products + payment methods
- `mockStaffPerformance` - Staff metrics
- `mockInventoryItems` - Stock levels
- `mockCustomerLedger` - Customer balances
- `mockUnpaidBills` - Overdue bills

Edit these to change mock data.

---

## 🛠️ Development Commands

```bash
# Start dev server (http://localhost:5011)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📱 Mobile (iOS/Android)

### Build Web First
```bash
npm run build
```

### iOS
```bash
npx cap add ios
npx cap open ios
```

### Android
```bash
npx cap add android
npx cap open android
```

---

## 🔌 When Backend is Ready

Backend needs these endpoints (see `src/lib/api.ts`):

1. `POST /auth/login` - Return `{ token, user }`
2. `GET /dashboard/counter-close/summary?date=YYYY-MM-DD`
3. `GET /dashboard/counter-close/pending-bills`
4. `POST /dashboard/counter-close/shift/{shiftId}/close` - Close shift
5. `GET /dashboard/sales?from=DATE&to=DATE`
6. `GET /dashboard/sales/products?from=DATE&to=DATE`
7. `GET /dashboard/sales/payment-methods?from=DATE&to=DATE`
8. `GET /dashboard/staff/performance?from=DATE&to=DATE`
9. `GET /dashboard/inventory/stock`
10. `GET /dashboard/customers/ledger`
11. `GET /dashboard/customers/unpaid-bills`

Set `VITE_USE_MOCK=false` to switch to real API.

---

## ✅ Troubleshooting

**Port already in use (5011)?**
```bash
# Use different port
npx vite --port 5012
```

**npm not found?**
- Install Node.js: https://nodejs.org (v18+)

**Module not found?**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Mock data not working?**
- Check `.env` has `VITE_USE_MOCK=true`
- Restart dev server: `Ctrl+C` then `npm run dev`

---

## 📝 Notes

- Mock data is instant (no network delay simulated)
- All forms submit successfully (mock)
- Login accepts any credentials
- Safe to modify mock data while dev server running
- Changes to `mockData.ts` require restart

---

**Ready?** Run `npm install && npm run dev` now! 🎉
