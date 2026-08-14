import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { counterCloseAPI, dailySalesAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { authAPI } from '../lib/auth';
import {
  IconAlert,
  IconArrow,
  IconLedger,
  IconStaff,
  IconClock,
  IconRefresh,
  IconStock,
  IconTrend,
  IconVault,
} from '../components/Icon';
import './Dashboard.css';

interface DashboardStats {
  todayRevenue: number;
  totalTransactions: number;
  pendingBills: number;
  averageTransaction: number;
  paymentMethods: { method: string; amount: number }[];
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
    paymentMethods: [],
  });
  const [isLoading, setIsLoading] = useState(true);
const [initialLoadDone, setInitialLoadDone] = useState(false);
const [error, setError] = useState('');
const [toastExiting, setToastExiting] = useState(false);
const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const dismissToast = () => {
  if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
  setToastExiting(true);
  dismissTimerRef.current = setTimeout(() => {
    setError('');
    setToastExiting(false);
    dismissTimerRef.current = null;
  }, 300);
};
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [rangeOpen, setRangeOpen] = useState(false);
const rangeRef = useRef<HTMLDivElement>(null);

const formatDashDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const rangeLabel =
  dateFrom === dateTo && dateFrom === today
    ? `Today: ${formatDashDate(dateFrom)}`
    : dateFrom === dateTo
      ? formatDashDate(dateFrom)
      : `${formatDashDate(dateFrom)} – ${formatDashDate(dateTo)}`;

  useEffect(() => {
    fetchDashboardData();
  }, [dateFrom, dateTo]);
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);
 
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setToastExiting(false);
      const [salesRes, billsRes, paymentRes] = await Promise.all([
        dailySalesAPI.getSales(dateFrom, dateTo),
        counterCloseAPI.getPendingBills(),
        dailySalesAPI.getSalesByPaymentMethod(dateFrom, dateTo),
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
        paymentMethods: paymentRes.data.methods || [],
      });
      dismissToast();
    } catch (err: any) {
      setToastExiting(false);
      setError('Unable to sync live data.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setInitialLoadDone(true);
    }
  };
  useEffect(() => {
    if (!rangeOpen) return;
    const close = (e: MouseEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) {
        setRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [rangeOpen]);

  if (isLoading && !initialLoadDone) {
    return (
      <div className="page">
        <div className="sk-stack" style={{ maxWidth: 320 }}>
          <div className="sk sk-line is-sm" style={{ width: '38%' }} />
          <div className="sk sk-line is-lg" style={{ height: 52, width: '80%' }} />
          <div className="sk sk-line is-sm" style={{ width: '52%' }} />
        </div>
        <div className="dash-metrics" style={{ marginTop: 32 }}>
          {[0, 1, 2].map((key) => (
            <div className="dash-metric-card stat" key={key}>
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
  const paymentAmount = (...aliases: string[]) =>
    stats.paymentMethods
      .filter((item) =>
        aliases.some((alias) => item.method.toLowerCase() === alias.toLowerCase())
      )
      .reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const cashAmount = paymentAmount('cash');
  const cardAmount = paymentAmount('card');
  const onlineAmount = paymentAmount('online', 'credit');
  const isEmptyToday =
    !error && stats.totalTransactions === 0 && stats.todayRevenue === 0;
  
  return (

    <div className="page">
<div className="page-head">
<div className="page-head-intro">
  <h1 className="page-head-greeting">
    {(() => {
      const now = new Date();
      const hours = now.getHours();
      const greeting =
        hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
      const name = authAPI.getCurrentUser()?.name?.split(' ')[0] || 'there';
      const date = now.toLocaleDateString('en-AE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
      const time = now.toLocaleTimeString('en-AE', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${greeting}, ${name} · ${date} · ${time}`;
    })()}
    </h1>
    {error && (
    <div
      className={`dash-toast is-error${toastExiting ? ' is-exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <IconAlert size={16} />
      <span className="dash-toast-text">
        {isLoading ? 'Syncing…' : error}
      </span>
      {!isLoading && (
        <button
          type="button"
          className="dash-toast-action"
          onClick={fetchDashboardData}
        >
          Try Again
        </button>
      )}
    </div>
  )}
</div>

<div className="page-head-actions">
<div className="dash-date-range" ref={rangeRef}>
  <button
    type="button"
    className="btn btn-quiet dash-date-trigger"
    aria-expanded={rangeOpen}
    aria-haspopup="dialog"
    onClick={() => setRangeOpen((open) => !open)}
  >
    <IconClock size={16} />
    <span>{rangeLabel}</span>
    <span className="dash-date-chevron" aria-hidden="true">▾</span>
  </button>
  {rangeOpen && (
    <div className="dash-date-panel" role="dialog" aria-label="Date range">
      <label className="dash-date-field">
        <span>From</span>
        <input
          className="input"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
      </label>
      <label className="dash-date-field">
        <span>To</span>
        <input
          className="input"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </label>
    </div>
   )}
   </div>
   <Link to="/daily-sales" className="btn btn-primary">
  + New Sale
</Link>
<button
  type="button"
  className={`btn btn-primary${isLoading ? ' is-busy' : ''}`}
  onClick={fetchDashboardData}
  disabled={isLoading}
  aria-label="Refresh dashboard"
>
  <IconRefresh size={16} />
  Refresh
</button>
   </div>
</div>



<section className="dash-revenue-card" aria-label="Counter overview">
<h2 className="dash-revenue-card-title">Counter overview</h2>
  <div className="dash-revenue-card-body">
    <div className="dash-revenue-card-main">
      <div className="headline">
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
      </div>
    </div>
    <aside className="dash-revenue-card-aside" aria-label="Payment breakdown">
  <p className="dash-pay-title">By payment method</p>
  <ul className="dash-pay-list">
    <li className="dash-pay-row">
      <span className="dash-pay-label">Cash</span>
      <span className="dash-pay-value">{formatMoney(cashAmount)}</span>
    </li>
    <li className="dash-pay-row">
      <span className="dash-pay-label">Card</span>
      <span className="dash-pay-value">{formatMoney(cardAmount)}</span>
    </li>
    <li className="dash-pay-row">
      <span className="dash-pay-label">Online</span>
      <span className="dash-pay-value">{formatMoney(onlineAmount)}</span>
    </li>
  </ul>
</aside>
  </div>
</section>

<section className="dash-metrics" aria-label="Today at a glance">
<div className="dash-metric-card stat" style={{ '--i': 0 } as React.CSSProperties}>
<span className="dash-metric-icon" aria-hidden="true">
    <IconLedger size={16} />
  </span>
          <p className="stat-label">Tickets</p>
          <p className="stat-value">{stats.totalTransactions}</p>
          <p className="stat-foot">{isEmptyToday ? 'Waiting on first sale' : 'Closed sales'}</p>
        </div>
        <div className="dash-metric-card stat" style={{ '--i': 1 } as React.CSSProperties}>
        <span className="dash-metric-icon" aria-hidden="true">
    <IconTrend size={16} />
  </span>
          <p className="stat-label">Average sale</p>
          <p className="stat-value is-tight">{formatMoney(stats.averageTransaction)}</p>
          <p className="stat-foot">{isEmptyToday ? 'Shows after first ticket' : 'Per ticket'}</p>
        </div>
        <div
  className={`dash-metric-card stat${stats.pendingBills > 0 ? ' is-warn' : ''}`}
          style={{ '--i': 2 } as React.CSSProperties}
        >
           <span className="dash-metric-icon" aria-hidden="true">
    <IconVault size={16} />
  </span>
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
