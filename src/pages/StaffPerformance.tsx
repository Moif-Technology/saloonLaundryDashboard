import { useEffect, useState } from 'react';
import { staffAPI } from '../lib/api';

interface StaffData {
  staffId: string;
  name: string;
  totalRevenue: number;
  transactionCount: number;
  totalTips: number;
  avgTransaction: number;
  performanceRating: number;
}

export default function StaffPerformance() {
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await staffAPI.getStaffPerformance(dateFrom, dateTo);
      setStaff(res.data.staff || []);
    } catch (err: any) {
      setError('Failed to load staff performance data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Staff Performance</h1>
        <p>Sales and transaction metrics by staff member</p>
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
        <button className="btn btn-primary" onClick={fetchStaffData}>
          Load
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Total Revenue</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Transactions</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Avg Sale</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Tips</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.staffId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{member.name}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>₹{member.totalRevenue.toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>{member.transactionCount}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>₹{member.avgTransaction.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>₹{member.totalTips.toLocaleString()}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>
                  <span style={{
                    background: member.performanceRating >= 4 ? '#28a745' : '#ffc107',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {member.performanceRating.toFixed(1)} ⭐
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
