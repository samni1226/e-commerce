// A minimal file-based "database". Good enough for a learning/demo backend:
// no native bindings to install, the data is just a JSON file on disk at
// server/data/db.json, and every write is synchronous so there's no risk of
// two writes racing each other in a single-process dev server.
const fs = require('fs');
const path = require('path');
const seedProducts = require('./seedProducts');

const DB_PATH = path.join(__dirname, 'db.json');

function defaultData() {
  return {
    products: seedProducts,
    orders: [],
    account: null,
    nextProductId: 3000, // new Admin-created products start here
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    save(defaultData());
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { load, save };
