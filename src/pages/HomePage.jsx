import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, MessageCircle, Search, Star,
  ShieldCheck, Truck, CreditCard, Sparkles, Phone,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { subscribeProducts } from '../services/firebase';
import { defaultProducts } from '../data/products';
import { WHATSAPP, CATEGORIES } from '../constants/theme';

/* ── Données statiques ─────────────────────────────────────────── */
const BENEFITS = [
  { Icon: ShieldCheck, title: 'Tissu 100% authentique', text: 'Chaque pagne tissé main par des artisans burkinabè, selon les traditions ancestrales.' },
  { Icon: Truck,       title: 'Livraison rapide',        text: 'Retrait en boutique à Dassasgho ou livraison à Ouagadougou sous 24 à 48 heures.' },
  { Icon: CreditCard,  title: 'Paiement flexible',       text: 'Wave, Moov Money, Orange Money, Western Union, RIA, MoneyGram et plus encore.' },
  { Icon: Sparkles,    title: 'Qualité D\'lux',          text: 'Sélection rigoureuse des plus belles pièces : batiks, kokodonda, bogolla, galani.' },
];

const PAYMENTS = ['Wave', 'Moov Money', 'Orange Money', 'Western Union', 'RIA', 'MoneyGram', 'Express'];

const REVIEWS = [
  { text: "Les plus beaux pagnes que j'ai trouvés à Ouaga. Qualité exceptionnelle !", author: 'Aminata K.', city: 'Ouagadougou' },
  { text: 'Livraison rapide, tissu magnifique. Je commande uniquement ici maintenant !', author: 'Ibrahim T.', city: 'Bobo-Dioulasso' },
  { text: 'Service client au top, pagnes authentiques et prix très raisonnables.', author: 'Fatoumata D.', city: 'Koudougou' },
];

const STATS = [
  { value: '200+', label: 'Modèles' },
  { value: '100%', label: 'Authentique' },
  { value: '5 ★',  label: 'Satisfaction' },
  { value: '2015', label: 'Depuis' },
];

const GALLERY = ['/PagneTisse2.jpg', '/PagneTisse3.jpg', '/PagneTisse4.jpg', '/background.png'];

