import type { AccountProfile, Order, OrderNotification } from '../types';

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Orders ----------

export async function getOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  return handle<Order[]>(res);
}

export async function getNewOrderCount(): Promise<number> {
  const res = await fetch('/api/orders/new-count');
  const data = await handle<{ count: number }>(res);
  return data.count;
}

export async function saveOrder(
  order: Order,
): Promise<Order & { notification: OrderNotification }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return handle<Order & { notification: OrderNotification }>(res);
}

export async function markOrderSeen(orderNumber: string): Promise<Order> {
  const res = await fetch(`/api/orders/${orderNumber}/seen`, { method: 'PATCH' });
  return handle<Order>(res);
}

// ---------- Account ----------

export async function getAccount(): Promise<AccountProfile | null> {
  const res = await fetch('/api/account');
  return handle<AccountProfile | null>(res);
}

export async function saveAccount(profile: AccountProfile): Promise<AccountProfile> {
  const res = await fetch('/api/account', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handle<AccountProfile>(res);
}
