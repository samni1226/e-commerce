import { Link } from 'react-router-dom';
import type { Product } from '../types';

function isLowStock(product: Product): boolean {
  // Deterministic mock signal derived from the product's rating count,
  // since the demo REST API does not expose live inventory.
  return product.rating.count % 4 === 0;
}

export default function ProductCard({ product }: { product: Product }) {
  const low = isLowStock(product);

  return (
    <Link to={`/product/${product.id}`} className="card">
      <div className="card-media">
        <span className="sku">NO. {String(product.id).padStart(4, '0')}</span>
        <span className={`stock-tag ${low ? 'low' : 'in'}`}>
          {low ? 'Low Stock' : 'In Stock'}
        </span>
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="card-body">
        <span className="card-category">{product.category}</span>
        <span className="card-title">{product.title}</span>
        <div className="card-footer">
          <span className="price">${product.price.toFixed(2)}</span>
        </div>
      </div>
    </Link>
  );
}
