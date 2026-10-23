import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(Number(id))
      .then(setProduct)
      .catch(() => setError('That item could not be found in the catalog.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error || !product) {
    return (
      <div className="container empty-state">
        <p>{error ?? 'Item not found.'}</p>
        <button className="stamp-btn ghost" onClick={() => navigate('/')}>
          Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container detail">
      <div className="detail-media">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="detail-info">
        <span className="card-category">{product.category}</span>
        <h1>{product.title}</h1>
        <p style={{ color: 'var(--ink-soft)' }}>{product.description}</p>

        <div className="ledger-row">
          <span>SKU</span>
          <span>NO. {String(product.id).padStart(4, '0')}</span>
        </div>
        <div className="ledger-row">
          <span>Rating</span>
          <span>
            {product.rating.rate} / 5 ({product.rating.count} reviews)
          </span>
        </div>
        <div className="ledger-row">
          <span>Price</span>
          <span>${product.price.toFixed(2)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
          <div className="qty-control">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
              −
            </button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
              +
            </button>
          </div>
          <button
            className="stamp-btn"
            onClick={() => {
              addItem(product, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
          >
            {added ? 'Added to Cart ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
