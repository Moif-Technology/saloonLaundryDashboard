# Salon Laundry Dashboard

Dashboard application for salon and laundry business management. Real-time sales, inventory, staff performance, and counter close tracking.

## Features

- **Counter Close**: End-of-shift cash reconciliation and settlement
- **Daily Sales**: Revenue breakdown by product and payment method
- **Staff Performance**: Sales and transaction metrics per staff member
- **Inventory Management**: Stock level tracking and low-stock alerts
- **Customer Ledger**: Credit sales tracking and outstanding balances
- **Multi-platform**: Web, iOS, and Android via Capacitor

## Tech Stack

- React 18
- TypeScript
- Capacitor 5 (mobile wrapper)
- Axios (HTTP client)
- Recharts (data visualization)
- Vite (build tool)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on `http://localhost:5011`

### Build

```bash
npm run build
```

## Environment Variables

Create `.env` file based on `.env.example`:

```env
VITE_API_BASE=http://localhost:5010  # Development
# VITE_API_BASE=https://api.moifone.com  # Production
```

## Mobile Build

### iOS

```bash
npm run build
npx cap add ios
npx cap open ios
```

### Android

```bash
npm run build
npx cap add android
npx cap open android
```

## API Integration

All dashboard components communicate with the backend API at `VITE_API_BASE`:

- `POST /auth/login` - User authentication
- `GET /dashboard/counter-close/summary` - Shift summary
- `POST /dashboard/counter-close/shift/{id}/close` - Close shift
- `GET /dashboard/sales` - Sales data
- `GET /dashboard/staff/performance` - Staff metrics
- `GET /dashboard/inventory/stock` - Stock levels
- `GET /dashboard/customers/ledger` - Customer ledger

## Backend Requirements

Ensure backend provides these endpoints:

1. **Authentication**
   - Return JWT token + user data on login

2. **Counter Close**
   - Daily summary with revenue, transactions, payment methods
   - Pending bills list
   - Shift close endpoint

3. **Sales Data**
   - Total revenue + transaction count
   - Breakdown by product
   - Breakdown by payment method

4. **Staff**
   - Performance metrics (sales, tips, rating)
   - Transaction history per staff

5. **Inventory**
   - Stock levels with min/reorder levels
   - Status (ok/low/critical)

6. **Customers**
   - Ledger with debit/credit/balance
   - Unpaid bills with overdue tracking

## Project Structure

```
src/
├── lib/
│   ├── api.ts        # API endpoints
│   └── auth.ts       # Auth utilities
├── components/
│   ├── Layout.tsx    # Main layout
│   └── Layout.css
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── CounterClose.tsx  # Priority feature
│   ├── DailySales.tsx
│   ├── StaffPerformance.tsx
│   ├── Inventory.tsx
│   └── CustomerLedger.tsx
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

## Next Steps

1. Implement backend API endpoints (matching this spec)
2. Add charts/graphs with Recharts for sales visualization
3. Add export functionality (PDF/Excel)
4. Add real-time updates with WebSocket
5. Add permissions/role-based access control
6. Mobile app testing and optimization

## License

Proprietary - Moifone Technologies
