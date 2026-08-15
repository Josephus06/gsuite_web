import { useCallback, useEffect, useRef, useState } from 'react';
import { listProducts, getProduct, priceProduct, submitQuote, peso } from '../api';

// The self-service estimate builder.
//
// The table mirrors the ERP's own estimate screen, column for column: a job header, then the
// process lines beneath it. A customer and the sales rep who picks the quote up are then reading
// the same document, in the same order, with the same wording.
//
// ONLY FOUR THINGS ARE EDITABLE, matching the red fields on the ERP screen: the header Qty, and
// each line's Process Qty, Length, Width and Qty. Everything else -- the process, the material,
// the units, every price and the tax -- is output, and is rendered as text so it cannot be typed
// over. The customer chooses how much and how big; the shop decides how it is made and what it
// costs.
//
// This page never calculates a price. It asks the API and renders the answer, so a customer's
// figure and an in-house estimate for the same inputs cannot disagree. The API also clamps sizes
// to each product's limits and returns what it actually applied, so every field re-renders from
// the response rather than from what was typed.

const DEBOUNCE_MS = 400;

// Formats a number the way the ERP's estimate table does -- plain, no currency symbol, so the
// columns line up.
const n2 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
};
const n0 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : '';
};

export default function Quote() {
  const [products, setProducts] = useState([]);
  const [slug, setSlug] = useState('');
  const [detail, setDetail] = useState(null);
  const [edits, setEdits] = useState({});
  const [headerQty, setHeaderQty] = useState(null);
  const [priced, setPriced] = useState(null);
  const [pricing, setPricing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contact, setContact] = useState({ name: '', company: '', email: '', phone: '', address: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    listProducts()
      .then((rows) => {
        setProducts(rows);
        if (rows.length) setSlug(rows[0].slug);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Load the chosen product and reset any edits -- carrying a previous product's sizes over would
  // silently apply them to something they were never meant for.
  useEffect(() => {
    if (!slug) return;
    setDetail(null); setPriced(null); setEdits({}); setHeaderQty(null); setError('');
    getProduct(slug)
      .then((d) => { setDetail(d); setPriced(d); })
      .catch((e) => setError(e.message));
  }, [slug]);

  // Re-price on a debounce so a four-digit quantity is one request, not four. The timer is held in
  // a ref and cleared on every change, including unmount, so a pending request cannot land after
  // the user has moved to another product.
  const timer = useRef(null);
  const reprice = useCallback((nextEdits, nextQty) => {
    if (!slug || !detail) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const lines = detail.lines.map((l) => ({ line_id: l.line_id, ...(nextEdits[l.line_id] || {}) }));
      setPricing(true);
      priceProduct(slug, lines, nextQty)
        .then(setPriced)
        .catch((e) => setError(e.message))
        .finally(() => setPricing(false));
    }, DEBOUNCE_MS);
  }, [slug, detail]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function change(lineId, field, value) {
    const next = { ...edits, [lineId]: { ...(edits[lineId] || {}), [field]: value } };
    setEdits(next);
    reprice(next, headerQty);
  }

  function changeHeaderQty(value) {
    setHeaderQty(value);
    reprice(edits, value);
  }

  async function send(e) {
    e.preventDefault();
    setSending(true); setError('');
    try {
      const lines = detail.lines.map((l) => ({ line_id: l.line_id, ...(edits[l.line_id] || {}) }));
      const result = await submitQuote({ slug, lines, qty: headerQty, contact });
      setDone(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <section className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="card center">
            <div className="eyebrow">Quotation received</div>
            <h2>Thank you, {contact.name.split(' ')[0]}.</h2>
            <p className="lede">{done.message}</p>
            <p style={{ margin: '18px 0 6px', color: 'var(--muted)', fontSize: '0.9rem' }}>Your reference</p>
            <div className="summary-total">{done.estimate_no}</div>
            <p style={{ marginTop: 10 }}>Indicative total: <strong>{peso(done.total)}</strong></p>
            <p className="hint" style={{ marginTop: 18 }}>
              We have sent nothing to print. A representative will confirm the details and final
              pricing with you first.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const h = priced?.header;

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Request A Quote</h1>
          <p>Choose a product, set your quantity and size, and see the price as you go.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {error && <div className="notice notice-err">{error}</div>}
          {loading && <p className="lede">Loading products…</p>}

          {!loading && !products.length && !error && (
            <div className="card center">
              <h3>Online quoting is not live yet</h3>
              <p style={{ marginBottom: 0 }}>
                Our team is finalising the catalogue. Please call your nearest branch and we will
                price it for you today.
              </p>
            </div>
          )}

          {!!products.length && (
            <>
              <div className="product-picker">
                {products.map((p) => (
                  <button
                    type="button"
                    key={p.slug}
                    className={`product-choice${p.slug === slug ? ' is-active' : ''}`}
                    onClick={() => setSlug(p.slug)}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.tagline}</span>
                  </button>
                ))}
              </div>

              {detail && priced && (
                <>
                  <p className="hint" style={{ marginBottom: 10 }}>
                    The fields in orange are yours to change. Everything else is worked out from
                    them.
                  </p>

                  <div className="est-scroll">
                    <table className="est-table">
                      <thead>
                        <tr>
                          <th>Job Type</th>
                          <th>Description</th>
                          <th className="num">Qty</th>
                          <th>Units</th>
                          <th className="num">Price/Unit</th>
                          <th className="num">Subtotal</th>
                          <th className="num">Disc.%</th>
                          <th className="num">Disc. Amt</th>
                          <th className="num">Disc. Price/Unit</th>
                          <th className="num">Net of Tax</th>
                          <th>Tax Code</th>
                          <th className="num">Tax Amt</th>
                          <th className="num">Gross Amt</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>{h?.job_type || '—'}</strong></td>
                          <td>{h?.description}</td>
                          <td className="num">
                            <input
                              className="est-input"
                              type="number" min={detail.min_qty || 1} inputMode="numeric"
                              aria-label="Quantity"
                              value={headerQty ?? h?.qty ?? ''}
                              onChange={(e) => changeHeaderQty(e.target.value)}
                            />
                          </td>
                          <td>{h?.units}</td>
                          <td className="num">{n2(h?.price_per_unit)}</td>
                          <td className="num">{n2(h?.subtotal)}</td>
                          <td className="num">{n0(h?.disc_percent)}</td>
                          <td className="num">{n0(h?.disc_amount)}</td>
                          <td className="num">{n2(h?.disc_price_per_unit)}</td>
                          <td className="num">{n2(h?.net_of_tax)}</td>
                          <td>{h?.tax_code || '—'}</td>
                          <td className="num">{n2(h?.tax_amount)}</td>
                          <td className="num"><strong>{n2(h?.gross_amount)}</strong></td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="est-table est-table-lines">
                      <thead>
                        <tr>
                          <th className="num">#</th>
                          <th>Process</th>
                          <th className="num">Process Qty</th>
                          <th>Process UOM</th>
                          <th>Category</th>
                          <th>Parts</th>
                          <th>Item</th>
                          <th className="num">Length</th>
                          <th className="num">Width</th>
                          <th>UOM</th>
                          <th className="num">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {priced.lines.map((l, i) => (
                          <tr key={l.line_id}>
                            <td className="num">{l.line_no ?? i + 1}</td>
                            <td>{l.process_name || '—'}</td>
                            <td className="num">
                              {l.allow_qty ? (
                                <input
                                  className="est-input" type="number" min="0" inputMode="decimal"
                                  aria-label={`Process quantity for ${l.process_name}`}
                                  value={edits[l.line_id]?.process_qty ?? l.process_qty}
                                  onChange={(e) => change(l.line_id, 'process_qty', e.target.value)}
                                />
                              ) : n0(l.process_qty)}
                            </td>
                            <td>{l.process_uom || '—'}</td>
                            <td>{l.category || ''}</td>
                            <td>{l.parts || ''}</td>
                            <td className="est-item">{l.item_name || '—'}</td>
                            <td className="num">
                              {l.allow_size ? (
                                <input
                                  className="est-input" type="number" step="0.1" inputMode="decimal"
                                  aria-label={`Length for ${l.process_name}`}
                                  title={l.max_length != null ? `${l.min_length}–${l.max_length}` : undefined}
                                  value={edits[l.line_id]?.length ?? l.length}
                                  onChange={(e) => change(l.line_id, 'length', e.target.value)}
                                />
                              ) : n0(l.length)}
                            </td>
                            <td className="num">
                              {l.allow_size ? (
                                <input
                                  className="est-input" type="number" step="0.1" inputMode="decimal"
                                  aria-label={`Width for ${l.process_name}`}
                                  title={l.max_width != null ? `${l.min_width}–${l.max_width}` : undefined}
                                  value={edits[l.line_id]?.width ?? l.width}
                                  onChange={(e) => change(l.line_id, 'width', e.target.value)}
                                />
                              ) : n0(l.width)}
                            </td>
                            <td>{l.unit || '—'}</td>
                            <td className="num">
                              {l.allow_qty ? (
                                <input
                                  className="est-input" type="number" min="0" inputMode="decimal"
                                  aria-label={`Quantity for ${l.process_name}`}
                                  value={edits[l.line_id]?.qty ?? l.qty}
                                  onChange={(e) => change(l.line_id, 'qty', e.target.value)}
                                />
                              ) : n0(l.qty)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="quote-layout" style={{ marginTop: 24 }}>
                    <div className="card">
                      <h3>{detail.name}</h3>
                      <p style={{ color: 'var(--ink-soft)' }}>{detail.description}</p>
                      {detail.lead_time_days ? (
                        <p className="hint" style={{ margin: 0 }}>
                          Typical lead time: {detail.lead_time_days} working days
                        </p>
                      ) : null}
                    </div>

                    <div className="card">
                      <div className="eyebrow">Your quote</div>
                      <div className="summary-total">
                        {pricing ? 'Updating…' : peso(h?.gross_amount)}
                      </div>
                      <div className="summary-row">
                        <span>Net of tax</span><strong>{peso(h?.net_of_tax)}</strong>
                      </div>
                      <div className="summary-row">
                        <span>{h?.tax_code || 'Tax'}</span><strong>{peso(h?.tax_amount)}</strong>
                      </div>

                      <form onSubmit={send} style={{ marginTop: 18 }}>
                        <div className="field">
                          <label htmlFor="q-name">Your name *</label>
                          <input id="q-name" required value={contact.name}
                            onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                        </div>
                        <div className="field">
                          <label htmlFor="q-company">Company</label>
                          <input id="q-company" value={contact.company}
                            onChange={(e) => setContact({ ...contact, company: e.target.value })} />
                        </div>
                        <div className="field">
                          <label htmlFor="q-email">Email *</label>
                          <input id="q-email" type="email" required value={contact.email}
                            onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                        </div>
                        <div className="field">
                          <label htmlFor="q-phone">Contact number</label>
                          <input id="q-phone" value={contact.phone}
                            onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                        </div>
                        <div className="field">
                          <label htmlFor="q-address">Delivery address</label>
                          <textarea id="q-address" rows={2} value={contact.address}
                            onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={sending || pricing}>
                          {sending ? 'Sending…' : 'Send my quote'}
                        </button>
                        <p className="hint" style={{ marginTop: 10 }}>
                          Indicative only. A representative will confirm the details and final
                          pricing before anything goes to print.
                        </p>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
