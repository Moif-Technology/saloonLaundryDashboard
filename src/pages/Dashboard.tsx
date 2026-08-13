import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { counterCloseAPI, dailySalesAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import {
  IconAlert,
  IconArrow,
  IconLedger,
  IconRefresh,
  IconStaff,
  IconStock,
  IconVault,
} from '../components/Icon';
import './Dashboard.css';

interface DashboardStats {
  todayRevenue: number;
  totalTransactions: number;
  pendingBills: number;
  averageTransaction: number;
}

/* Display-only: lifts the currency code out so the figure can carry the weight. */
const splitMoney = (value: number) => {
  const parts = formatMoney(value).split(' ');
  return { code: parts[0], figure: parts.slice(1).join(' ') };
};

const SHORTCUTS = [
  { to: '/counter-closes', label: 'Counter closes', note: 'Saved Z reports, day by day', icon: IconVault },
  { to: '/inventory', label: 'Check stock', note: 'Reorder levels and warnings', icon: IconStock },
  { to: '/staff-performance', label: 'Staff numbers', note: 'Revenue and tickets per person', icon: IconStaff },
  { to: '/customer-ledger', label: 'Credit exposure', note: 'Outstanding customer balances', icon: IconLedger },
];

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

  if (isLoading) {
    return (
      <div className="page">
        <div className="sk-stack" style={{ maxWidth: 320 }}>
          <div className="sk sk-line is-sm" style={{ width: '38%' }} />
          <div className="sk sk-line is-lg" style={{ height: 52, width: '80%' }} />
          <div className="sk sk-line is-sm" style={{ width: '52%' }} />
        </div>
        <div className="stat-rail" style={{ marginTop: 32 }}>
          {[0, 1, 2].map((key) => (
            <div className="stat" key={key}>
              <div className="sk sk-line is-sm" style={{ width: '64%' }} />
              <div className="sk sk-line" style={{ marginTop: 12, width: '78%', height: 20 }} />
            </div>
          ))}
        </div>
        <div className="sk-rows">
          {[0, 1, 2, 3].map((key) => (
            <div className="sk-row" key={key}>
              <div className="sk sk-line" style={{ width: '58%' }} />
              <div className="sk sk-line is-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  const revenue = splitMoney(stats.todayRevenue);

  const isEmptyToday =
    !error && stats.totalTransactions === 0 && stats.todayRevenue === 0;
  
  return (

    <div className="page">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Today</p>
          <h1 className="page-title">Counter overview</h1>
        </div>
        <button
          type="button"
          className="btn btn-quiet btn-icon"
          onClick={fetchDashboardData}
          aria-label="Refresh counter data"
        >
          <IconRefresh />
        </button>
      </div>

      {error && (
        <div className="notice is-error" role="alert" style={{ marginBottom: 24 }}>
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      {/* Headline figure carries the page — deliberately unboxed. */}
      <section className="headline">
        <p className="headline-label">
          <span className="dot is-live" style={{ color: 'var(--accent)' }} />
          Revenue booked today
        </p>
        <p className="headline-figure">
          <span className="headline-code">{revenue.code}</span>
          {revenue.figure}
        </p>
        {isEmptyToday && (
  <Link
    to="/daily-sales"
    className="btn btn-primary"
    style={{ marginTop: 16, display: 'inline-flex' }}
  >
    New Sale
  </Link>
)}
      </section>

      <section className="stat-rail" aria-label="Today at a glance">
        <div className="stat" style={{ '--i': 0 } as React.CSSProperties}>
          <p className="stat-label">Tickets</p>
          <p className="stat-value">{stats.totalTransactions}</p>
          <p className="stat-foot">{isEmptyToday ? 'Waiting on first sale' : 'Closed sales'}</p>
        </div>
        <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
          <p className="stat-label">Average sale</p>
          <p className="stat-value">{formatMoney(stats.averageTransaction)}</p>
          <p className="stat-foot">{isEmptyToday ? 'Shows after first ticket' : 'Per ticket'}</p>
        </div>
        <div
          className={`stat${stats.pendingBills > 0 ? ' is-warn' : ''}`}
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <p className="stat-label">Pending bills</p>
          <p className="stat-value">{stats.pendingBills}</p>
          <p className="stat-foot">{isEmptyToday ? 'None yet' : 'Credit sales open'}</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Next actions</h2>
        </div>
        <div className="shortcuts">
          {SHORTCUTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="shortcut"
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="shortcut-icon">
                  <Icon size={19} />
                </span>
                <span className="shortcut-text">
                  <strong>{item.label}</strong>
                  <em>{item.note}</em>
                </span>
                <IconArrow />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
