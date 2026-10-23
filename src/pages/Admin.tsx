import { useEffect, useState, type FormEvent } from 'react';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../api/products';
import Loader from '../components/Loader';
import type { NewProduct, Product } from '../types';

const emptyForm: NewProduct = {
  title: '',
  price: 0,
  description: '',
  category: '',
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
};

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState<NewProduct>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setError('Could not load stock from the catalog service.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function updateField<K extends keyof NewProduct>(key: K, value: NewProduct[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(product: Product) {
    setForm({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image,
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      if (editingId !== null) {
        const updated = await updateProduct(editingId, form);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...updated, id: editingId } : p)),
        );
        setStatus(`Updated "${form.title}" (NO. ${String(editingId).padStart(4, '0')}).`);
      } else {
        const created = await createProduct(form);
        // The demo API echoes back a new id; the local list is updated optimistically
        // since the sandboxed API does not persist new rows server-side.
        setProducts((prev) => [
          { ...created, id: created.id ?? prev.length + 1, rating: { rate: 0, count: 0 } },
          ...prev,
        ]);
        setStatus(`Added "${form.title}" to the catalog.`);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      setStatus('That request could not be completed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product: Product) {
    setStatus(null);
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setStatus(`Removed "${product.title}" from the catalog.`);
    } catch {
      setStatus('That item could not be removed. Please try again.');
    }
  }

  if (loading) return <Loader label="Loading stock ledger…" />;

  return (
    <div className="container">
      <h1 className="page-title">Manage Stock</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '60ch' }}>
        Create, edit, and retire catalog listings. Every action here calls the same REST
        endpoints (<code>POST</code>, <code>PUT</code>, <code>DELETE</code>) that a real
        inventory backend would expose.
      </p>

      {error && <div className="status-banner error">{error}</div>}
      {status && <div className="status-banner success">{status}</div>}

      <button className="stamp-btn" onClick={startCreate}>
        + Add New Item
      </button>

      {showForm && (
        <form className="admin-form form-grid" onSubmit={handleSubmit}>
          <div className="field full">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              required
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="price">Price (USD)</label>
            <input
              id="price"
              type="number"
              step="0.01"
              min={0}
              required
              value={form.price}
              onChange={(e) => updateField('price', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              required
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              required
              value={form.image}
              onChange={(e) => updateField('image', e.target.value)}
            />
          </div>
          <div className="field full">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              required
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>
          <div className="field full" style={{ display: 'flex', gap: 10 }}>
            <button className="stamp-btn" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId !== null ? 'Save Changes' : 'Create Item'}
            </button>
            <button
              type="button"
              className="stamp-btn ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>NO. {String(product.id).padStart(4, '0')}</td>
              <td>{product.title}</td>
              <td>{product.category}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>
                <div className="row-actions">
                  <button className="stamp-btn ghost" onClick={() => startEdit(product)}>
                    Edit
                  </button>
                  <button className="stamp-btn danger" onClick={() => handleDelete(product)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
