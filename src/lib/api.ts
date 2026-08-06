import axios from 'axios';
import * as mockData from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5010';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true'; // Only true if explicitly set

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

// Counter close endpoints
export const counterCloseAPI = {
  getDailySummary: (date: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: mockData.mockCounterCloseSummary,
      });
    }
    return api.get(`/salon-dashboard/counter-close/summary?date=${date}`);
  },

  getPendingBills: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { bills: mockData.mockPendingBills },
      });
    }
    return api.get('/salon-dashboard/counter-close/pending-bills');
  },

  getShiftSummary: (shiftId: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: mockData.mockCounterCloseSummary,
      });
    }
    return api.get(`/salon-dashboard/counter-close/shift/${shiftId}`);
  },

  closeShift: (shiftId: string, data: any) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { success: true, message: 'Shift closed successfully' },
      });
    }
    return api.post(`/salon-dashboard/counter-close/shift/${shiftId}/close`, data);
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
    return api.get(`/salon-dashboard/sales?from=${from}&to=${to}`);
  },

  getSalesByProduct: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { products: mockData.mockDailySalesData.products },
      });
    }
    return api.get(`/salon-dashboard/sales/products?from=${from}&to=${to}`);
  },

  getSalesByPaymentMethod: (from: string, to: string) => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { methods: mockData.mockDailySalesData.methods },
      });
    }
    return api.get(`/salon-dashboard/sales/payment-methods?from=${from}&to=${to}`);
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
    return api.get(`/salon-dashboard/staff/performance?from=${from}&to=${to}`);
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
    return api.get(`/salon-dashboard/staff/${staffId}/transactions?from=${from}&to=${to}`);
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
    return api.get('/salon-dashboard/inventory/stock');
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
    return api.get('/salon-dashboard/inventory/low-stock');
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
    return api.get('/salon-dashboard/customers/ledger');
  },

  getUnpaidBills: () => {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        data: { bills: mockData.mockUnpaidBills },
      });
    }
    return api.get('/salon-dashboard/customers/unpaid-bills');
  },
};
