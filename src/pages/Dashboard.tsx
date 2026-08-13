import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { counterCloseAPI, dailySalesAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import {
  IconAlert,
  IconArrow,
  IconLedger,
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
  { to: '/counter-closes', label: 'Review Z reports', note: 'Settled shifts and cash counts', icon: IconVault },
  { to: '/inventory', label: 'Check stock', note: 'Low stock and reorder alerts', icon: IconStock },
  { to: '/staff-performance', label: 'Staff performance', note: 'Tickets and revenue by person', icon: IconStaff },
  { to: '/customer-ledger', label: 'Collect credit bills', note: 'Outstanding customer balances', icon: IconLedger },
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
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

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
  const vsYesterdayPct: number | null = null;

  const isEmptyToday =
    !error && stats.totalTransactions === 0 && stats.todayRevenue === 0;
  
  return (

    <div className="page">
<div className="page-head">
  <div>
    <h1 className="page-title">
      {new Date().getHours() < 12
        ? 'Good morning'
        : new Date().getHours() < 17
          ? 'Good afternoon'
          : 'Good evening'}
    </h1>
    <p className="page-sub">
      {new Date().toLocaleDateString('en-AE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}
    </p>
  </div>
  <div className="page-head-actions">
  <div className="page-head-filter">
    <span className="field-label">Filter: Today</span>
    <div className="page-head-range">
      <div className="field">
        <label className="field-label" htmlFor="dash-date-from">
          From
        </label>
        <input
          id="dash-date-from"
          className="input"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="dash-date-to">
          To
        </label>
        <input
          id="dash-date-to"
          className="input"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
    </div>
  </div>
  <Link to="/daily-sales" className="btn btn-primary">
    + New Sale
  </Link>
  </div>
</div>

      {error && (
  <div className="notice is-error" role="alert" style={{ marginBottom: 24 }}>
    <IconAlert />
    <span>{error}</span>
  </div>
)}

<div className="dash-overview-head">
  <h2 className="page-title">Counter overview</h2>
</div>

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
{vsYesterdayPct == null ? (
  <p className="headline-compare is-muted">vs yesterday unavailable</p>
) : (
  <p
    className={`headline-compare${
      vsYesterdayPct >= 0 ? ' is-pos' : ' is-neg'
    }`}
  >
    {vsYesterdayPct >= 0 ? '↑' : '↓'}{' '}
    {vsYesterdayPct >= 0 ? '+' : ''}
    {vsYesterdayPct}% vs yesterday
  </p>
)}
<p className="headline-context">
  {stats.totalTransactions} ticket{stats.totalTransactions === 1 ? '' : 's'} today
  {' · '}
  {stats.pendingBills > 0
    ? `${stats.pendingBills} credit bill${stats.pendingBills === 1 ? '' : 's'} open`
    : 'No credit bills open'}
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
  <h2 className="section-title">Operational shortcuts</h2>
  </div>
        <div className="shortcuts">
        {SHORTCUTS.map((item, index) => {
  const Icon = item.icon;
  const attentionCount =
    item.to === '/customer-ledger' ? stats.pendingBills : 0;
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
  <strong>
    {item.label}
    {attentionCount > 0 && (
      <span className="shortcut-badge">{attentionCount}</span>
    )}
  </strong>
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
