import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getAccount, saveOrder } from '../lib/storage';
import type { ShippingDetails } from '../types';

const SHIPPING_FLAT_RATE = 6.5;

const emptyDetails: ShippingDetails = {
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
};

export default function Checkout() {
  const { lines, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [details, setDetails] = useState<ShippingDetails>(emptyDetails);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccount()
      .then((account) => {
        if (account) setDetails(account);
      })
      .catch(() => {
        // No saved profile yet, or the API is unreachable — the form just starts blank.
      })
      .finally(() => setLoadingAccount(false));
  }, []);

  if (lines.length === 0) {
    navigate('/cart');
    return null;
  }

  const total = subtotal + SHIPPING_FLAT_RATE;

  function updateField<K extends keyof ShippingDetails>(key: K, value: ShippingDetails[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await saveOrder({
        orderNumber: '', // assigned by the server
        placedAt: '',
        lines: lines.map(({ product, quantity }) => ({
          productId: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity,
        })),
        subtotal,
        shippingCost: SHIPPING_FLAT_RATE,
        total,
        shipping: details,
      });

      clearCart();
      navigate('/order-confirmation', {
        state: {
          orderNumber: created.orderNumber,
          total,
          name: details.fullName,
          notification: created.notification,
        },
      });
    } catch {
      setError('Could not place your order — the server may be unreachable. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container checkout-layout">
      <div>
        <h1 className="page-title">Checkout</h1>
        {error && <div className="status-banner error">{error}</div>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              required
              disabled={loadingAccount}
              value={details.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="address">Street address</label>
            <input
              id="address"
              required
              disabled={loadingAccount}
              value={details.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="city">City</label>
            <input
              id="city"
              required
              disabled={loadingAccount}
              value={details.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="postalCode">Postal code</label>
            <input
              id="postalCode"
              required
              disabled={loadingAccount}
              value={details.postalCode}
              onChange={(e) => updateField('postalCode', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              required
              disabled={loadingAccount}
              value={details.country}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>
          <div className="field full">
            <button className="stamp-btn" type="submit" style={{ width: '100%' }} disabled={submitting}>
              {submitting ? 'Placing Order…' : `Place Order — $${total.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 40 }}>
          Order Summary
        </h2>
        <div className="summary-box" style={{ marginLeft: 0, maxWidth: '100%' }}>
          {lines.map(({ product, quantity }) => (
            <div className="ledger-row" key={product.id}>
              <span>
                {product.title} × {quantity}
              </span>
              <span>${(product.price * quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="ledger-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="ledger-row">
            <span>Shipping</span>
            <span>${SHIPPING_FLAT_RATE.toFixed(2)}</span>
          </div>
          <div className="ledger-row">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
