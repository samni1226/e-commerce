import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getNewOrderCount } from '../lib/storage';

export default function Navbar() {
  const { itemCount } = useCart();
  const location = useLocation();
  const [newOrders, setNewOrders] = useState(0);

  useEffect(() => {
    function refresh() {
      getNewOrderCount()
        .then(setNewOrders)
        .catch(() => {
          // Non-critical — the badge just won't show if the API is unreachable.
        });
    }
    refresh();
    window.addEventListener('orders:updated', refresh);
    return () => window.removeEventListener('orders:updated', refresh);
  }, [location.pathname]);

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="brand">
          <span className="brand-heart">♡</span> OurKart
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Catalog
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Manage Stock
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="cart-badge">
              Incoming Orders
              {newOrders > 0 && <span className="cart-count">{newOrders}</span>}
            </span>
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>
            My Orders
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => (isActive ? 'active' : '')}>
            Account
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="cart-badge">
              Cart
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
