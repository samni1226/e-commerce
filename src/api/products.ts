import type { NewProduct, Product } from '../types';

// Talks to OurKart's own Express + JSON-file backend (see /server).
// In development, Vite proxies /api to http://localhost:4000 (see vite.config.ts).
const BASE_URL = '/api/products';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// READ (all)
export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(BASE_URL);
  return handle<Product[]>(res);
}

// READ (one)
export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE_URL}/${id}`);
  return handle<Product>(res);
}

// CREATE
export async function createProduct(product: NewProduct): Promise<Product> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return handle<Product>(res);
}

// UPDATE
export async function updateProduct(id: number, product: NewProduct): Promise<Product> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return handle<Product>(res);
}

// DELETE
export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
}
