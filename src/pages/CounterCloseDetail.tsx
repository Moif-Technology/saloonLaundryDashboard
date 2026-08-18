import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { counterHistoryAPI } from '../lib/api';
import { formatMoney } from '../lib/format';
import { IconAlert, IconArrow, IconInbox } from '../components/Icon';
import './CounterHistory.css';
import { useRefreshHandler } from '../lib/pullToRefresh';

interface StaffSale {
  staffId: number | null;
  staffName: string;
  billCount: number;
  saleAmount: number;
  refundAmount: number;
  cashAmount: number;
  cardAmount: number;
  creditAmount: number;
}

interface CashMove {
  id: number;
  transactionType: string;
  amount: number;
  remarks: string | null;
  createdAt: string;
}

interface CloseDetail {
  closeId: number;
  closeNo: string | null;
  reportType: string;
  closeDate: string;
  counterNo: number;
  staffName: string | null;
  totalCash: number;
  totalCredit: number;
  totalCard: number;
  totalDiscount: number;
  totalRefund: number;
  totalRoundOff: number;
  totalTax: number;
  grossAmount: number;
  cashIn: number;
  cashOut: number;
  cashToBeCollected: number;
  collectedCash: number;
  cashDifference: number;
  billCount: number;
  startBillNo: number | null;
  endBillNo: number | null;
  creditReceiptCash: number;
  creditReceiptCard: number;
  creditReceiptCount: number;
  staffSales: StaffSale[];
  cashInOutList: CashMove[];
}

