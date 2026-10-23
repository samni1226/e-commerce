import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../lib/storage';
import Loader from '../components/Loader';
import type { Order } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError('Could not load your order history — the server may be unreachable.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading your orders…" />;

  if (error) {
    return (
      <div className="container empty-state">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container empty-state">
        <p>No orders placed yet — your order history will show up here.</p>
        <Link to="/" className="stamp-btn">
          Browse the Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Order History</h1>

      {orders.map((order) => (
        <div key={order.orderNumber} className="summary-box" style={{ marginLeft: 0, maxWidth: '100%', marginBottom: 24 }}>
          <div className="ledger-row">
            <span>Order No. {order.orderNumber}</span>
            <span>{formatDate(order.placedAt)}</span>
          </div>

          {order.lines.map((line) => (
            <div className="cart-line-title" key={line.productId} style={{ padding: '10px 0', borderBottom: '1px dashed var(--line)' }}>
              <img src={line.image} alt={line.title} />
              <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 14 }}>
                {line.title} × {line.quantity}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                ${(line.price * line.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="ledger-row">
            <span>Shipped to</span>
            <span>
              {order.shipping.city}, {order.shipping.country}
            </span>
          </div>
          <div className="ledger-row">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
