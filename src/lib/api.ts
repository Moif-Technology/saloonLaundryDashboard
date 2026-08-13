import axios from 'axios';
import * as mockData from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.moifone.com';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true'; // Only true if explicitly set

/**
 * ops.counter_close row as returned by counter.service.mapCloseRow.
 * The API already emits camelCase numbers; Number() here only guards nulls.
 */
const mapClose = (row: any) => ({
  closeId: Number(row.closeId ?? row.id ?? 0),
  closeNo: row.closeNo ?? row.close_no ?? null,
  reportType: row.reportType ?? row.report_type ?? 'Z',
  closeDate: row.closeDate ?? row.close_date,
  counterNo: Number(row.counterNo ?? row.counter_no ?? 0),
  staffName: row.staffName ?? row.staff_name ?? null,
  totalCash: Number(row.totalCash ?? 0),
  totalCredit: Number(row.totalCredit ?? 0),
  totalCard: Number(row.totalCard ?? 0),
  totalDiscount: Number(row.totalDiscount ?? 0),
  totalRefund: Number(row.totalRefund ?? 0),
  totalRoundOff: Number(row.totalRoundOff ?? 0),
  totalTax: Number(row.totalTax ?? 0),
  grossAmount: Number(row.grossAmount ?? 0),
  cashIn: Number(row.cashIn ?? 0),
  cashOut: Number(row.cashOut ?? 0),
  cashToBeCollected: Number(row.cashToBeCollected ?? 0),
  collectedCash: Number(row.collectedCash ?? 0),
  cashDifference: Number(row.cashDifference ?? 0),
  billCount: Number(row.billCount ?? 0),
  startBillNo: row.startBillNo != null ? Number(row.startBillNo) : null,
  endBillNo: row.endBillNo != null ? Number(row.endBillNo) : null,
  creditReceiptCash: Number(row.creditReceiptCash ?? 0),
  creditReceiptCard: Number(row.creditReceiptCard ?? 0),
  creditReceiptCount: Number(row.creditReceiptCount ?? 0),
});

const mapStaffSale = (row: any) => ({
  staffId: row.staffId ?? null,
  staffName: row.staffName ?? 'Unknown',
  billCount: Number(row.billCount ?? 0),
  saleAmount: Number(row.saleAmount ?? 0),
  refundAmount: Number(row.refundAmount ?? 0),
  cashAmount: Number(row.cashAmount ?? 0),
  cardAmount: Number(row.cardAmount ?? 0),
  creditAmount: Number(row.creditAmount ?? 0),
});

const mapCashMove = (row: any) => ({
  id: Number(row.id ?? 0),
  transactionType: row.transactionType ?? row.transaction_type ?? '',
  amount: Number(row.amount ?? 0),
  remarks: row.remarks ?? null,
  createdAt: row.createdAt ?? row.created_at,
});

const mapCloseDetail = (data: any) => ({
  ...mapClose(data),
  staffSales: (data.staffSales || []).map(mapStaffSale),
  cashInOutList: (data.cashInOutList || []).map(mapCashMove),
});

const mapBill = (bill: any) => ({
  billId: bill.billId ?? bill.bill_id,
  customerName: bill.customerName ?? bill.customer_name ?? 'Walk-in',
  amount: Number(bill.amount ?? 0),
  daysOverdue: Number(bill.daysOverdue ?? bill.days_overdue ?? 0),
  createdAt: bill.createdAt ?? bill.created_at,
});

const mapStockItem = (item: any) => ({
  itemId: item.itemId ?? item.item_id,
  name: item.name,
  sku: item.sku,
  currentStock: Number(item.currentStock ?? item.current_stock ?? 0),
  minimumStock: Number(item.minimumStock ?? item.minimum_stock ?? 0),
  reorderLevel: Number(item.reorderLevel ?? item.reorder_level ?? 0),
  unit: item.unit,
  status: item.status,
});

const mapLedgerEntry = (entry: any) => ({
  customerId: entry.customerId ?? entry.customer_id,
  name: entry.name,
  totalDebit: Number(entry.totalDebit ?? entry.total_debit ?? 0),
  totalCredit: Number(entry.totalCredit ?? entry.total_credit ?? 0),
  balance: Number(entry.balance ?? 0),
  lastTransaction: entry.lastTransaction ?? entry.last_transaction,
});

