import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { counterHistoryAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconArrow, IconInbox, IconRefresh } from '../components/Icon';
import './CounterHistory.css';

interface CloseRow {
  closeId: number;
  closeNo: string | null;
  reportType: string;
  closeDate: string;
  counterNo: number;
  staffName: string | null;
  totalCash: number;
  totalCard: number;
  totalCredit: number;
  grossAmount: number;
  cashToBeCollected: number;
  collectedCash: number;
  cashDifference: number;
  billCount: number;
  startBillNo: number | null;
  endBillNo: number | null;
}

const isoDay = (date: Date) => date.toISOString().split('T')[0];

const daysAgo = (count: number) => {
  const date = new Date();
  date.setDate(date.getDate() - count);
  return isoDay(date);
};

/** Group closes under their calendar day, newest day first. */
const groupByDay = (rows: CloseRow[]) => {
  const buckets = new Map<string, CloseRow[]>();
  rows.forEach((row) => {
    const key = String(row.closeDate).split('T')[0];
    const bucket = buckets.get(key);
    if (bucket) bucket.push(row);
    else buckets.set(key, [row]);
  });
  return Array.from(buckets.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
};

const dayLabel = (key: string) => {
  const today = isoDay(new Date());
  if (key === today) return 'Today';
  if (key === daysAgo(1)) return 'Yesterday';
  return new Date(`${key}T00:00:00`).toLocaleDateString('en-AE', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
};

const timeOf = (value: string) =>
  new Date(value).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' });

export default function CounterHistory() {
  const [closes, setCloses] = useState<CloseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState(daysAgo(6));
  const [dateTo, setDateTo] = useState(isoDay(new Date()));

  /* Live: changing either date refetches, no Load button. */
  useEffect(() => {
    fetchHistory();
  }, [dateFrom, dateTo]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await counterHistoryAPI.getHistory(dateFrom, dateTo);
      setCloses(res.data.closes || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to load counter close history'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = groupByDay(closes);
  const totalGross = closes.reduce((sum, row) => sum + row.grossAmount, 0);
  const totalBills = closes.reduce((sum, row) => sum + row.billCount, 0);
  const offCount = closes.filter((row) => Math.abs(row.cashDifference) >= 0.01).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Settled shifts</p>
          <h1 className="page-title">Counter closes</h1>
          <p className="page-sub">
            Z reports already saved from the till. Tap a close to read the full report.
          </p>
        </div>
        <button
          type="button"
          className={`btn btn-quiet btn-icon${isLoading ? ' is-busy' : ''}`}
          onClick={fetchHistory}
          aria-label="Reload counter close history"
        >
          <IconRefresh />
        </button>
      </div>

      {error && (
        <div className="notice is-error" role="alert" style={{ marginBottom: 20 }}>
          <IconAlert />
          <span>{error}</span>
        </div>
      )}

      <div className="range">
        <div className="field">
          <label className="field-label" htmlFor="close-from">
            From
          </label>
          <input
            id="close-from"
            className="input"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="close-to">
            To
          </label>
          <input
            id="close-to"
            className="input"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="sk-rows" style={{ marginTop: 28 }}>
          <div className="sk sk-line is-sm" style={{ width: '30%' }} />
          {[0, 1, 2, 3].map((key) => (
            <div className="sk-row" key={key}>
              <div className="sk sk-line" style={{ width: '56%' }} />
              <div className="sk sk-line is-sm" />
              <div className="sk sk-line is-sm" style={{ gridColumn: '1 / -1', width: '68%' }} />
            </div>
          ))}
        </div>
      ) : closes.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <span className="empty-mark">
            <IconInbox />
          </span>
          <p className="empty-title">No closes saved in this range</p>
          <p className="empty-body">
            A row appears here once the till runs a Z report. X reports are live snapshots and are
            never written to the database.
          </p>
        </div>
      ) : (
        <>
          <section className="stat-rail" style={{ marginTop: 28 }} aria-label="Range totals">
            <div className="stat" style={{ '--i': 0 } as React.CSSProperties}>
              <p className="stat-label">Closes</p>
              <p className="stat-value">{closes.length}</p>
              <p className="stat-foot">Z reports saved</p>
            </div>
            <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
              <p className="stat-label">Gross settled</p>
              <p className="stat-value">{formatMoney(totalGross)}</p>
              <p className="stat-foot">{totalBills} bills</p>
            </div>
            <div
              className={`stat${offCount > 0 ? ' is-warn' : ' is-pos'}`}
              style={{ '--i': 2 } as React.CSSProperties}
            >
              <p className="stat-label">Cash off</p>
              <p className="stat-value">{offCount}</p>
              <p className="stat-foot">{offCount === 0 ? 'All balanced' : 'Drawers with variance'}</p>
            </div>
          </section>

          {grouped.map(([day, rows]) => {
            const dayGross = rows.reduce((sum, row) => sum + row.grossAmount, 0);
            return (
              <section className="section" key={day}>
                <div className="section-head">
                  <h2 className="section-title">{dayLabel(day)}</h2>
                  <span className="section-note">{formatMoney(dayGross)}</span>
                </div>

                <ul className="closes">
                  {rows.map((row, index) => {
                    const off = Math.abs(row.cashDifference) >= 0.01;
                    const short = row.cashDifference < 0;
                    return (
                      <li key={row.closeId} style={{ '--i': index } as React.CSSProperties}>
                        <Link to={`/counter-closes/${row.closeId}`} className="close-row">
                          <span className="close-body">
                            <span className="close-head">
                              <span className="close-no mono">
                                {row.closeNo || `#${row.closeId}`}
                              </span>
                              <span className={`chip ${row.reportType === 'Z' ? 'is-accent' : ''}`}>
                                {row.reportType} report
                              </span>
                            </span>

                            <span className="close-figure mono">{formatMoney(row.grossAmount)}</span>

                            <span className="close-meta">
                              <span>{row.staffName || 'Unassigned'}</span>
                              <span className="sep" />
                              <span>{timeOf(row.closeDate)}</span>
                              <span className="sep" />
                              <span>Counter {row.counterNo}</span>
                              <span className="sep" />
                              <span>
                                {row.billCount} {row.billCount === 1 ? 'bill' : 'bills'}
                              </span>
                            </span>

                            <span className="close-tags">
                              <span className={`chip ${off ? (short ? 'is-neg' : 'is-gold') : 'is-pos'}`}>
                                {off
                                  ? `${short ? 'Short' : 'Over'} ${formatMoney(
                                      Math.abs(row.cashDifference)
                                    )}`
                                  : 'Balanced'}
                              </span>
                            </span>
                          </span>
                          <IconArrow />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
