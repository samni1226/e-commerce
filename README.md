# OurKart — E-Commerce Web Application (with Backend)

A full-stack e-commerce storefront: a **React + TypeScript** front end talking to a
real **Node.js / Express** backend with its own database. Same lilac, girly interface
as before — now backed by a real API instead of an external demo service and
`localStorage`.

## Tech Stack
**Frontend:** React · TypeScript · React Router · Vite · CSS
**Backend:** Node.js · Express · a lightweight JSON-file database (no setup required)

## What changed from the frontend-only version

| Data | Before | Now |
|---|---|---|
| Products | External demo API + local file, merged in the browser | Served from OurKart's own database (`server/data/db.json`), seeded with all categories |
| Cart | `localStorage` | Still `localStorage` (cart is meant to be transient per-browser until checkout) |
| Account profile | `localStorage` | Saved to the backend via `GET/PUT /api/account` |
| Order history | `localStorage` | Saved to the backend via `GET/POST /api/orders` |
| Admin CRUD | Wrote to a public sandbox API that didn't persist | Writes to OurKart's own database — changes actually persist |

The UI, routes, and every page look and behave exactly as before — only where the
data lives has changed.

## Project Structure

```
ourkart/
  src/                  React frontend (unchanged structure)
    api/products.ts     Product CRUD client → /api/products
    lib/storage.ts       Orders & account client → /api/orders, /api/account
    pages/ ...
  server/                Express backend
    index.js             App entry point (port 4000)
    routes/
      products.js         GET/POST/PUT/DELETE /api/products
      orders.js           GET/POST /api/orders
      account.js          GET/PUT /api/account
    data/
      seedProducts.js     Initial catalog (electronics, jewelry, clothing, beauty)
      db.js               Tiny JSON-file database helper
      db.json             Generated automatically on first run (gitignored)
```

## Getting Started

Install dependencies for both the frontend and the backend:

```bash
npm run setup
```

Then run both servers together:

```bash
npm run dev:all
```

This starts:
- the backend API at `http://localhost:4000`
- the frontend at `http://localhost:5173` (Vite proxies any `/api/*` request straight
  to the backend, so the browser only ever talks to one origin)

If you'd rather run them in two separate terminals instead:

```bash
npm run server   # terminal 1 — backend on :4000
npm run dev       # terminal 2 — frontend on :5173
```

To build the frontend for production:

```bash
npm run build
npm run preview
```

(The backend is a separate Node process — see **Deployment** below.)

## API Reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/orders` | List all past orders |
| POST | `/api/orders` | Create an order at checkout (also sends the owner notification) |
| GET | `/api/orders/new-count` | Count of orders the store owner hasn't opened yet |
| PATCH | `/api/orders/:orderNumber/seen` | Mark an order as seen by the store owner |
| GET | `/api/account` | Get the saved profile |
| PUT | `/api/account` | Save/update the profile |
| GET | `/api/health` | Health check |

## How the store owner receives an order

When a customer checks out, two things happen automatically:

1. **In-app notification** — the order immediately appears on the new **Incoming
   Orders** page (`/admin/orders`), with a red badge in the nav showing how many
   orders haven't been opened yet. This is the same pattern real order-management
   dashboards use (Shopify, Etsy, etc.) — the owner doesn't have to go looking for
   new orders.
2. **Email notification** — the backend sends an email (`server/lib/mailer.js`) with
   the order number, customer, shipping address, items, and total. It uses
   **Ethereal**, a free testing SMTP service, so it works out of the box with zero
   setup or credentials — every email lands in a throwaway test inbox instead of a
   real one, and you get a clickable preview link (shown right on the order
   confirmation page, and again next to each order in Incoming Orders) to see exactly
   what was sent.

To send *real* emails instead of test previews, swap the transporter in
`server/lib/mailer.js` for a real provider (Gmail with an app password, SendGrid,
Resend, etc.) and set `OWNER_EMAIL` to the real inbox that should receive orders —
nothing else in the app needs to change, since every route only calls
`sendOrderNotification()`.

## Deployment

- **Frontend:** deploys to Vercel exactly as before (`npm run build`, output `dist`).
- **Backend:** deploy `server/` separately to any Node host (Render, Railway, Fly.io,
  a VPS, etc.), then point the frontend at it by replacing the relative `/api` paths
  in `src/api/products.ts` and `src/lib/storage.ts` with your backend's full URL, or
  configure a production reverse proxy the same way `vite.config.ts` does in
  development.
- The JSON-file database (`server/data/db.json`) is fine for a demo or learning project. For
  a production deployment, swap the storage layer in `server/data/db.js` for a real
  database (PostgreSQL, MongoDB, etc.) — every route file only calls `load()`/`save()`,
  so the rest of the backend doesn't need to change.

## Notes

- The database is seeded automatically the first time the server runs — no manual
  setup or migration step needed.
- Cart contents are intentionally kept in the browser (`localStorage`) rather than
  the backend, since a cart is normally scoped to a single visitor's session rather
  than a persistent account record.
