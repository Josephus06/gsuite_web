import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { COMPANY, NAV, BRANCHES } from './site';
import { Logo } from './Brand';

// Header and footer shared by every page. "Request A Quote" is the one call to action that stays
// visible throughout -- it is what the site exists to get people to.
export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu on navigation; leaving it open over the new page is disorienting.
  const close = () => setOpen(false);

  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <Link to="/" className="brand" onClick={close}>
            <Logo size={34} />
            <span>
              <span className="brand-name">{COMPANY.name}</span>
              <span className="brand-tag">{COMPANY.tagline}</span>
            </span>
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>

          <nav className={`site-nav${open ? ' is-open' : ''}`}>
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={close}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/quote"
            className="btn btn-primary btn-sm"
            onClick={close}
            style={{ display: pathname === '/quote' ? 'none' : undefined }}
          >
            Request A Quote
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <h4>{COMPANY.name}</h4>
              <p style={{ margin: 0 }}>{COMPANY.promise}</p>
              <p style={{ marginTop: 14 }}>
                <a href={COMPANY.facebook} target="_blank" rel="noreferrer">Facebook</a>
                {' · '}
                <a href={COMPANY.instagram} target="_blank" rel="noreferrer">Instagram</a>
              </p>
            </div>

            {BRANCHES.map((b) => (
              <div key={b.name}>
                <h4>{b.name}</h4>
                <p style={{ margin: '0 0 6px' }}>{b.address}</p>
                <p style={{ margin: '0 0 6px', fontSize: '0.86rem' }}>{b.hours}</p>
                <p style={{ margin: 0, fontSize: '0.86rem' }}>
                  {b.landline} · {b.mobile}
                </p>
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {COMPANY.legalName} · Est. {COMPANY.founded}. All rights reserved.</span>
            <Link to="/quote">Request a quote</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
