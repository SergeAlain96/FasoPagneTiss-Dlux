import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { WHATSAPP, PHONE, EMAIL } from '../constants/theme';

const NAV_LINKS  = [['/', 'Accueil'], ['/boutique', 'Boutique'], ['/contact', 'Contact']];
const CONTACT_ITEMS = [
  { id: 'addr', Icon: MapPin,        text: 'Dassasgho, près du ROYAL BEACH Hotel\nOuagadougou, Burkina Faso' },
  { id: 'wa',   Icon: MessageCircle, text: `+226 63 24 06 63\n+226 52 83 24 24`, href: `https://wa.me/${WHATSAPP}` },
  { id: 'tel',  Icon: Phone,         text: PHONE,  href: `tel:${PHONE}` },
  { id: 'mail', Icon: Mail,          text: EMAIL,  href: `mailto:${EMAIL}` },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* ── Brand ──────────────────────────────────────── */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="FasoPagnes Tissé D'lux" className="h-14 w-14 rounded-full border-2 border-white/15 object-contain" />
              <div>
                <div className="text-white font-bold text-base tracking-wide">FasoPagnes</div>
                <div className="text-amber-400 text-sm italic font-medium">Tissé D'lux</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Pagnes tissés authentiques du Burkina Faso depuis 2015. Qualité artisanale, tissés à la main selon les traditions ancestrales.
            </p>
            {/* Horaires */}
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">Horaires</p>
              <p className="text-white/55 text-sm">Lun – Ven : 08h00 – 19h00</p>
              <p className="text-white/55 text-sm">Samedi : 09h00 – 19h00</p>
            </div>
          </div>

          {/* ── Navigation ─────────────────────────────────── */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-5">Navigation</p>
            <ul className="space-y-3">
              {NAV_LINKS.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ────────────────────────────────────── */}
          <div className="md:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-5">Contact</p>
            <ul className="space-y-4">
              {CONTACT_ITEMS.map(({ id, Icon, text, href }) => (
                <li key={id} className="flex items-start gap-3">
                  <Icon size={15} className="text-brand mt-0.5 shrink-0" />
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                       className="text-white/60 hover:text-white text-sm leading-snug transition-colors whitespace-pre-line">
                      {text}
                    </a>
                  ) : (
                    <span className="text-white/60 text-sm leading-snug whitespace-pre-line">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────── */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>© {new Date().getFullYear()} <span className="text-amber-400/70 font-medium">FasoPagnes Tissé D'lux</span> — Tous droits réservés</span>
          <span>Ouagadougou, Burkina Faso</span>
        </div>
      </div>
    </footer>
  );
}