const mapStaff = (staff: any) => ({
  staffId: staff.staffId ?? staff.staff_id,
  name: staff.name,
  totalRevenue: Number(staff.totalRevenue ?? staff.total_revenue ?? 0),
  transactionCount: Number(staff.transactionCount ?? staff.transaction_count ?? 0),
  totalTips: Number(staff.totalTips ?? staff.total_tips ?? 0),
  avgTransaction: Number(staff.avgTransaction ?? staff.avg_transaction ?? 0),
  performanceRating: Number(staff.performanceRating ?? staff.performance_rating ?? 0),
});

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock interceptor - intercepts requests and returns mock data
if (USE_MOCK_DATA) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // If error and using mock, return mock data
      console.log('Using mock data for:', error.config?.url);
      return Promise.resolve({ data: {} });
    }
  );

  // Intercept requests before sending
  api.interceptors.request.use((config) => {
    const url = config.url || '';

    // Counter close endpoints
    if (url.includes('/counter-close/summary')) {
      setTimeout(() => {}, 300); // Simulate delay
      return Promise.reject({
        response: { data: mockData.mockCounterCloseSummary },
        config,
      });
    }

    if (url.includes('/counter-close/pending-bills')) {
      return Promise.reject({
        response: { data: { bills: mockData.mockPendingBills } },
        config,
      });
    }

    if (url.includes('/counter-close/shift') && config.method === 'post') {
      return Promise.reject({
        response: { data: { success: true, message: 'Shift closed successfully' } },
        config,
      });
    }

    // Sales endpoints
    if (url.includes('/dashboard/sales') && !url.includes('products') && !url.includes('payment')) {
      return Promise.reject({
        response: {
          data: {
            totalRevenue: mockData.mockDailySalesData.totalRevenue,
            transactionCount: mockData.mockDailySalesData.transactionCount,
          },
        },
        config,
      });
    }

    if (url.includes('/sales/products')) {
      return Promise.reject({
        response: {
          data: { products: mockData.mockDailySalesData.products },
        },
        config,
      });
    }

    if (url.includes('/sales/payment-methods')) {
      return Promise.reject({
        response: {
          data: { methods: mockData.mockDailySalesData.methods },
        },
        config,
      });
    }

    // Staff endpoints
    if (url.includes('/staff/performance')) {
      return Promise.reject({
        response: {
          data: { staff: mockData.mockStaffPerformance },
        },
        config,
      });
    }

    // Inventory endpoints
    if (url.includes('/inventory/stock')) {
      return Promise.reject({
        response: {
          data: { items: mockData.mockInventoryItems },
        },
        config,
      });
    }

    // Customer endpoints
    if (url.includes('/customers/ledger')) {
      return Promise.reject({
        response: {
          data: { entries: mockData.mockCustomerLedger },
        },
        config,
      });
    }

    if (url.includes('/customers/unpaid-bills')) {
      return Promise.reject({
        response: {
          data: { bills: mockData.mockUnpaidBills },
        },
        config,
      });
    }

    // Auth endpoints
    if (url.includes('/auth/login')) {
      return Promise.reject({
        response: {
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: mockData.mockAuthUser,
          },
        },
        config,
      });
    }

    return config;
  });
}

/**
 * Counter close HISTORY — read-only.
 *
 * Reads rows already written to ops.counter_close by a POS Z report. The
 * dashboard never performs a close; it only reports on closes that happened.
 * Backend: api/src/pos/salon/salon.routes.js -> counter-pos counter.controller.
 *
 * Scope note: /counter/history filters by station_id (from the token) and
 * counterNo, and is staff-scoped unless allStaff is set — the dashboard is a
 * manager view, so allStaff is always on.
 */
