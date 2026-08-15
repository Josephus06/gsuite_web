import { Link } from 'react-router-dom';
import {
  COMPANY, VISION, MISSION, VALUES, CATEGORIES, INDUSTRIES, CLIENTS, BRANCHES,
} from '../site';

// The four marketing pages. They are content, not logic, so they share a file rather than each
// getting one of their own -- the quote builder is where the actual work is.

function PageHero({ title, sub }) {
  return (
    <section className="page-hero">
      <div className="wrap">
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow" style={{ color: '#c4b5fd' }}>{COMPANY.subtitle}</div>
          <h1>{COMPANY.tagline}</h1>
          <p>{COMPANY.promise}</p>
          <div className="hero-actions">
            <Link to="/quote" className="btn btn-primary">Build your quote</Link>
            <Link to="/products" className="btn btn-ghost">See what we make</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 34 }}>
            <div className="eyebrow">What we make</div>
            <h2>Print, signage and display — under one roof</h2>
            <p className="lede">
              Among the first in the country, and the only one in the Visayas and Mindanao, to offer
              state-of-the-art graphic, advertising and printing services.
            </p>
          </div>
          <div className="grid grid-3">
            {CATEGORIES.map((c) => (
              <div className="card card-hover" key={c.name}>
                <h3>{c.name}</h3>
                <p>{c.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price-it-yourself is the thing this site does that the old one did not, so it gets its
          own band rather than being buried in the nav. */}
      <section className="section section-alt">
        <div className="wrap center">
          <div className="eyebrow">New</div>
          <h2>Price it yourself, in about a minute</h2>
          <p className="lede">
            Pick a common product, set your size and quantity, and watch the price update as you go.
            The figures come straight from our production costing — the same numbers our team quotes
            from. Happy with it? Send it over and a representative picks it up from there.
          </p>
          <Link to="/quote" className="btn btn-primary" style={{ marginTop: 10 }}>Start a quote</Link>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 30 }}>
            <div className="eyebrow">Who we work with</div>
            <h2>Trusted by some of the Philippines’ best-known brands</h2>
          </div>
          <div className="grid grid-4" style={{ marginBottom: 34 }}>
            {CLIENTS.map((c) => <div className="tile" key={c}>{c}</div>)}
          </div>
          <div className="pill-row" style={{ justifyContent: 'center' }}>
            {INDUSTRIES.map((i) => <span className="pill" key={i}>{i}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}

export function About() {
  return (
    <>
      <PageHero title="About Us" sub={`Welcome to ${COMPANY.name} — ${COMPANY.subtitle}.`} />

      <section className="section">
        <div className="wrap grid grid-2">
          <div>
            <div className="eyebrow">Our story</div>
            <h2>What began as one idea from two creative minds</h2>
            <p className="lede">
              …has grown into a vibrant, colourful masterpiece. We are passionate about bringing
              visions to life through design — for startups finding their first look, and for
              established companies who need work delivered right, on time, every time.
            </p>
            <p className="lede">
              From logos and branding to print, signage and digital assets, we are among the first
              in the country — and the only one in the Visayas and Mindanao — to offer
              state-of-the-art services across all of it.
            </p>
          </div>
          <div className="card" style={{ background: 'var(--surface-alt)' }}>
            <h3>Vision</h3>
            <p style={{ marginBottom: 18 }}>{VISION}</p>
            <h3>Mission</h3>
            <p>{MISSION}</p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="center" style={{ marginBottom: 30 }}>
            <div className="eyebrow">What we stand on</div>
            <h2>Core values</h2>
          </div>
          <div className="grid grid-4">
            {VALUES.map((v) => (
              <div className="card" key={v.name}>
                <h3>{v.name}</h3>
                <p>{v.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function Products() {
  return (
    <>
      <PageHero title="Products" sub="Seven categories, one production floor." />
      <section className="section">
        <div className="wrap">
          <div className="grid grid-3">
            {CATEGORIES.map((c) => (
              <div className="card card-hover" key={c.name}>
                <h3>{c.name}</h3>
                <p style={{ marginBottom: 14 }}>{c.blurb}</p>
                <Link to="/quote" className="btn btn-outline btn-sm">Get a price</Link>
              </div>
            ))}
          </div>
          <div className="card center" style={{ marginTop: 26, background: 'var(--brand-soft)', border: 'none' }}>
            <h3>Not sure which one you need?</h3>
            <p style={{ marginBottom: 14 }}>
              Start a quote on the closest match — you can change the size and quantity, and a
              representative will confirm the details with you.
            </p>
            <Link to="/quote" className="btn btn-primary">Build your quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function Portfolio() {
  return (
    <>
      <PageHero title="Portfolio" sub="A sample of what we have put out into the world." />
      <section className="section">
        <div className="wrap">
          <div className="grid grid-3">
            {CATEGORIES.map((c) => (
              <div className="card" key={c.name}>
                <div className="tile" style={{ marginBottom: 14 }}>{c.name}</div>
                <p>{c.blurb}</p>
              </div>
            ))}
          </div>
          <p className="lede center" style={{ marginTop: 30 }}>
            Work spanning {INDUSTRIES.length} industries, for brands including {CLIENTS.join(', ')}.
          </p>
        </div>
      </section>
    </>
  );
}

export function Contact() {
  return (
    <>
      <PageHero title="Contact Us" sub="Three locations across Cebu. Drop in, call, or send a quote." />
      <section className="section">
        <div className="wrap">
          <div className="grid grid-3">
            {BRANCHES.map((b) => (
              <div className="card" key={b.name}>
                <h3>{b.name}</h3>
                <p style={{ marginBottom: 10 }}>{b.address}</p>
                <p style={{ marginBottom: 10, fontSize: '0.9rem' }}><strong>Hours:</strong> {b.hours}</p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  <strong>Landline:</strong> {b.landline}<br />
                  <strong>Mobile:</strong> {b.mobile}
                </p>
              </div>
            ))}
          </div>

          {/* A general contact form would post nowhere and quietly lose enquiries. The quote
              builder is a real, working channel, so it is what we point people at. */}
          <div className="card center" style={{ marginTop: 26, background: 'var(--brand-soft)', border: 'none' }}>
            <h3>Need a price?</h3>
            <p style={{ marginBottom: 14 }}>
              Build it yourself and send it straight to our team — it lands in our system the moment
              you submit.
            </p>
            <Link to="/quote" className="btn btn-primary">Request a quote</Link>
          </div>
        </div>
      </section>
    </>
  );
}
