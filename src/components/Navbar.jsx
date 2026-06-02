import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';

const NAV_LINKS = [
  { to: '/',         label: 'Accueil',  end: true },
  { to: '/boutique', label: 'Boutique', end: false },
  { to: '/contact',  label: 'Contact',  end: false },
];

export default function Navbar() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname }            = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!e.target.closest('header')) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const linkClass = ({ isActive }) =>
    `relative text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 px-3 py-2 ${
      isActive ? 'text-brand' : 'text-ink/70 hover:text-ink'
    } after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-brand after:scale-x-0 after:transition-transform after:duration-200 ${
      isActive ? 'after:scale-x-100' : 'hover:after:scale-x-100'
    }`;

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md shadow-ink/8' : 'border-b border-border'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Brand ───────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative">
            <img
              src="/logo.png"
              alt="FasoPagnes"
              className="h-10 w-10 rounded-full object-contain border-2 border-brand/20 group-hover:border-brand/50 transition-colors duration-300"
            />
          </div>
          <div className="leading-tight">
            <div className="text-navy font-bold text-sm tracking-wide">FasoPagnes</div>
            <div className="text-amber-500 text-[11px] italic font-medium">Tissé D'lux</div>
          </div>
        </Link>

        {/* ── Desktop nav ─────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>{label}</NavLink>
          ))}
        </nav>

        {/* ── CTA Desktop ─────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 text-navy hover:bg-navy hover:text-white hover:border-navy font-bold text-[11px] tracking-widest uppercase px-5 py-2.5 transition-all duration-200"
          >
            <LogIn size={14} aria-hidden="true" />
            <span>Connexion</span>
          </Link>
        </div>

        {/* ── Hamburger ───────────────────────────────────── */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-ink hover:bg-surface transition-colors"
          aria-label={open ? 'Fermer' : 'Menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Menu mobile ─────────────────────────────────────── */}
      <div
        className={`md:hidden bg-white border-t border-border overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 py-3 flex flex-col gap-1" aria-label="Menu mobile">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${
                  isActive ? 'text-brand bg-brand-pale' : 'text-ink/70 hover:text-ink hover:bg-surface'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="pt-3 pb-2">
            <Link
              to="/admin"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-navy/20 text-navy hover:bg-navy hover:text-white font-bold text-xs tracking-widest uppercase px-5 py-3 transition-all duration-200"
            >
              <LogIn size={16} />
              <span>Connexion</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
