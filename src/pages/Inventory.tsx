import { useEffect, useState } from 'react';
import { inventoryAPI } from '../lib/api';

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

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await inventoryAPI.getStockLevels();
      setItems(res.data.items || []);
    } catch (err: any) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return '#28a745';
      case 'low':
        return '#ffc107';
      case 'critical':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  if (isLoading) return <div className="loading-spinner"></div>;

  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'critical').length;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Stock levels and low stock alerts</p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="grid" style={{ marginBottom: '20px' }}>
        <div className="card">
          <div className="card-title">Total Items</div>
          <div className="card-value">{items.length}</div>
        </div>
        <div className="card">
          <div className="card-title">In Stock</div>
          <div className="card-value">{items.filter((i) => i.status === 'ok').length}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ffc107' }}>
          <div className="card-title">Low Stock</div>
          <div className="card-value">{lowStockCount}</div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Items
          </button>
          <button
            className={`btn ${filter === 'low' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('low')}
          >
            Low Stock
          </button>
          <button
            className={`btn ${filter === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('critical')}
          >
            Critical
          </button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>SKU</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Current Stock</th>
              <th style={{ textAlign: 'right', padding: '12px', fontWeight: '600' }}>Min Level</th>
              <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.itemId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.name}</td>
                <td style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#666' }}>
                  {item.sku}
                </td>
                <td style={{ textAlign: 'right', padding: '12px' }}>
                  {item.currentStock} {item.unit}
                </td>
                <td style={{ textAlign: 'right', padding: '12px', color: '#666' }}>
                  {item.minimumStock} {item.unit}
                </td>
                <td style={{ textAlign: 'center', padding: '12px' }}>
                  <span style={{
                    background: getStatusColor(item.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    fontWeight: '500',
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
