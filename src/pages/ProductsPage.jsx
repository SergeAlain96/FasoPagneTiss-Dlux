import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import { SectionHeader } from '../components/ui/SectionHeader';
import { subscribeProducts } from '../services/firebase';
import { defaultProducts } from '../data/products';
import { CATEGORIES } from '../constants/theme';

const VALID_CATS = CATEGORIES.map(c => c.value);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCat = searchParams.get('cat');
  const cat = VALID_CATS.includes(urlCat) ? urlCat : 'all';

  function setCat(value) {
    if (value === 'all') setSearchParams({}, { replace: true });
    else setSearchParams({ cat: value }, { replace: true });
  }

  useEffect(() => {
    const unsub = subscribeProducts(
      (items) => { setProducts(items.length ? items : defaultProducts); setLoaded(true); },
      (err)   => { console.warn('[Firebase] produits :', err); setProducts(defaultProducts); setLoaded(true); },
    );
    return unsub;
  }, []);

  const filtered = cat === 'all' ? products : products.filter(p => p.type === cat);

  return (
    <>
      {/* ── En-tête navy ─────────────────────────────────────── */}
      <div className="bg-navy py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Catalogue"
            title="Notre Boutique"
            subtitle="Pagnes tissés, batiks, kokodonda, bogolla, galani et accessoires du Burkina Faso"
            theme="dark"
            className="[&_h2]:text-4xl sm:[&_h2]:text-5xl"
          />
        </div>
      </div>

      {/* ── Filtres (sticky sous la navbar) ─────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-border shadow-sm shadow-ink/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="flex gap-2 overflow-x-auto py-3.5"
            style={{ scrollbarWidth: 'none' }}
          >
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setCat(value)}
                aria-pressed={cat === value}
                className={`shrink-0 text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-full transition-all duration-200 ${
                  cat === value
                    ? 'bg-navy text-white'
                    : 'border border-border text-muted hover:border-navy hover:text-navy bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grille produits ─────────────────────────────────────── */}
      <div className="bg-surface py-10 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {!loaded ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length > 0 ? (
            <>
              <p className="text-muted text-xs uppercase tracking-widest font-bold mb-6">
                {filtered.length} pagne{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted">
              <PackageSearch size={48} className="text-border" />
              <p className="text-sm">Aucun pagne dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