export default function CounterCloseDetail() {
  const { closeId } = useParams<{ closeId: string }>();
  const [record, setRecord] = useState<CloseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [closeId]);

  const fetchDetail = async () => {
    if (!closeId) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await counterHistoryAPI.getCloseDetail(closeId);
      setRecord(res.data as CloseDetail);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load this counter close');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useRefreshHandler(fetchDetail);

  if (isLoading) {
    return (
      <div className="page">
        <div className="sk-stack" style={{ maxWidth: 300 }}>
          <div className="sk sk-line is-sm" style={{ width: '32%' }} />
          <div className="sk sk-line is-lg" style={{ width: '66%' }} />
        </div>
        <div className="stat-rail" style={{ marginTop: 28 }}>
          {[0, 1, 2, 3, 4, 5].map((key) => (
            <div className="stat" key={key}>
              <div className="sk sk-line is-sm" style={{ width: '62%' }} />
              <div className="sk sk-line" style={{ marginTop: 12, width: '78%', height: 20 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="page">
        <Link to="/counter-closes" className="back-link">
          <IconArrow className="is-flipped" />
          All closes
        </Link>
        <div className="notice is-error" role="alert" style={{ marginTop: 20 }}>
          <IconAlert />
          <span>{error || 'Counter close record not found'}</span>
        </div>
      </div>
    );
  }

  const off = Math.abs(record.cashDifference) >= 0.01;
  const short = record.cashDifference < 0;
  const netCash = record.totalCash + record.cashIn - record.cashOut;

  return (
    <div className="page">
      <Link to="/counter-closes" className="back-link">
        <IconArrow className="is-flipped" />
        All closes
      </Link>

      <div className="page-head" style={{ marginTop: 12 }}>
        <div>
          <p className="page-eyebrow">{record.reportType} report · Counter {record.counterNo}</p>
          <h1 className="page-title mono">{record.closeNo || `#${record.closeId}`}</h1>
          <p className="page-sub">
            Closed by {record.staffName || 'unassigned staff'} on{' '}
            {new Date(record.closeDate).toLocaleString('en-AE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Drawer verdict leads — it is the only number a manager checks first. */}
      <section
        className={`verdict${off ? (short ? ' is-short' : ' is-over') : ' is-exact'}`}
        style={{ marginTop: 8 }}
      >
        <p className="verdict-label">
          {off ? (short ? 'Drawer came up short' : 'Drawer came up over') : 'Drawer balanced'}
        </p>
        <p className="verdict-figure">{formatMoney(Math.abs(record.cashDifference))}</p>
        <p className="verdict-note">
          {formatMoney(record.collectedCash)} counted against{' '}
          {formatMoney(record.cashToBeCollected)} expected
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Takings</h2>
          <span className="section-note">
            {record.billCount} {record.billCount === 1 ? 'bill' : 'bills'}
          </span>
        </div>
        <div className="stat-rail is-wide">
          <div className="stat" style={{ '--i': 0 } as React.CSSProperties}>
            <p className="stat-label">Gross</p>
            <p className="stat-value">{formatMoney(record.grossAmount)}</p>
          </div>
          <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
            <p className="stat-label">Cash</p>
            <p className="stat-value">{formatMoney(record.totalCash)}</p>
          </div>
          <div className="stat" style={{ '--i': 2 } as React.CSSProperties}>
            <p className="stat-label">Card</p>
            <p className="stat-value">{formatMoney(record.totalCard)}</p>
          </div>
          <div className="stat" style={{ '--i': 3 } as React.CSSProperties}>
            <p className="stat-label">Credit</p>
            <p className="stat-value">{formatMoney(record.totalCredit)}</p>
          </div>
          <div className="stat" style={{ '--i': 4 } as React.CSSProperties}>
            <p className="stat-label">Discount</p>
            <p className="stat-value">{formatMoney(record.totalDiscount)}</p>
          </div>
          <div className="stat" style={{ '--i': 5 } as React.CSSProperties}>
            <p className="stat-label">Refunds</p>
            <p className="stat-value">{formatMoney(record.totalRefund)}</p>
          </div>
          <div className="stat" style={{ '--i': 6 } as React.CSSProperties}>
            <p className="stat-label">Tax</p>
            <p className="stat-value">{formatMoney(record.totalTax)}</p>
          </div>
          <div className="stat" style={{ '--i': 7 } as React.CSSProperties}>
            <p className="stat-label">Round off</p>
            <p className="stat-value">{formatMoney(record.totalRoundOff)}</p>
          </div>
          <div className="stat" style={{ '--i': 8 } as React.CSSProperties}>
            <p className="stat-label">Bill range</p>
            <p className="stat-value is-tight mono">
              {record.startBillNo ?? '—'} – {record.endBillNo ?? '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Cash trail</h2>
          <span className="section-note">Net {formatMoney(netCash)}</span>
        </div>
        <ul className="dl">
          {[
            { label: 'Cash sales', value: record.totalCash },
            { label: 'Cash in', value: record.cashIn },
            { label: 'Cash out', value: -record.cashOut },
            { label: 'Credit receipts (cash)', value: record.creditReceiptCash },
            { label: 'Expected in drawer', value: record.cashToBeCollected },
            { label: 'Counted', value: record.collectedCash },
          ].map((line, index) => (
            <li
              className="dl-row trail-row"
              key={line.label}
              style={{ '--i': index } as React.CSSProperties}
            >
              <span className="dl-primary">{line.label}</span>
              <span className="dl-num">{formatMoney(line.value)}</span>
            </li>
          ))}
        </ul>
      </section>

      {record.creditReceiptCount > 0 && (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Credit receipts</h2>
            <span className="section-note">{record.creditReceiptCount} collected</span>
          </div>
          <div className="stat-rail">
            <div className="stat" style={{ '--i': 0 } as React.CSSProperties}>
              <p className="stat-label">By cash</p>
              <p className="stat-value">{formatMoney(record.creditReceiptCash)}</p>
            </div>
            <div className="stat" style={{ '--i': 1 } as React.CSSProperties}>
              <p className="stat-label">By card</p>
              <p className="stat-value">{formatMoney(record.creditReceiptCard)}</p>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">By staff</h2>
          <span className="section-note">{record.staffSales.length} on shift</span>
        </div>

        {record.staffSales.length === 0 ? (
          <div className="empty">
            <span className="empty-mark">
              <IconInbox />
            </span>
            <p className="empty-title">No staff split recorded</p>
            <p className="empty-body">
              Bills in this close were not attributed to individual staff at the till.
            </p>
          </div>
        ) : (
          <ul className="dl">
            {record.staffSales.map((staff, index) => (
              <li
                className="dl-row staff-row"
                key={`${staff.staffId ?? staff.staffName}-${index}`}
                style={{ '--i': index } as React.CSSProperties}
              >
                <span className="dl-primary">{staff.staffName}</span>
                <span className="dl-num">{formatMoney(staff.saleAmount)}</span>
                <span className="dl-meta">
                  <span>
                    {staff.billCount} {staff.billCount === 1 ? 'bill' : 'bills'}
                  </span>
                  <span className="sep" />
                  <span>{formatMoney(staff.cashAmount)} cash</span>
                  <span className="sep" />
                  <span>{formatMoney(staff.cardAmount)} card</span>
                  {staff.creditAmount > 0 && (
                    <>
                      <span className="sep" />
                      <span>{formatMoney(staff.creditAmount)} credit</span>
                    </>
                  )}
                  {staff.refundAmount > 0 && (
                    <>
                      <span className="sep" />
                      <span>{formatMoney(staff.refundAmount)} refunded</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Cash in / out</h2>
          <span className="section-note">{record.cashInOutList.length} movements</span>
        </div>

        {record.cashInOutList.length === 0 ? (
          <div className="empty">
            <span className="empty-mark">
              <IconInbox />
            </span>
            <p className="empty-title">No drawer movements</p>
            <p className="empty-body">
              Nothing was paid in or taken out of the till during this shift.
            </p>
          </div>
        ) : (
          <ul className="dl">
            {record.cashInOutList.map((move, index) => {
              const isOut = String(move.transactionType).toUpperCase().startsWith('OUT');
              return (
                <li
                  className="dl-row move-row"
                  key={move.id}
                  style={{ '--i': index } as React.CSSProperties}
                >
                  <span className="dl-primary">{move.remarks || (isOut ? 'Cash out' : 'Cash in')}</span>
                  <span className={`dl-num ${isOut ? 'is-neg' : 'is-pos'}`}>
                    {isOut ? '−' : '+'}
                    {formatMoney(move.amount)}
                  </span>
                  <span className="dl-meta">
                    <span className={`chip ${isOut ? 'is-neg' : 'is-pos'}`}>
                      {move.transactionType}
                    </span>
                    <span className="sep" />
                    <span>
                      {new Date(move.createdAt).toLocaleString('en-AE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
