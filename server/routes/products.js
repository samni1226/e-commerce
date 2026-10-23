const express = require('express');
const { load, save } = require('../data/db');

const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  const db = load();
  res.json(db.products);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = load();
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products
router.post('/', (req, res) => {
  const db = load();
  const { title, price, description, category, image } = req.body;
  if (!title || price === undefined || !category) {
    return res.status(400).json({ error: 'title, price, and category are required' });
  }
  const product = {
    id: db.nextProductId++,
    title,
    price: Number(price),
    description: description || '',
    category,
    image: image || '',
    rating: { rate: 0, count: 0 },
  };
  db.products.unshift(product);
  save(db);
  res.status(201).json(product);
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const db = load();
  const id = Number(req.params.id);
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const { title, price, description, category, image } = req.body;
  db.products[index] = {
    ...db.products[index],
    ...(title !== undefined && { title }),
    ...(price !== undefined && { price: Number(price) }),
    ...(description !== undefined && { description }),
    ...(category !== undefined && { category }),
    ...(image !== undefined && { image }),
  };
  save(db);
  res.json(db.products[index]);
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const db = load();
  const id = Number(req.params.id);
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const [removed] = db.products.splice(index, 1);
  save(db);
  res.json(removed);
});

module.exports = router;
