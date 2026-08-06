import { useEffect, useState } from 'react';
import { counterCloseAPI } from '../lib/api';
import './CounterClose.css';

interface ShiftSummary {
  shiftId: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  totalRevenue: number;
  totalTransactions: number;
  expectedCash: number;
  actualCash: number;
  cashDiscrepancy: number;
  cardRevenue: number;
  creditRevenue: number;
  expenses: number;
}

interface PendingBill {
  billId: string;
  customerName: string;
  amount: number;
  createdAt: string;
}

export default function CounterClose() {
  const [shiftSummary, setShiftSummary] = useState<ShiftSummary | null>(null);
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCounterData();
  }, []);

  const fetchCounterData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [summaryRes, billsRes] = await Promise.all([
        counterCloseAPI.getDailySummary(today),
        counterCloseAPI.getPendingBills(),
      ]);

      setShiftSummary(summaryRes.data);
      setPendingBills(billsRes.data.bills || []);
    } catch (err: any) {
      setError('Failed to load counter data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!shiftSummary || !actualCash) {
      setError('Please enter actual cash amount');
      return;
    }

    try {
      setIsClosing(true);
      setError('');
      setSuccess('');

      await counterCloseAPI.closeShift(shiftSummary.shiftId, {
        actualCash: parseFloat(actualCash),
        notes,
      });

      setSuccess('Shift closed successfully!');
      setActualCash('');
      setNotes('');
      setTimeout(() => fetchCounterData(), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to close shift');
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  const discrepancy = shiftSummary
    ? parseFloat(actualCash || '0') - (shiftSummary.expectedCash || 0)
    : 0;
  const discrepancyPercent = shiftSummary && shiftSummary.expectedCash
    ? ((discrepancy / shiftSummary.expectedCash) * 100).toFixed(2)
    : 0;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Counter Close</h1>
        <p>End of shift settlement and cash reconciliation</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {shiftSummary && (
        <div className="counter-close-wrapper">
          <div className="section">
            <h2>Shift Summary</h2>
            <div className="grid">
              <div className="card">
                <div className="card-title">Staff Name</div>
                <div className="card-value" style={{ fontSize: '18px' }}>
                  {shiftSummary.staffName}
                </div>
              </div>

              <div className="card">
                <div className="card-title">Total Revenue</div>
                <div className="card-value">₹{shiftSummary.totalRevenue.toLocaleString()}</div>
              </div>

              <div className="card">
                <div className="card-title">Total Transactions</div>
                <div className="card-value">{shiftSummary.totalTransactions}</div>
              </div>

              <div className="card">
                <div className="card-title">Card Revenue</div>
                <div className="card-value">₹{shiftSummary.cardRevenue.toLocaleString()}</div>
              </div>

              <div className="card">
                <div className="card-title">Credit Sales</div>
                <div className="card-value">₹{shiftSummary.creditRevenue.toLocaleString()}</div>
              </div>

              <div className="card">
                <div className="card-title">Expenses</div>
                <div className="card-value">₹{shiftSummary.expenses.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Cash Reconciliation</h2>
            <div className="reconciliation-cards">
              <div className="card">
                <div className="card-title">Expected Cash</div>
                <div className="card-value">₹{shiftSummary.expectedCash.toLocaleString()}</div>
              </div>

              <div className="form-group">
                <label htmlFor="actual-cash">Actual Cash Counted</label>
                <input
                  id="actual-cash"
                  type="number"
                  value={actualCash}
                  onChange={(e) => setActualCash(e.target.value)}
                  placeholder="Enter actual cash amount"
                  step="0.01"
                />
              </div>

              {actualCash && (
                <div className={`card discrepancy ${discrepancy >= 0 ? 'positive' : 'negative'}`}>
                  <div className="card-title">Discrepancy</div>
                  <div className="card-value">
                    ₹{discrepancy.toFixed(2)}
                  </div>
                  <div className="card-subtitle">
                    {discrepancy >= 0 ? '+' : ''}{discrepancyPercent}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {pendingBills.length > 0 && (
            <div className="section">
              <h2>Pending Bills</h2>
              <table className="bills-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBills.map((bill) => (
                    <tr key={bill.billId}>
                      <td>{bill.billId}</td>
                      <td>{bill.customerName}</td>
                      <td>₹{bill.amount.toLocaleString()}</td>
                      <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="section">
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any discrepancies or notes about this shift..."
                rows={4}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCloseShift}
              disabled={isClosing || !actualCash}
            >
              {isClosing ? 'Closing...' : 'Close Shift'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
