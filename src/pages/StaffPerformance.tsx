import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { staffAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconClock, IconInbox, IconRefresh, IconStar } from '../components/Icon';
import './StaffPerformance.css';
import './Dashboard.css';

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
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const dismissToast = () => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setToastExiting(true);
    dismissTimerRef.current = setTimeout(() => {
      setError('');
      setToastExiting(false);
      dismissTimerRef.current = null;
    }, 300);
  };
  /* Live: any change to the range refetches, no Load button to press. */
  useEffect(() => {
    fetchStaffData();
  }, [dateFrom, dateTo]);
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);
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

  const fetchStaffData = async () => {
    try {
      setIsLoading(true);
      setToastExiting(false);
      const res = await staffAPI.getStaffPerformance(dateFrom, dateTo);
      setStaff(res.data.staff || []);
      dismissToast();
    } catch (err: any) {
      setToastExiting(false);
      setError('Unable to load staff performance data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* Display-only: bar length is relative to the strongest performer. */
  const top = Math.max(1, ...staff.map((member) => member.totalRevenue || 0));

  return (
    <>
    <div className="page">
    <div className="page-head">
  <div className="page-head-intro">
    <p className="page-eyebrow">People</p>
    <h1 className="page-title">Staff performance</h1>
    <p className="page-sub">Revenue, ticket count and tips per staff member for the range.</p>
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
  <button
    type="button"
    className={`btn btn-primary${isLoading ? ' is-busy' : ''}`}
    onClick={fetchStaffData}
    disabled={isLoading}
    aria-label="Refresh staff performance"
  >
    <IconRefresh size={16} />
    Refresh
  </button>
</div>
</div>

     

    

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Leaderboard</h2>
          <span className="section-note">
            {staff.length} {staff.length === 1 ? 'person' : 'people'}
          </span>
        </div>

        {isLoading ? (
          <div className="sk-rows">
            {[0, 1, 2, 3].map((key) => (
              <div className="sk-row" key={key}>
                <div className="sk sk-line" style={{ width: '48%' }} />
                <div className="sk sk-line is-sm" />
                <div className="sk sk-line is-sm" style={{ gridColumn: '1 / -1', width: '70%' }} />
              </div>
            ))}
          </div>
        ) : staff.length === 0 ? (
          <div className="empty">
            <span className="empty-mark">
              <IconInbox />
            </span>
            <p className="empty-title">No staff activity in this range</p>
            <p className="empty-body">
              Pick a wider date range, or confirm sales were attributed to staff at the till.
            </p>
          </div>
        ) : (
          <ul className="board">
            {staff.map((member, index) => (
              <li
                className="board-row"
                key={member.staffId}
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="board-rank mono">{String(index + 1).padStart(2, '0')}</span>

                <span className="board-body">
                  <span className="board-head">
                    <span className="board-name">{member.name}</span>
                    <span className={`chip ${member.performanceRating >= 4 ? 'is-gold' : ''}`}>
                      <IconStar />
                      {member.performanceRating.toFixed(1)}
                    </span>
                  </span>

                  <span className="board-figure mono">{formatMoney(member.totalRevenue)}</span>

                  <span className="meter">
                    <span
                      className="meter-fill"
                      style={
                        {
                          width: `${Math.max(4, ((member.totalRevenue || 0) / top) * 100)}%`,
                          '--i': index,
                        } as React.CSSProperties
                      }
                    />
                  </span>

                  <span className="board-meta">
                    <span>
                      {member.transactionCount}{' '}
                      {member.transactionCount === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <span className="sep" />
                    <span>{formatMoney(member.avgTransaction)} avg</span>
                    <span className="sep" />
                    <span>{formatMoney(member.totalTips)} tips</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>

{error &&
  createPortal(
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
          onClick={fetchStaffData}
        >
          Try Again
        </button>
      )}
    </div>,
    document.body
  )}
</>
);}
