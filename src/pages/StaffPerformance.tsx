import { useEffect, useState } from 'react';
import { staffAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconInbox, IconStar } from '../components/Icon';
import './StaffPerformance.css';
import { useRefreshHandler } from '../lib/pullToRefresh';

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

  /* Live: any change to the range refetches, no Load button to press. */
  useEffect(() => {
    fetchStaffData();
  }, [dateFrom, dateTo]);

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

  useRefreshHandler(fetchStaffData);

  /* Display-only: bar length is relative to the strongest performer. */
  const top = Math.max(1, ...staff.map((member) => member.totalRevenue || 0));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">People</p>
          <h1 className="page-title">Staff performance</h1>
          <p className="page-sub">Revenue, ticket count and tips per staff member for the range.</p>
        </div>
      </div>

      {error && (
        <div className="notice is-error" role="alert" style={{ marginBottom: 20 }}>
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      <div className="range">
        <div className="field">
          <label className="field-label" htmlFor="staff-from">
            From
          </label>
          <input
            id="staff-from"
            className="input"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="staff-to">
            To
          </label>
          <input
            id="staff-to"
            className="input"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
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
  );
}
