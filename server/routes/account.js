const express = require('express');
const { load, save } = require('../data/db');

const router = express.Router();

// GET /api/account
router.get('/', (req, res) => {
  const db = load();
  res.json(db.account);
});

// PUT /api/account
router.put('/', (req, res) => {
  const db = load();
  db.account = req.body;
  save(db);
  res.json(db.account);
});

module.exports = router;
