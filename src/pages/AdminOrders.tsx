import { useEffect, useState } from 'react';
import { getOrders, markOrderSeen } from '../lib/storage';
import Loader from '../components/Loader';
import type { Order } from '../types';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getOrders()
      .then(setOrders)
      .catch(() => setError('Could not load orders — the server may be unreachable.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleMarkSeen(orderNumber: string) {
    setMarkingId(orderNumber);
    try {
      await markOrderSeen(orderNumber);
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: 'seen' } : o)),
      );
      window.dispatchEvent(new Event('orders:updated'));
    } catch {
      setError('Could not update that order. Please try again.');
    } finally {
      setMarkingId(null);
    }
  }

  if (loading) return <Loader label="Loading incoming orders…" />;

  return (
    <div className="container">
      <h1 className="page-title">Incoming Orders</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '60ch' }}>
        This is how order requests actually reach the store owner — every checkout lands
        here immediately (and triggers an email notification), so nothing has to be
        checked manually against a customer's own order history.
      </p>

      {error && <div className="status-banner error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet — new orders will appear here the moment a customer checks out.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order.orderNumber}
            className="summary-box"
            style={{ marginLeft: 0, maxWidth: '100%', marginBottom: 20 }}
          >
            <div className="ledger-row" style={{ alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {order.status === 'new' && (
                  <span
                    style={{
                      background: 'var(--pink-deep)',
                      color: '#fff',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 10,
                      padding: '3px 9px',
                      borderRadius: 999,
                    }}
                  >
                    NEW
                  </span>
                )}
                Order No. {order.orderNumber}
              </span>
              <span>{formatDateTime(order.placedAt)}</span>
            </div>

            <div className="ledger-row">
              <span>Customer</span>
              <span>{order.shipping.fullName}</span>
            </div>
            <div className="ledger-row">
              <span>Ship to</span>
              <span>
                {order.shipping.address}, {order.shipping.city}, {order.shipping.country}
              </span>
            </div>

            {order.lines.map((line) => (
              <div
                className="cart-line-title"
                key={line.productId}
                style={{ padding: '10px 0', borderBottom: '1px dashed var(--line)' }}
              >
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
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
              {order.emailPreviewUrl && (
                <a
                  href={order.emailPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="stamp-btn ghost"
                >
                  View Notification Email
                </a>
              )}
              {order.status === 'new' && (
                <button
                  className="stamp-btn"
                  onClick={() => handleMarkSeen(order.orderNumber)}
                  disabled={markingId === order.orderNumber}
                >
                  {markingId === order.orderNumber ? 'Marking…' : 'Mark as Seen'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
