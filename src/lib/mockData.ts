// Mock data for development/testing without backend

export const mockAuthUser = {
  id: 'user-001',
  email: 'admin@moifone.com',
  name: 'Rajesh Kumar',
  role: 'Manager',
  permissions: ['view_dashboard', 'close_counter', 'manage_inventory'],
};

export const mockDashboardSummary = {
  todayRevenue: 45000,
  transactionCount: 87,
  avgTransaction: 517,
  pendingBills: 3,
};

export const mockCounterCloseSummary = {
  shiftId: 'shift-2024-08-06-001',
  staffName: 'Priya Sharma',
  startTime: '2024-08-06T09:00:00Z',
  endTime: null,
  totalRevenue: 45000,
  totalTransactions: 87,
  expectedCash: 35000,
  actualCash: 0,
  cashDiscrepancy: 0,
  cardRevenue: 8500,
  creditRevenue: 1500,
  expenses: 500,
};

export const mockPendingBills = [
  {
    billId: 'BILL-2024-0521',
    customerName: 'Amit Patel',
    amount: 2500,
    createdAt: '2024-08-01T10:30:00Z',
  },
  {
    billId: 'BILL-2024-0534',
    customerName: 'Sneha Verma',
    amount: 1800,
    createdAt: '2024-08-02T14:45:00Z',
  },
  {
    billId: 'BILL-2024-0541',
    customerName: 'Priya Singh',
    amount: 3200,
    createdAt: '2024-08-03T11:20:00Z',
  },
];

export const mockDailySalesData = {
  totalRevenue: 45000,
  transactionCount: 87,
  products: [
    { product: 'Hair Cut', revenue: 15000, count: 30 },
    { product: 'Hair Coloring', revenue: 12000, count: 15 },
    { product: 'Bridal Makeup', revenue: 8000, count: 8 },
    { product: 'Facial', revenue: 5000, count: 10 },
    { product: 'Threading', revenue: 3000, count: 20 },
    { product: 'Hair Spa', revenue: 2000, count: 4 },
  ],
  methods: [
    { method: 'Cash', amount: 30000 },
    { method: 'Card', amount: 12000 },
    { method: 'Credit', amount: 3000 },
  ],
};

export const mockStaffPerformance = [
  {
    staffId: 'staff-001',
    name: 'Priya Sharma',
    totalRevenue: 15000,
    transactionCount: 30,
    totalTips: 1500,
    avgTransaction: 500,
    performanceRating: 4.8,
  },
  {
    staffId: 'staff-002',
    name: 'Neha Gupta',
    totalRevenue: 12000,
    transactionCount: 25,
    totalTips: 1200,
    avgTransaction: 480,
    performanceRating: 4.5,
  },
  {
    staffId: 'staff-003',
    name: 'Anjali Kumar',
    totalRevenue: 10000,
    transactionCount: 20,
    totalTips: 950,
    avgTransaction: 500,
    performanceRating: 4.3,
  },
  {
    staffId: 'staff-004',
    name: 'Deepika Singh',
    totalRevenue: 8000,
    transactionCount: 12,
    totalTips: 750,
    avgTransaction: 667,
    performanceRating: 4.6,
  },
];

export const mockInventoryItems = [
  {
    itemId: 'inv-001',
    name: 'Hair Shampoo',
    sku: 'HS-001',
    currentStock: 45,
    minimumStock: 20,
    reorderLevel: 30,
    unit: 'pcs',
    status: 'ok' as const,
  },
  {
    itemId: 'inv-002',
    name: 'Hair Conditioner',
    sku: 'HC-001',
    currentStock: 12,
    minimumStock: 20,
    reorderLevel: 25,
    unit: 'pcs',
    status: 'low' as const,
  },
  {
    itemId: 'inv-003',
    name: 'Face Cream',
    sku: 'FC-001',
    currentStock: 3,
    minimumStock: 10,
    reorderLevel: 15,
    unit: 'pcs',
    status: 'critical' as const,
  },
  {
    itemId: 'inv-004',
    name: 'Hair Color (Black)',
    sku: 'HCB-001',
    currentStock: 28,
    minimumStock: 15,
    reorderLevel: 20,
    unit: 'pcs',
    status: 'ok' as const,
  },
  {
    itemId: 'inv-005',
    name: 'Thread (White)',
    sku: 'TW-001',
    currentStock: 150,
    minimumStock: 50,
    reorderLevel: 100,
    unit: 'rolls',
    status: 'ok' as const,
  },
  {
    itemId: 'inv-006',
    name: 'Face Mask',
    sku: 'FM-001',
    currentStock: 8,
    minimumStock: 15,
    reorderLevel: 20,
    unit: 'pcs',
    status: 'low' as const,
  },
  {
    itemId: 'inv-007',
    name: 'Cotton Pads',
    sku: 'CP-001',
    currentStock: 200,
    minimumStock: 100,
    reorderLevel: 150,
    unit: 'pcs',
    status: 'ok' as const,
  },
];

export const mockCustomerLedger = [
  {
    customerId: 'cust-001',
    name: 'Amit Patel',
    totalDebit: 5000,
    totalCredit: 2500,
    balance: 2500,
    lastTransaction: '2024-08-06T10:00:00Z',
  },
  {
    customerId: 'cust-002',
    name: 'Sneha Verma',
    totalDebit: 8000,
    totalCredit: 6200,
    balance: 1800,
    lastTransaction: '2024-08-05T15:30:00Z',
  },
  {
    customerId: 'cust-003',
    name: 'Priya Singh',
    totalDebit: 6500,
    totalCredit: 3300,
    balance: 3200,
    lastTransaction: '2024-08-04T12:00:00Z',
  },
  {
    customerId: 'cust-004',
    name: 'Rajesh Desai',
    totalDebit: 12000,
    totalCredit: 12000,
    balance: 0,
    lastTransaction: '2024-08-06T08:00:00Z',
  },
  {
    customerId: 'cust-005',
    name: 'Meena Joshi',
    totalDebit: 4500,
    totalCredit: 4500,
    balance: 0,
    lastTransaction: '2024-08-03T14:00:00Z',
  },
];

export const mockUnpaidBills = [
  {
    billId: 'BILL-2024-0521',
    customerName: 'Amit Patel',
    amount: 2500,
    daysOverdue: 5,
    createdAt: '2024-08-01T10:30:00Z',
  },
  {
    billId: 'BILL-2024-0534',
    customerName: 'Sneha Verma',
    amount: 1800,
    daysOverdue: 3,
    createdAt: '2024-08-02T14:45:00Z',
  },
  {
    billId: 'BILL-2024-0541',
    customerName: 'Priya Singh',
    amount: 3200,
    daysOverdue: 2,
    createdAt: '2024-08-03T11:20:00Z',
  },
];
