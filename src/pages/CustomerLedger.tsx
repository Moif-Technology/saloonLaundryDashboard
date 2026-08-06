import { useEffect, useState } from 'react';
import { customerAPI } from '../lib/api';

interface UnpaidBill {
  billId: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  createdAt: string;
}

interface LedgerEntry {
  customerId: string;
  name: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  lastTransaction: string;
}

export default function CustomerLedger() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [unpaidBills, setUnpaidBills] = useState<UnpaidBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'ledger' | 'unpaid'>('ledger');

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [ledgerRes, billsRes] = await Promise.all([
        customerAPI.getCustomerLedger(),
        customerAPI.getUnpaidBills(),
      ]);

      setLedger(ledgerRes.data.entries || []);
      setUnpaidBills(billsRes.data.bills || []);
    } catch (err: any) {
      setError('Failed to load customer data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner"></div>;

  const totalBalance = ledger.reduce((sum, entry) => sum + entry.balance, 0);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Customer Ledger</h1>
        <p>Credit sales tracking and outstanding balances</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="card-title">Total Balance</div>
          <div className="card-value">₹{Math.abs(totalBalance).toLocaleString()}</div>
          <div className="card-subtitle">
            {totalBalance > 0 ? 'Amount to collect' : 'Amount to refund'}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Unpaid Bills</div>
          <div className="card-value">{unpaidBills.length}</div>
          <div className="card-subtitle">₹{totalUnpaid.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="card-title">Credit Customers</div>
          <div className="card-value">{ledger.length}</div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #eee' }}>
          <button
            style={{
              background: activeTab === 'ledger' ? '#007bff' : 'transparent',
              color: activeTab === 'ledger' ? 'white' : '#666',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: '500',
            }}
            onClick={() => setActiveTab('ledger')}
          >
            Customer Ledger
          </button>
          <button
            style={{
              background: activeTab === 'unpaid' ? '#007bff' : 'transparent',
              color: activeTab === 'unpaid' ? 'white' : '#666',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '4px 4px 0 0',
              fontWeight: '500',
            }}
            onClick={() => setActiveTab('unpaid')}
          >
            Unpaid Bills
          </button>
        </div>
      </div>

      {activeTab === 'ledger' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Debit</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Credit</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Balance</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Last Transaction</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr key={entry.customerId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{entry.name}</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>₹{entry.totalDebit.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>₹{entry.totalCredit.toLocaleString()}</td>
                  <td style={{
                    textAlign: 'right',
                    padding: '12px',
                    color: entry.balance > 0 ? '#28a745' : '#dc3545',
                    fontWeight: '600',
                  }}>
                    ₹{entry.balance.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(entry.lastTransaction).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'unpaid' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Bill ID</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Customer</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Amount</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Days Overdue</th>
                <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {unpaidBills.map((bill) => (
                <tr key={bill.billId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>{bill.billId}</td>
                  <td style={{ padding: '12px' }}>{bill.customerName}</td>
                  <td style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>₹{bill.amount.toLocaleString()}</td>
                  <td style={{
                    textAlign: 'center',
                    padding: '12px',
                    color: bill.daysOverdue > 30 ? '#dc3545' : bill.daysOverdue > 7 ? '#ffc107' : '#666',
                  }}>
                    {bill.daysOverdue} days
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#666' }}>
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
