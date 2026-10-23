import { Link, useLocation, Navigate } from 'react-router-dom';
import type { OrderNotification } from '../types';

interface ConfirmationState {
  orderNumber: string;
  total: number;
  name: string;
  notification?: OrderNotification;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;

  if (!state) return <Navigate to="/" replace />;

  return (
    <div className="container confirmation">
      <p className="hero-eyebrow">Order Received</p>
      <h1>Thank you, {state.name.split(' ')[0] || 'friend'}.</h1>
      <p className="order-no">
        Order No. {state.orderNumber} — ${state.total.toFixed(2)} charged
      </p>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '48ch', margin: '0 auto 12px' }}>
        A confirmation has been logged for this order. It will ship from the OurKart
        studio within two business days.
      </p>

      {state.notification?.sent ? (
        <p style={{ color: 'var(--lilac-deep)', maxWidth: '48ch', margin: '0 auto 28px', fontSize: 14 }}>
          📧 The store owner has been notified of this order.
          {state.notification.previewUrl && (
            <>
              {' '}
              <a
                href={state.notification.previewUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--pink-deep)', fontWeight: 600 }}
              >
                View the notification email
              </a>
              {' '}(demo inbox).
            </>
          )}
        </p>
      ) : (
        <p style={{ color: 'var(--ink-soft)', maxWidth: '48ch', margin: '0 auto 28px', fontSize: 14 }}>
          The order was saved, but the owner notification email couldn't be sent this time.
        </p>
      )}

      <Link to="/" className="stamp-btn">
        Back to Catalog
      </Link>
    </div>
  );
}
