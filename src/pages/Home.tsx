import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import type { Product } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not reach the catalog service. Try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );

  const visible = useMemo(
    () => (category === 'all' ? products : products.filter((p) => p.category === category)),
    [products, category],
  );

  return (
    <>
      <section className="hero container">
        <p className="hero-eyebrow">✿ New Season Faves ✿</p>
        <h1>Cute little things for your everyday little joys.</h1>
        <p>
          Every piece in the shop is handpicked, priced sweetly, and shipped with love —
          browse, add to cart, and treat yourself below.
        </p>
        <a href="#catalog" className="stamp-btn">
          Shop the Collection
        </a>
      </section>

      <div className="container" id="catalog">
        {error && <div className="status-banner error">{error}</div>}

        {!loading && !error && (
          <div className="filter-row">
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (
          <div className="grid">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
