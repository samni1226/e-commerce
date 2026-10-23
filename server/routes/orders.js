const express = require('express');
const { load, save } = require('../data/db');
const { sendOrderNotification } = require('../lib/mailer');

const router = express.Router();

// GET /api/orders — order history, most recent first
router.get('/', (req, res) => {
  const db = load();
  res.json(db.orders);
});

// GET /api/orders/new-count — how many orders the admin hasn't opened yet
router.get('/new-count', (req, res) => {
  const db = load();
  const count = db.orders.filter((o) => o.status === 'new').length;
  res.json({ count });
});

// POST /api/orders — create an order at checkout, and notify the store owner
router.post('/', async (req, res) => {
  const db = load();
  const { lines, subtotal, shippingCost, total, shipping } = req.body;
  if (!lines || !lines.length || !shipping) {
    return res.status(400).json({ error: 'lines and shipping are required' });
  }

  const order = {
    orderNumber: `OK-${Date.now().toString().slice(-8)}`,
    placedAt: new Date().toISOString(),
    lines,
    subtotal,
    shippingCost,
    total,
    shipping,
    status: 'new', // 'new' until the store owner opens it in Incoming Orders
    emailPreviewUrl: null,
  };

  // This is how "the order person" actually receives the request: an email
  // notification (viewable at a preview link in dev/demo mode) plus a badge
  // in the app's Incoming Orders screen. A failed email never blocks the order.
  const notification = await sendOrderNotification(order);
  order.emailPreviewUrl = notification.previewUrl;

  db.orders.unshift(order);
  save(db);
  res.status(201).json({ ...order, notification });
});

// PATCH /api/orders/:orderNumber/seen — store owner opened/acknowledged the order
router.patch('/:orderNumber/seen', (req, res) => {
  const db = load();
  const order = db.orders.find((o) => o.orderNumber === req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = 'seen';
  save(db);
  res.json(order);
});

module.exports = router;
