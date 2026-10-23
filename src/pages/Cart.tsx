import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { lines, setQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (lines.length === 0) {
    return (
      <div className="container empty-state">
        <p>Your cart is empty — nothing staged for checkout yet.</p>
        <Link to="/" className="stamp-btn">
          Browse the Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lines.map(({ product, quantity }) => (
            <tr key={product.id}>
              <td>
                <div className="cart-line-title">
                  <img src={product.image} alt={product.title} />
                  <span>{product.title}</span>
                </div>
              </td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <div className="qty-control">
                  <button onClick={() => setQuantity(product.id, quantity - 1)}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(product.id, quantity + 1)}>+</button>
                </div>
              </td>
              <td>${(product.price * quantity).toFixed(2)}</td>
              <td>
                <button className="stamp-btn danger" onClick={() => removeItem(product.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="summary-box">
        <div className="ledger-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="ledger-row">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="ledger-row">
          <span>Estimated Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button className="stamp-btn" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
