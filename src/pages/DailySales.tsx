import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { dailySalesAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconClock, IconInbox, IconRefresh } from '../components/Icon';
import './DailySales.css';
import './Dashboard.css';

interface SalesData {
  totalRevenue: number;
  transactionCount: number;
  avgTransaction: number;
  byProduct: Array<{ product: string; revenue: number; count: number }>;
  byPaymentMethod: Array<{ method: string; amount: number }>;
}

export default function DailySales() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

/* Live: any change to the range refetches, no Load button to press. */
useEffect(() => {
  fetchSalesData();
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
  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      setToastExiting(false);
      const [salesRes, productRes, paymentRes] = await Promise.all([
        dailySalesAPI.getSales(dateFrom, dateTo),
        dailySalesAPI.getSalesByProduct(dateFrom, dateTo),
        dailySalesAPI.getSalesByPaymentMethod(dateFrom, dateTo),
      ]);

      setSalesData({
        totalRevenue: salesRes.data.totalRevenue || 0,
        transactionCount: salesRes.data.transactionCount || 0,
        avgTransaction: (salesRes.data.totalRevenue || 0) / (salesRes.data.transactionCount || 1),
        byProduct: productRes.data.products || [],
        byPaymentMethod: paymentRes.data.methods || [],
      });
      dismissToast();
    } catch (err: any) {
      setToastExiting(false);
      setError('Failed to load sales data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* Display-only ratios for the share meters. */
  const topProduct = Math.max(1, ...(salesData?.byProduct.map((item) => item.revenue) ?? [0]));
  const paymentTotal = Math.max(
    1,
    (salesData?.byPaymentMethod ?? []).reduce((sum, item) => sum + (item.amount || 0), 0)
  );

  return (
    <>
    <div className="page">
      <div className="page-head">
  <div className="page-head-intro">
    <p className="page-eyebrow">Reporting</p>
    <h1 className="page-title">Daily sales</h1>
    <p className="page-sub">Where the money came from, by service line and tender type.</p>
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
      onClick={fetchSalesData}
      disabled={isLoading}
      aria-label="Refresh sales data"
    >
      <IconRefresh size={16} />
      Refresh
    </button>
  </div>
</div>



      
      {isLoading ? (
        <div className="sk-rows" style={{ marginTop: 28 }}>
          <div className="sk sk-line is-lg" style={{ width: '62%' }} />
          {[0, 1, 2, 3, 4].map((key) => (
            <div className="sk-row" key={key}>
              <div className="sk sk-line" style={{ width: '54%' }} />
              <div className="sk sk-line is-sm" />
            </div>
          ))}
        </div>
      ) : (
        salesData && (
          <>
            <section className="stat-rail" style={{ marginTop: 28 }} aria-label="Range totals">
              <div className="stat" style={{ '--i': 0 } as React.CSSProperties}>
                <p className="stat-label">Revenue</p>
                <p className="stat-value">{formatMoney(salesData.totalRevenue)}</p>
              </div>
              <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
                <p className="stat-label">Tickets</p>
                <p className="stat-value">{salesData.transactionCount}</p>
              </div>
              <div className="stat" style={{ '--i': 2 } as React.CSSProperties}>
                <p className="stat-label">Average sale</p>
                <p className="stat-value">{formatMoney(salesData.avgTransaction)}</p>
              </div>
            </section>

            <section className="section">
              <div className="section-head">
                <h2 className="section-title">By service</h2>
                <span className="section-note">{salesData.byProduct.length} lines</span>
              </div>

              {salesData.byProduct.length === 0 ? (
                <div className="empty">
                  <span className="empty-mark">
                    <IconInbox />
                  </span>
                  <p className="empty-title">No sales in this range</p>
                  <p className="empty-body">
                    Widen the dates, or check that the counter was open on these days.
                  </p>
                </div>
              ) : (
                <ul className="dl">
                  {salesData.byProduct.map((item, index) => (
                    <li
                      className="dl-row product-row"
                      key={item.product}
                      style={{ '--i': index } as React.CSSProperties}
                    >
                      <span className="dl-primary">{item.product}</span>
                      <span className="dl-num">{formatMoney(item.revenue)}</span>
                      <span className="dl-meta">
                        {item.count} {item.count === 1 ? 'sale' : 'sales'}
                      </span>
                      <span className="product-meter">
                        <span className="meter">
                          <span
                            className="meter-fill"
                            style={
                              {
                                width: `${Math.max(4, (item.revenue / topProduct) * 100)}%`,
                                '--i': index,
                              } as React.CSSProperties
                            }
                          />
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="section">
              <div className="section-head">
                <h2 className="section-title">By tender</h2>
                <span className="section-note">Share of takings</span>
              </div>

              {salesData.byPaymentMethod.length === 0 ? (
                <div className="empty">
                  <span className="empty-mark">
                    <IconInbox />
                  </span>
                  <p className="empty-title">No tender breakdown yet</p>
                  <p className="empty-body">
                    Payment splits appear once tickets are settled in this range.
                  </p>
                </div>
              ) : (
                <ul className="tender">
                  {salesData.byPaymentMethod.map((item, index) => {
                    const share = ((item.amount || 0) / paymentTotal) * 100;
                    return (
                      <li
                        className="tender-row"
                        key={item.method}
                        style={{ '--i': index } as React.CSSProperties}
                      >
                        <span className="tender-head">
                          <span className="tender-name">{item.method}</span>
                          <span className="dl-num">{formatMoney(item.amount)}</span>
                        </span>
                        <span className="meter">
                          <span
                            className={`meter-fill${index % 2 === 1 ? ' is-gold' : ''}`}
                            style={
                              {
                                width: `${Math.max(3, share)}%`,
                                '--i': index,
                              } as React.CSSProperties
                            }
                          />
                        </span>
                        <span className="tender-share mono">{share.toFixed(1)}%</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )
      )}
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
                onClick={fetchSalesData}
              >
                Try Again
              </button>
            )}
          </div>,
          document.body
        )}
      </>
    );
  }
