import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, MessageCircle, Loader2, CheckCircle2, Download, Mail } from 'lucide-react';
import { saveOrder, uid } from '../services/firebase';
import { categoryLabel, WHATSAPP } from '../constants/theme';
import { downloadReceipt, emailReceipt } from '../lib/receipt';
import { PAYMENTS, findPayment } from '../data/payments';

/**
 * OrderModal — collecte infos client AVANT WhatsApp.
 * 1. Formulaire → 2. Sauvegarde Firestore → 3. Écran succès (WhatsApp / reçu PDF / mail)
 * Rendu via portal sur document.body pour éviter les bugs de transform parent.
 */
export default function OrderModal({ product, onClose }) {
  const [form, setForm]       = useState({ name: '', phone: '', email: '', qty: 1, payment: '', note: '' });
  const [sending, setSending] = useState(false);
  const [err, setErr]         = useState('');
  const [order, setOrder]     = useState(null);   // commande confirmée → écran succès

  const price = typeof product.price === 'number'
    ? product.price.toLocaleString('fr-FR')
    : String(product.price ?? '');

  // Bloque le scroll de fond + ferme à Échap
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function buildWaUrl(o) {
    const lines = [
      'Bonjour, je souhaite commander :',
      `${product.name} (${categoryLabel(product.type)}) x${o.items[0].qty}`,
      `Prix : ${price} FCFA`,
      `Nom : ${o.clientName}`,
      `Telephone : ${o.clientPhone}`,
      o.clientEmail ? `Email : ${o.clientEmail}` : '',
      o.paymentLabel ? `Paiement : ${o.paymentLabel}` : '',
      o.note ? `Precision : ${o.note}` : '',
      `Ref : ${o.id.slice(0, 8).toUpperCase()}`,
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setErr('Nom et numéro WhatsApp obligatoires.');
      return;
    }
    setSending(true); setErr('');

    const qty = Math.max(1, Number(form.qty) || 1);
    const pay = findPayment(form.payment);
    const newOrder = {
      id: uid(),
      clientName:  form.name.trim(),
      clientPhone: form.phone.trim(),
      clientEmail: form.email.trim(),
      paymentId: form.payment || '',
      paymentLabel: pay?.label || '',
      items: [{ productId: product.id, name: product.name, type: product.type, qty, price }],
      note: form.note.trim(),
      status: 'en attente',
      createdAt: new Date().toISOString(),
    };

    try {
      await saveOrder(newOrder);
    } catch (e2) {
      console.warn('[Commande] Firestore :', e2);
    }

    setSending(false);
    setOrder(newOrder);   // → écran succès
  }

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

        {/* ── Header ── */}
        <div className="relative bg-navy px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-1">
            {order ? 'Commande enregistrée' : 'Commande'}
          </p>
          <h3 className="font-serif font-bold text-white text-xl leading-tight pr-8">{product.name}</h3>
          <p className="text-white/55 text-sm mt-1">
            <span className="text-amber-400 font-bold">{price} FCFA</span> · {categoryLabel(product.type)}
          </p>
        </div>

        {/* ── Écran succès ── */}
        {order ? (
          <div className="p-6 space-y-5">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={30} className="text-green-600" />
              </div>
              <div>
                <p className="font-serif font-bold text-ink text-lg">Merci {order.clientName.split(' ')[0]} !</p>
                <p className="text-muted text-sm mt-1">
                  Réf. <span className="font-bold text-ink">{order.id.slice(0, 8).toUpperCase()}</span>.
                  Confirmez sur WhatsApp ou téléchargez votre reçu.
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <a
              href={buildWaUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] hover:bg-[#1DAF54] text-white font-bold text-xs tracking-widest uppercase px-6 py-3.5 shadow-lg shadow-[#25D366]/25 transition-all duration-200"
            >
              <MessageCircle size={17} />
              <span>Confirmer sur WhatsApp</span>
            </a>

            {/* Reçu + mail */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => downloadReceipt(order).catch(err => console.warn('[Reçu]', err))}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border hover:border-navy/30 hover:bg-surface text-ink font-bold text-[11px] tracking-wide uppercase px-4 py-3 transition-all"
              >
                <Download size={15} />
                <span>Reçu PDF</span>
              </button>
              <a
                href={emailReceipt(order)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border hover:border-navy/30 hover:bg-surface text-ink font-bold text-[11px] tracking-wide uppercase px-4 py-3 transition-all"
              >
                <Mail size={15} />
                <span>Par mail</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-muted hover:text-ink text-xs font-bold uppercase tracking-widest py-2 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* ── Formulaire ── */
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
            <p className="text-muted text-xs leading-relaxed">
              Laissez vos coordonnées, nous confirmons votre commande rapidement.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="o-name" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Nom *</label>
                <input
                  id="o-name" type="text" required placeholder="Votre nom"
                  value={form.name} onChange={(e) => update('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label htmlFor="o-qty" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Quantité</label>
                <input
                  id="o-qty" type="number" min="1" value={form.qty}
                  onChange={(e) => update('qty', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="o-phone" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">WhatsApp / Téléphone *</label>
              <input
                id="o-phone" type="tel" required placeholder="+226 ..."
                value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label htmlFor="o-email" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Email (facultatif)</label>
              <input
                id="o-email" type="email" placeholder="vous@email.com"
                value={form.email} onChange={(e) => update('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-ink text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label htmlFor="o-pay" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Moyen de paiement souhaité</label>
              <select
                id="o-pay"
                value={form.payment}
                onChange={(e) => update('payment', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              >
                <option value="">— Choisir (facultatif) —</option>
                {PAYMENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="o-note" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">Précision (couleur, taille, adresse…)</label>
              <textarea
                id="o-note" rows={2} placeholder="Votre message…"
                value={form.note} onChange={(e) => update('note', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border text-ink text-sm placeholder:text-muted/60 resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
              />
            </div>

            {err && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{err}</p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-full bg-brand hover:bg-brand-dark text-white font-bold text-xs tracking-widest uppercase px-6 py-3.5 shadow-lg shadow-brand/25 transition-all duration-200 disabled:opacity-60"
            >
              {sending ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
              <span>{sending ? 'Enregistrement…' : 'Valider la commande'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );

  return createPortal(modal, document.body);
}
