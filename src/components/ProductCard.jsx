import { useState } from 'react';
import { shape, string, number, oneOfType } from 'prop-types';

import { ShoppingCart, ImageOff } from 'lucide-react';
import { Badge } from './ui/Badge';
import OrderModal from './OrderModal';
import { categoryLabel } from '../constants/theme';

export default function ProductCard({ product }) {
  const [showOrder, setShowOrder] = useState(false);

  const price =
    typeof product.price === 'number'
      ? product.price.toLocaleString('fr-FR')
      : String(product.price ?? '');

  return (
    <article className="group relative flex flex-col bg-white border border-border hover:border-brand/30 shadow-sm hover:shadow-xl hover:shadow-brand/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden rounded-2xl">

      {/* ── Image ────────────────────────────────────────── */}
      <div className="relative overflow-hidden aspect-[4/3] bg-surface">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-border">
            <ImageOff size={36} />
            <span className="text-xs uppercase tracking-wide">Image indisponible</span>
          </div>
        )}

        {/* Overlay gradient au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge catégorie */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="red">{categoryLabel(product.type)}</Badge>
        </div>

        {/* Bouton Commander — apparaît au survol (desktop) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowOrder(true)}
            className="w-full flex items-center justify-center gap-2 bg-white text-navy font-bold text-[11px] tracking-widest uppercase py-2.5 hover:bg-brand hover:text-white transition-colors duration-200 shadow-lg rounded-full"
          >
            <ShoppingCart size={13} />
            <span>Commander</span>
          </button>
        </div>
      </div>

      {/* ── Corps ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-ink text-[15px] leading-snug mb-1.5 group-hover:text-brand transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-muted text-[13px] leading-relaxed line-clamp-2">
            {product.desc}
          </p>
        </div>

        {/* Prix + CTA mobile */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="font-serif text-xl font-bold text-amber-600">{price}</span>
            <span className="text-muted text-xs font-sans ml-1">FCFA</span>
          </div>
          <button
            type="button"
            onClick={() => setShowOrder(true)}
            className="md:hidden flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 transition-colors shadow-sm rounded-full"
          >
            <ShoppingCart size={12} />
            <span>Commander</span>
          </button>
        </div>
      </div>

      {showOrder && (
        <OrderModal product={product} onClose={() => setShowOrder(false)} />
      )}
    </article>
  );
}

ProductCard.propTypes = {
  product: shape({
    name:  string.isRequired,
    type:  string.isRequired,
    price: oneOfType([string, number]).isRequired,
    desc:  string,
    image: string,
  }).isRequired,
};