export const counterHistoryAPI = {
  getHistory: (dateFrom: string, dateTo: string, counterNo = 1) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { closes: mockData.mockCounterCloses.map(mapClose) },
      });
    }
    return api
      .get('/api/salon-pos/counter/history', {
        params: { dateFrom, dateTo, counterNo, allStaff: true, limit: 200 },
      })
      .then((response) => ({
        ...response,
        data: { closes: (response.data.closes || []).map(mapClose) },
      }));
  },

  getCloseDetail: (closeId: string | number) => {
    if (USE_MOCK_DATA) {
      const found =
        mockData.mockCounterCloses.find((row: any) => String(row.closeId) === String(closeId)) ||
        mockData.mockCounterCloses[0];
      return Promise.resolve({ data: mapCloseDetail(found) });
    }
    return api
      .get(`/api/salon-pos/counter/history/${closeId}`)
      .then((response) => ({ ...response, data: mapCloseDetail(response.data) }));
  },
};

// Counter close endpoints
export const counterCloseAPI = {
  getPendingBills: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { bills: mockData.mockPendingBills },
      });
    }
    return api.get('/api/salon-dashboard/counter-close/pending-bills')
      .then((response) => ({
        ...response,
        data: {
          ...response.data,
          bills: (response.data.bills || []).map(mapBill),
        },
      }));
  },

};

// Daily sales endpoints
export const dailySalesAPI = {
  getSales: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: {
          totalRevenue: mockData.mockDailySalesData.totalRevenue,
          transactionCount: mockData.mockDailySalesData.transactionCount,
        },
      });
    }
    return api.get(`/api/salon-dashboard/sales?from=${from}&to=${to}`)
      .then((response) => ({
        ...response,
        data: {
          totalRevenue: Number(response.data.totalRevenue ?? response.data.total_revenue ?? 0),
          transactionCount: Number(response.data.transactionCount ?? response.data.transaction_count ?? 0),
          uniqueCustomers: Number(response.data.uniqueCustomers ?? response.data.unique_customers ?? 0),
        },
      }));
  },

  getSalesByProduct: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { products: mockData.mockDailySalesData.products },
      });
    }
    return api.get(`/api/salon-dashboard/sales/products?from=${from}&to=${to}`);
  },

  getSalesByPaymentMethod: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { methods: mockData.mockDailySalesData.methods },
      });
    }
    return api.get(`/api/salon-dashboard/sales/payment-methods?from=${from}&to=${to}`);
  },
};

// Staff performance endpoints
export const staffAPI = {
  getStaffPerformance: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { staff: mockData.mockStaffPerformance },
      });
    }
    return api.get(`/api/salon-dashboard/staff/performance?from=${from}&to=${to}`)
      .then((response) => ({
        ...response,
        data: { staff: (response.data.staff || []).map(mapStaff) },
      }));
  },

  getStaffTransactions: (staffId: string, from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: {
          transactions: mockData.mockStaffPerformance.find(
            (s) => s.staffId === staffId
          ) || {},
        },
      });
    }
    return api.get(`/api/salon-dashboard/staff/${staffId}/transactions?from=${from}&to=${to}`);
  },
};

// Inventory endpoints
export const inventoryAPI = {
  getStockLevels: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { items: mockData.mockInventoryItems },
      });
    }
    return api.get('/api/salon-dashboard/inventory/stock')
      .then((response) => ({
        ...response,
        data: { items: (response.data.items || []).map(mapStockItem) },
      }));
  },

  getLowStockAlerts: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: {
          items: mockData.mockInventoryItems.filter(
            (item) => item.status === 'low' || item.status === 'critical'
          ),
        },
      });
    }
    return api.get('/api/salon-dashboard/inventory/low-stock');
  },
};

// Customer ledger endpoints
export const customerAPI = {
  getCustomerLedger: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { entries: mockData.mockCustomerLedger },
      });
    }
    return api.get('/api/salon-dashboard/customers/ledger')
      .then((response) => ({
        ...response,
        data: { entries: (response.data.entries || []).map(mapLedgerEntry) },
      }));
  },

  getUnpaidBills: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { bills: mockData.mockUnpaidBills },
      });
    }
    return api.get('/api/salon-dashboard/customers/unpaid-bills')
      .then((response) => ({
        ...response,
        data: { bills: (response.data.bills || []).map(mapBill) },
      }));
  },
};
