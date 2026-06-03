import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Popup : instructions d'un moyen de paiement. */
export default function PaymentModal({ payment, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const modal = (
    <motion.div
      className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-navy/30 overflow-hidden my-auto"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header coloré selon le moyen */}
        <div className="relative px-6 py-5" style={{ background: payment.color }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-black/50 hover:text-black hover:bg-black/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <p className="text-black/60 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
            {payment.short}
          </p>
          <h3 className="font-serif font-bold text-black text-2xl leading-tight">{payment.label}</h3>
        </div>

        {/* Étapes */}
        <div className="p-6">
          <p className="text-muted text-xs uppercase tracking-widest font-bold mb-4">Comment procéder</p>
          <ol className="space-y-3.5">
            {payment.steps.map((step, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="shrink-0 w-7 h-7 rounded-full bg-brand-pale text-brand font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-ink text-sm leading-relaxed pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
