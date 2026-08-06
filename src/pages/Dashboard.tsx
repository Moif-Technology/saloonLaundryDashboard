import { useEffect, useState } from 'react';
import { counterCloseAPI, dailySalesAPI } from '../lib/api';

interface DashboardStats {
  todayRevenue: number;
  totalTransactions: number;
  pendingBills: number;
  averageTransaction: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    totalTransactions: 0,
    pendingBills: 0,
    averageTransaction: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [salesRes, billsRes] = await Promise.all([
        dailySalesAPI.getSales(today, today),
        counterCloseAPI.getPendingBills(),
      ]);

      const sales = salesRes.data;
      const bills = billsRes.data;

      const todayRevenue = sales.totalRevenue || 0;
      const totalTransactions = sales.transactionCount || 0;
      const avgTransaction = totalTransactions > 0 ? todayRevenue / totalTransactions : 0;

      setStats({
        todayRevenue,
        totalTransactions,
        pendingBills: bills.count || 0,
        averageTransaction: avgTransaction,
      });
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time business metrics and summary</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <div className="card">
          <div className="card-title">Today Revenue</div>
          <div className="card-value">₹{stats.todayRevenue.toLocaleString()}</div>
          <div className="card-subtitle">Total sales today</div>
        </div>

        <div className="card">
          <div className="card-title">Total Transactions</div>
          <div className="card-value">{stats.totalTransactions}</div>
          <div className="card-subtitle">Today</div>
        </div>

        <div className="card">
          <div className="card-title">Avg Transaction</div>
          <div className="card-value">₹{stats.averageTransaction.toFixed(0)}</div>
          <div className="card-subtitle">Average per sale</div>
        </div>

        <div className="card">
          <div className="card-title">Pending Bills</div>
          <div className="card-value">{stats.pendingBills}</div>
          <div className="card-subtitle">Credit sales</div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Refresh Data
        </button>
      </div>
    </div>
  );
}
