import { useEffect, useState } from 'react';
import { dailySalesAPI } from '../lib/api';

interface SalesData {
  totalRevenue: number;
  transactionCount: number;
  avgTransaction: number;
  byProduct: Array<{ product: string; revenue: number; count: number }>;
  byPaymentMethod: Array<{ method: string; amount: number }>;
}

export default function DailySales() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [salesRes, productRes, paymentRes] = await Promise.all([
        dailySalesAPI.getSales(dateFrom, dateTo),
        dailySalesAPI.getSalesByProduct(dateFrom, dateTo),
        dailySalesAPI.getSalesByPaymentMethod(dateFrom, dateTo),
      ]);

      setSalesData({
        totalRevenue: salesRes.data.totalRevenue || 0,
        transactionCount: salesRes.data.transactionCount || 0,
        avgTransaction: (salesRes.data.totalRevenue || 0) / (salesRes.data.transactionCount || 1),
        byProduct: productRes.data.products || [],
        byPaymentMethod: paymentRes.data.methods || [],
      });
    } catch (err: any) {
      setError('Failed to load sales data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Daily Sales Report</h1>
        <p>Sales breakdown by product and payment method</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <span>to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button className="btn btn-primary" onClick={fetchSalesData}>
          Load
        </button>
      </div>

      {salesData && (
        <>
          <div className="grid">
            <div className="card">
              <div className="card-title">Total Revenue</div>
              <div className="card-value">₹{salesData.totalRevenue.toLocaleString()}</div>
            </div>
            <div className="card">
              <div className="card-title">Transactions</div>
              <div className="card-value">{salesData.transactionCount}</div>
            </div>
            <div className="card">
              <div className="card-title">Average Sale</div>
              <div className="card-value">₹{salesData.avgTransaction.toFixed(0)}</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Sales by Product</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Product</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Revenue</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {salesData.byProduct.map((item) => (
                  <tr key={item.product} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{item.product}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{item.revenue.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Payment Methods</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Method</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesData.byPaymentMethod.map((item) => (
                  <tr key={item.method} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{item.method}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
