// Talks to the ERP's public quote API (server/src/routes/publicQuotes.js in the gsuite repo).
//
// The base URL is a build-time variable so pointing this at production is a Railway setting
// rather than a code change:
//
//   VITE_API_BASE=https://gsuitev2.graphicstar.ph
//
// Left blank it falls back to a same-origin /api, which is what the dev proxy in vite.config.js
// serves, so `npm run dev` needs no configuration at all.
const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const url = (path) => `${BASE}/api/public${path}`;

async function json(res) {
  const body = await res.json().catch(() => ({}));
  // The API reports problems as { error }; surface that wording rather than a bare status code,
  // because it is written for the person reading it ("Release the remaining ..." and so on).
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export function listProducts() {
  return fetch(url('/products')).then(json);
}

export function getProduct(slug) {
  return fetch(url(`/products/${encodeURIComponent(slug)}`)).then(json);
}

// Re-prices a configuration. The server clamps sizes to the catalog's limits and echoes back what
// it actually applied, so always render from the response rather than from what was typed.
export function priceProduct(slug, lines) {
  return fetch(url(`/products/${encodeURIComponent(slug)}/price`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  }).then(json);
}

export function submitQuote(payload) {
  return fetch(url('/quotes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(json);
}

export function peso(n) {
  const v = Number(n);
  return Number.isFinite(v)
    ? `₱${v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';
}
