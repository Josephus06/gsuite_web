import { useCallback, useEffect, useRef, useState } from 'react';
import { listProducts, getProduct, priceProduct, submitQuote, peso } from '../api';

// The self-service estimate builder.
//
// Pick a common product, adjust the size and quantity, watch the price move, send it in. The
// numbers come from the ERP's own costing -- this page never calculates a price itself, it asks
// the API and renders the answer. That is deliberate: a formula copied into the browser would
// drift from the one the sales team quotes from, and the customer would be shown a figure nobody
// inside the business recognises.
//
// The API also clamps sizes to each product's limits and returns what it actually applied, so
// every field re-renders from the response rather than from what was typed.

const DEBOUNCE_MS = 400;

export default function Quote() {
  const [products, setProducts] = useState([]);
  const [slug, setSlug] = useState('');
  const [detail, setDetail] = useState(null);
  const [edits, setEdits] = useState({});
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
    setDetail(null); setPriced(null); setEdits({}); setError('');
    getProduct(slug)
      .then((d) => { setDetail(d); setPriced({ lines: d.lines, total: d.total }); })
      .catch((e) => setError(e.message));
  }, [slug]);

  // Re-price on a debounce so a four-digit quantity is one request, not four. The timer is held in
  // a ref and cleared on every change, including unmount, so a pending request cannot land after
  // the user has moved to another product.
  const timer = useRef(null);
  const reprice = useCallback((nextEdits) => {
    if (!slug || !detail) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const lines = detail.lines.map((l) => ({ line_id: l.line_id, ...(nextEdits[l.line_id] || {}) }));
      setPricing(true);
      priceProduct(slug, lines)
        .then(setPriced)
        .catch((e) => setError(e.message))
        .finally(() => setPricing(false));
    }, DEBOUNCE_MS);
  }, [slug, detail]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function change(lineId, field, value) {
    const next = { ...edits, [lineId]: { ...(edits[lineId] || {}), [field]: value } };
    setEdits(next);
    reprice(next);
  }

  async function send(e) {
    e.preventDefault();
    setSending(true); setError('');
    try {
      const lines = detail.lines.map((l) => ({ line_id: l.line_id, ...(edits[l.line_id] || {}) }));
      const result = await submitQuote({ slug, lines, contact });
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
            <p style={{ margin: '18px 0 6px', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Your reference
            </p>
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

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <h1>Request A Quote</h1>
          <p>Choose a product, set your size and quantity, and see the price as you go.</p>
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

              {detail && (
                <div className="quote-layout">
                  <div>
                    <h2>{detail.name}</h2>
                    <p className="lede">{detail.description}</p>

                    {priced?.lines.map((line) => (
                      <div className="line-card" key={line.line_id}>
                        <div className="line-head">
                          <div>
                            <strong>{line.label}</strong>
                            <div className="line-meta">
                              {[line.process_name, line.item_name].filter(Boolean).join(' · ')}
                            </div>
                          </div>
                          <span className="line-price">{peso(line.price)}</span>
                        </div>

                        <div className="field-row">
                          {line.allow_qty && (
                            <div>
                              <label htmlFor={`qty-${line.line_id}`}>Quantity</label>
                              <input
                                id={`qty-${line.line_id}`}
                                type="number" min="1" inputMode="numeric"
                                value={edits[line.line_id]?.qty ?? line.qty}
                                onChange={(e) => change(line.line_id, 'qty', e.target.value)}
                              />
                            </div>
                          )}
                          {line.allow_size && (
                            <>
                              <div>
                                <label htmlFor={`len-${line.line_id}`}>Length ({line.unit})</label>
                                <input
                                  id={`len-${line.line_id}`}
                                  type="number" step="0.25" inputMode="decimal"
                                  value={edits[line.line_id]?.length ?? line.length}
                                  onChange={(e) => change(line.line_id, 'length', e.target.value)}
                                />
                                {line.max_length != null && (
                                  <div className="hint">{line.min_length}–{line.max_length} {line.unit}</div>
                                )}
                              </div>
                              <div>
                                <label htmlFor={`wid-${line.line_id}`}>Width ({line.unit})</label>
                                <input
                                  id={`wid-${line.line_id}`}
                                  type="number" step="0.25" inputMode="decimal"
                                  value={edits[line.line_id]?.width ?? line.width}
                                  onChange={(e) => change(line.line_id, 'width', e.target.value)}
                                />
                                {line.max_width != null && (
                                  <div className="hint">{line.min_width}–{line.max_width} {line.unit}</div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card summary">
                    <div className="eyebrow">Your quote</div>
                    <div className="summary-total">
                      {pricing ? 'Updating…' : peso(priced?.total)}
                    </div>
                    {detail.lead_time_days ? (
                      <p className="hint" style={{ marginBottom: 14 }}>
                        Typical lead time: {detail.lead_time_days} working days
                      </p>
                    ) : null}

                    {priced?.lines.map((l) => (
                      <div className="summary-row" key={l.line_id}>
                        <span>{l.label} · {l.qty} @ {l.length}×{l.width}{l.unit}</span>
                        <strong>{peso(l.price)}</strong>
                      </div>
                    ))}

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
                        Indicative only. A representative will confirm the details and final pricing
                        before anything goes to print.
                      </p>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
