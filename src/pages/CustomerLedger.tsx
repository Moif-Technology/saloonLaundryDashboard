import { useEffect, useState } from 'react';
import { customerAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconCheck, IconInbox } from '../components/Icon';
import './CustomerLedger.css';
import { useRefreshHandler } from '../lib/pullToRefresh';

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

  useRefreshHandler(fetchCustomerData);

  if (isLoading) {
    return (
      <div className="page">
        <div className="sk-stack" style={{ maxWidth: 300 }}>
          <div className="sk sk-line is-sm" style={{ width: '34%' }} />
          <div className="sk sk-line is-lg" style={{ width: '68%' }} />
        </div>
        <div className="stat-rail" style={{ marginTop: 28 }}>
          {[0, 1, 2].map((key) => (
            <div className="stat" key={key}>
              <div className="sk sk-line is-sm" style={{ width: '62%' }} />
              <div className="sk sk-line" style={{ marginTop: 12, width: '76%', height: 20 }} />
            </div>
          ))}
        </div>
        <div className="sk-rows">
          {[0, 1, 2, 3, 4].map((key) => (
            <div className="sk-row" key={key}>
              <div className="sk sk-line" style={{ width: '50%' }} />
              <div className="sk sk-line is-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalBalance = ledger.reduce((sum, entry) => sum + entry.balance, 0);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const badlyOverdue = unpaidBills.filter((bill) => bill.daysOverdue > 30).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Receivables</p>
          <h1 className="page-title">Customer ledger</h1>
          <p className="page-sub">Credit given, credit collected, and what is still owed.</p>
        </div>
      </div>

      {error && (
        <div className="notice is-error" role="alert" style={{ marginBottom: 20 }}>
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      {badlyOverdue > 0 && (
        <div className="notice is-warn" style={{ marginBottom: 20 }}>
          <IconAlert />
          <span>
            {badlyOverdue} {badlyOverdue === 1 ? 'bill has' : 'bills have'} passed 30 days. Chase
            before the month closes.
          </span>
        </div>
      )}

      <section className="stat-rail" aria-label="Receivables summary">
        <div
          className={`stat ${totalBalance > 0 ? 'is-pos' : totalBalance < 0 ? 'is-neg' : ''}`}
          style={{ '--i': 0 } as React.CSSProperties}
        >
          <p className="stat-label">Net balance</p>
          <p className="stat-value">{formatMoney(Math.abs(totalBalance))}</p>
          <p className="stat-foot">{totalBalance >= 0 ? 'To collect' : 'To refund'}</p>
        </div>
        <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
          <p className="stat-label">Open bills</p>
          <p className="stat-value">{unpaidBills.length}</p>
          <p className="stat-foot">{formatMoney(totalUnpaid)}</p>
        </div>
        <div className="stat" style={{ '--i': 2 } as React.CSSProperties}>
          <p className="stat-label">On credit</p>
          <p className="stat-value">{ledger.length}</p>
          <p className="stat-foot">Customer accounts</p>
        </div>
      </section>

      <section className="section">
        <div className="segmented" role="tablist" aria-label="Ledger views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'ledger'}
            className="segment"
            onClick={() => setActiveTab('ledger')}
          >
            Balances
            <span className="segment-count">{ledger.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'unpaid'}
            className="segment"
            onClick={() => setActiveTab('unpaid')}
          >
            Unpaid
            <span className="segment-count">{unpaidBills.length}</span>
          </button>
        </div>

        {activeTab === 'ledger' &&
          (ledger.length === 0 ? (
            <div className="empty">
              <span className="empty-mark">
                <IconInbox />
              </span>
              <p className="empty-title">No credit accounts</p>
              <p className="empty-body">
                Customers appear here the moment a ticket is settled on account rather than paid.
              </p>
            </div>
          ) : (
            <>
              <div className="dl-head ledger-grid">
                <span>Customer</span>
                <span>Movement</span>
                <span>Last activity</span>
                <span style={{ textAlign: 'right' }}>Balance</span>
              </div>
              <ul className="dl">
                {ledger.map((entry, index) => (
                  <li
                    className="dl-row ledger-grid"
                    key={entry.customerId}
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <span className="dl-primary">{entry.name}</span>
                    <span className="dl-meta ledger-debit">
                      <span className="mono">{formatMoney(entry.totalDebit)} out</span>
                      <span className="sep" />
                      <span className="mono">{formatMoney(entry.totalCredit)} in</span>
                    </span>
                    <span className="dl-meta ledger-when">
                      Last {new Date(entry.lastTransaction).toLocaleDateString('en-AE')}
                    </span>
                    <span className={`dl-num ${entry.balance > 0 ? 'is-pos' : 'is-neg'}`}>
                      {formatMoney(entry.balance)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ))}

        {activeTab === 'unpaid' &&
          (unpaidBills.length === 0 ? (
            <div className="empty">
              <span className="empty-mark">
                <IconCheck size={20} />
              </span>
              <p className="empty-title">Everything is paid up</p>
              <p className="empty-body">No outstanding bills against any customer account.</p>
            </div>
          ) : (
            <>
              <div className="dl-head unpaid-grid">
                <span>Customer</span>
                <span>Age</span>
                <span style={{ textAlign: 'right' }}>Amount</span>
              </div>
              <ul className="dl">
                {unpaidBills.map((bill, index) => {
                  const tone =
                    bill.daysOverdue > 30 ? 'is-neg' : bill.daysOverdue > 7 ? 'is-gold' : '';
                  return (
                    <li
                      className="dl-row unpaid-grid"
                      key={bill.billId}
                      style={{ '--i': index } as React.CSSProperties}
                    >
                      <span className="dl-primary">{bill.customerName}</span>
                      <span className="dl-meta">
                        <span className="mono">#{bill.billId}</span>
                        <span className="sep" />
                        <span>{new Date(bill.createdAt).toLocaleDateString('en-AE')}</span>
                      </span>
                      <span className="unpaid-age">
                        <span className={`chip ${tone}`}>{bill.daysOverdue}d overdue</span>
                      </span>
                      <span className="dl-num">{formatMoney(bill.amount)}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ))}
      </section>
    </div>
  );
}
