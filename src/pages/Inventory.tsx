import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { inventoryAPI } from '../lib/api';
import { IconAlert, IconCheck, IconInbox, IconRefresh } from '../components/Icon';
import './Inventory.css';
import './Dashboard.css';
interface StockItem {
  itemId: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  reorderLevel: number;
  unit: string;
  status: 'ok' | 'low' | 'critical';
}

export default function Inventory() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'critical'>('all');
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
  useEffect(() => {
    fetchInventory();
  }, []);
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setToastExiting(false);
      const res = await inventoryAPI.getStockLevels();
      setItems(res.data.items || []);
      dismissToast();
    } catch (err: any) {
      setToastExiting(false);
      setError('Unable to load inventory data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'var(--pos)';
      case 'low':
        return 'var(--gold)';
      case 'critical':
        return 'var(--neg)';
      default:
        return 'var(--ink-3)';
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (isLoading) {
    return (
      <>
        <div className="page">
          ...
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
                  onClick={fetchInventory}
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

  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'critical').length;
  const criticalCount = items.filter((i) => i.status === 'critical').length;
  const okCount = items.filter((i) => i.status === 'ok').length;

  const FILTERS: Array<{ key: 'all' | 'low' | 'critical'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'low', label: 'Low', count: items.filter((i) => i.status === 'low').length },
    { key: 'critical', label: 'Critical', count: criticalCount },
  ];

  return (
    <>
    <div className="page">
      <div className="page-head">
  <div className="page-head-intro">
    <p className="page-eyebrow">Stock room</p>
    <h1 className="page-title">Inventory</h1>
    <p className="page-sub">Levels against reorder points, worst offenders first.</p>
  </div>

  <div className="page-head-actions">
    <button
      type="button"
      className={`btn btn-primary${isLoading ? ' is-busy' : ''}`}
      onClick={fetchInventory}
      disabled={isLoading}
      aria-label="Refresh inventory"
    >
      <IconRefresh size={16} />
      Refresh
    </button>
  </div>
</div>


      {criticalCount > 0 && (
        <div className="notice is-warn" style={{ marginBottom: 20 }}>
          <IconAlert />
          <span>
            {criticalCount} {criticalCount === 1 ? 'item is' : 'items are'} below the critical line —
            reorder before the next shift.
          </span>
        </div>
      )}

<section className="dash-metrics" aria-label="Stock summary">
  <div className="dash-metric-card stat" style={{ '--i': 0 } as React.CSSProperties}>
    <span className="dash-metric-icon" aria-hidden="true">
      <IconInbox size={16} />
    </span>
    <p className="stat-label">Tracked</p>
    <p className="stat-value">{items.length}</p>
    <p className="stat-foot">Items on file</p>
  </div>
  <div className="dash-metric-card stat" style={{ '--i': 1 } as React.CSSProperties}>
    <span className="dash-metric-icon" aria-hidden="true">
      <IconCheck size={16} />
    </span>
    <p className="stat-label">Healthy</p>
    <p className="stat-value">{okCount}</p>
    <p className="stat-foot">Above reorder</p>
  </div>
  <div
    className={`dash-metric-card stat${lowStockCount > 0 ? ' is-warn' : ''}`}
    style={{ '--i': 2 } as React.CSSProperties}
  >
    <span className="dash-metric-icon" aria-hidden="true">
      <IconAlert size={16} />
    </span>
    <p className="stat-label">Needs order</p>
    <p className="stat-value">{lowStockCount}</p>
    <p className="stat-foot">Low or critical</p>
  </div>
</section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Stock levels</h2>
          <span className="section-note">{filteredItems.length} shown</span>
        </div>

        <div className="segmented" role="tablist" aria-label="Filter stock">
          {FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={filter === option.key}
              className="segment"
              onClick={() => setFilter(option.key)}
            >
              {option.label}
              <span className="segment-count">{option.count}</span>
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty">
            <span className="empty-mark">
              {filter === 'all' ? <IconInbox /> : <IconCheck size={20} />}
            </span>
            <p className="empty-title">
              {filter === 'all' ? 'No stock records yet' : `Nothing in the ${filter} band`}
            </p>
            <p className="empty-body">
              {filter === 'all'
                ? 'Add items to the ERP stock master and levels will show up here.'
                : 'Every tracked item is sitting above this threshold right now.'}
            </p>
          </div>
        ) : (
          <ul className="stock">
            {filteredItems.map((item, index) => {
              const target = Math.max(item.minimumStock || 0, item.reorderLevel || 0, 1);
              const fill = Math.min(100, Math.max(3, ((item.currentStock || 0) / target) * 100));
              return (
                <li
                  className="stock-row"
                  key={item.itemId}
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <span className="stock-head">
                    <span className="stock-name">{item.name}</span>
                    <span className="stock-level mono">
                      {item.currentStock}
                      <em>{item.unit}</em>
                    </span>
                  </span>

                  <span className="meter">
                    <span
                      className="meter-fill"
                      style={
                        {
                          width: `${fill}%`,
                          background: getStatusColor(item.status),
                          '--i': index,
                        } as React.CSSProperties
                      }
                    />
                  </span>

                  <span className="stock-meta">
                    <span className={`status status-${item.status}`}>
                      <span className="dot" style={{ background: getStatusColor(item.status) }} />
                      {item.status}
                    </span>
                    <span className="sep" />
                    <span className="mono">{item.sku}</span>
                    <span className="sep" />
                    <span>
                      min {item.minimumStock} {item.unit}
                    </span>
                  </span>
                </li>
              );
            })}
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
              onClick={fetchInventory}
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