/* ══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [products, setProducts] = useState(defaultProducts);
  const [cat, setCat] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeProducts(
      (items) => { if (items.length) setProducts(items); },
      (err)   => console.warn('[Firebase] produits :', err),
    );
    return unsub;
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(cat === 'all' ? '/boutique' : `/boutique?cat=${cat}`);
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO — image dominante + overlay (style référence)
      ══════════════════════════════════════════════════════ */}
      <section className="relative bg-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 sm:pb-32">
          <div className="relative rounded-[2rem] overflow-hidden min-h-[520px] sm:min-h-[560px] flex items-center">

            {/* Image de fond */}
            <img
              src="/background.png"
              alt="Pagnes tissés du Burkina Faso"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay gradient navy → transparent (texte lisible à gauche) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent"
            />

            {/* Contenu */}
            <div className="relative z-10 px-6 sm:px-12 lg:px-16 py-12 max-w-2xl">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/85">
                  Ouagadougou · Burkina Faso
                </span>
              </div>

              <h1 className="font-serif font-bold text-white leading-[1.05] text-5xl sm:text-6xl lg:text-7xl mb-6">
                Trouvez Votre<br />
                <span className="text-amber-400 italic">Pagne Idéal</span>
              </h1>

              <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-md mb-9 font-light">
                Tissus authentiques du Burkina Faso, tissés main selon les traditions.
                Chaque pagne est une œuvre d'art.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/boutique"
                  className="inline-flex items-center gap-2.5 rounded-full bg-crimson hover:bg-red-700 text-white font-bold text-[11px] tracking-widest uppercase px-8 py-4 shadow-xl shadow-crimson/30 hover:-translate-y-px transition-all duration-200"
                >
                  <span>Voir la collection</span>
                  <ArrowRight size={15} />
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] tracking-widest uppercase px-8 py-4 transition-all duration-200"
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Barre recherche/filtre flottante (chevauche le hero) ── */}
        <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 z-20 px-4 sm:px-6">
          <form
            onSubmit={handleSearch}
            className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl shadow-navy/20 border border-border p-3 sm:p-4 flex flex-col sm:flex-row gap-3 items-stretch"
          >
            {/* Catégorie */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface">
              <Search size={18} className="text-brand shrink-0" />
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-transparent text-ink text-sm font-medium focus:outline-none cursor-pointer"
                aria-label="Catégorie de pagne"
              >
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{value === 'all' ? 'Toutes les catégories' : label}</option>
                ))}
              </select>
            </div>

            {/* Stats inline (desktop) */}
            <div className="hidden lg:flex items-center gap-6 px-4 border-x border-border">
              {STATS.slice(0, 2).map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-serif font-bold text-lg text-navy leading-none">{value}</div>
                  <div className="text-muted text-[10px] uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy hover:bg-navy-soft text-white font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors shrink-0"
            >
              <Search size={15} />
              <span>Rechercher</span>
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURED — produits + type
      ══════════════════════════════════════════════════════ */}
      <section className="bg-surface pt-28 sm:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-brand text-[11px] font-bold tracking-[0.3em] uppercase mb-2">Collection</p>
              <h2 className="font-serif font-bold text-ink text-3xl sm:text-4xl">Nouveautés &amp; Coups de Cœur</h2>
            </div>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 text-brand hover:text-brand-dark font-bold text-[11px] tracking-widest uppercase transition-colors"
            >
              <span>Tout voir</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BÉNÉFICES — titre gauche + bullets droite (style réf)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 sm:py-28 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Colonne titre */}
          <div>
            <p className="text-brand text-[11px] font-bold tracking-[0.3em] uppercase mb-4">Pourquoi nous choisir</p>
            <h2 className="font-serif font-bold leading-tight text-4xl sm:text-5xl mb-6">
              <span className="text-crimson">L'excellence</span>{' '}
              <span className="text-navy">du tissage burkinabè</span>
            </h2>
            <p className="text-muted leading-relaxed mb-8 max-w-md">
              Depuis 2015, FasoPagnes valorise le savoir-faire des tisserands du Faso.
              Chaque pièce est sélectionnée avec soin pour sa qualité et son authenticité.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 max-w-md">
              {STATS.map(({ value, label }) => (
                <div key={label} className="rounded-2xl bg-surface border border-border px-2 py-4 text-center">
                  <div className="font-serif font-bold text-xl text-navy leading-none mb-1">{value}</div>
                  <div className="text-muted text-[9px] uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne bullets */}
          <div className="space-y-5">
            {BENEFITS.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-5 p-5 rounded-2xl hover:bg-surface transition-colors group">
                <div className="w-12 h-12 rounded-full bg-brand-pale group-hover:bg-brand flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={20} className="text-brand group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-lg mb-1">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GALERIE — grille (style réf)
      ══════════════════════════════════════════════════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Galerie"
            title="Un aperçu de nos tissus"
            subtitle="Des motifs uniques, des couleurs authentiques du Burkina Faso"
            className="mb-14 text-4xl"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Carte texte navy */}
            <div className="col-span-2 lg:col-span-1 rounded-2xl bg-navy p-8 flex flex-col justify-between min-h-[260px]">
              <Sparkles size={28} className="text-amber-400" />
              <div>
                <h3 className="font-serif font-bold text-white text-2xl leading-tight mb-3">
                  Tissés avec passion
                </h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5">
                  Chaque pagne raconte une histoire du patrimoine textile burkinabè.
                </p>
                <Link
                  to="/boutique"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-[11px] tracking-widest uppercase transition-colors"
                >
                  <span>Découvrir</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Images */}
            {GALLERY.map((src, i) => (
              <div
                key={src}
                className={`group relative rounded-2xl overflow-hidden min-h-[260px] ${i === 3 ? 'hidden lg:block' : ''}`}
              >
                <img
                  src={src}
                  alt={`Pagne tissé ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PAIEMENTS — bande bleue
      ══════════════════════════════════════════════════════ */}
      <section className="bg-brand py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-blue-200 text-[11px] font-bold tracking-[0.25em] uppercase mb-2">Paiement flexible</p>
            <h2 className="font-serif font-bold text-white text-2xl sm:text-3xl">Tous les moyens de paiement</h2>
          </div>
          <div className="flex flex-wrap gap-2.5 md:justify-end max-w-xl">
            {PAYMENTS.map(p => (
              <span
                key={p}
                className="rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-default"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TÉMOIGNAGES
      ══════════════════════════════════════════════════════ */}
      <section className="bg-surface py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Témoignages"
            title="Ce que disent nos clients"
            className="mb-14 text-4xl"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <blockquote
                key={r.author}
                className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-5 hover:shadow-lg hover:shadow-brand/8 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={`star-${r.author}-${j}`} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-ink/75 text-sm leading-relaxed italic flex-1">
                  &ldquo;{r.text}&rdquo;
                </p>
                <footer className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-ink text-sm">{r.author}</div>
                    <div className="text-muted text-xs">{r.city}</div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════ */}
      <section className="bg-navy py-20 relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy via-[#0a2a6e]/50 to-navy" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif font-bold text-white text-4xl sm:text-5xl mb-4 leading-tight">
            Prêt à commander ?
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed">
            Contactez-nous sur WhatsApp ou parcourez notre boutique en ligne.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#1DAF54] text-white font-bold text-[11px] tracking-widest uppercase px-8 py-4 shadow-lg shadow-[#25D366]/25 transition-all duration-200"
            >
              <MessageCircle size={17} />
              <span>Commander sur WhatsApp</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] tracking-widest uppercase px-8 py-4 transition-all duration-200"
            >
              <Phone size={15} />
              <span>Nous contacter</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
