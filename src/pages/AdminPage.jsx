import { useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Plus, Pencil, Trash2, Check, X, Upload, LogOut, ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import {
  firebaseAuth, subscribeProducts, subscribeOrders,
  saveProduct, deleteProduct as fbDeleteProduct,
  updateOrderStatus, deleteOrder as fbDeleteOrder,
  authErrorMsg, uid, signInWithGoogle,
} from '../services/firebase';
import { uploadImageToImgBB } from '../services/imgbb';
import { defaultProducts } from '../data/products';
import { CATEGORIES, categoryLabel } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { cn } from '../lib/utils';

/* ── Constantes ─────────────────────────────────────────────────── */
const PRODUCT_TYPES = CATEGORIES.filter(c => c.value !== 'all');
const EMPTY_FORM    = { name: '', type: 'tisse', price: '', desc: '', image: '' };

const STATUS_MAP = {
  'confirmée': { label: 'Confirmée', variant: 'blue' },
  'livrée':    { label: 'Livrée',    variant: 'green' },
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return iso ?? '—'; }
}

function deriveCustomers(orders) {
  const map = new Map();
  orders.forEach(o => {
    const phone = String(o.clientPhone ?? '').trim();
    if (!phone) return;
    const name = String(o.clientName ?? 'Client').trim();
    const at   = o.createdAt ?? new Date().toISOString();
    if (!map.has(phone)) map.set(phone, { phone, name, count: 0, first: at, last: at });
    const c = map.get(phone);
    c.count += 1;
    if (at < c.first) c.first = at;
    if (at > c.last)  c.last  = at;
  });
  return [...map.values()].sort((a, b) => b.last.localeCompare(a.last));
}

/* ── Sous-composant : Th / Td de table ─────────────────────────── */
function Th({ children }) {
  return (
    <th className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted bg-surface border-b border-border whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className }) {
  return (
    <td className={cn('px-5 py-3.5 text-sm text-muted border-b border-border align-top', className)}>
      {children}
    </td>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  /* ── Auth ────────────────────────────────────────────────────── */
  const [user, setUser]           = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail]         = useState('');
  const [pass, setPass]           = useState('');
  const [authErr, setAuthErr]     = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  /* ── Data ────────────────────────────────────────────────────── */
  const [products, setProducts] = useState(defaultProducts);
  const [orders, setOrders]     = useState([]);
  const [tab, setTab]           = useState('products');

  /* ── Modal formulaire produit ────────────────────────────────── */
  const [showModal, setShowModal]   = useState(false);
  const [editIdx, setEditIdx]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [uploading, setUploading]   = useState(false);
  const [uploadMsg, setUploadMsg]   = useState('');

  /* ── Subscriptions ───────────────────────────────────────────── */
  useEffect(() => {
    if (!firebaseAuth) { setAuthReady(true); return; }
    return onAuthStateChanged(firebaseAuth, u => { setUser(u); setAuthReady(true); });
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubP = subscribeProducts(setProducts, err => console.warn('[Admin] produits', err));
    const unsubO = subscribeOrders(setOrders,   err => console.warn('[Admin] commandes', err));
    return () => { unsubP(); unsubO(); };
  }, [user]);

  /* ── Auth handlers ───────────────────────────────────────────── */
  async function handleLogin(e) {
    e.preventDefault();
    if (!firebaseAuth) { setAuthErr('Firebase non configuré.'); return; }
    setLoggingIn(true); setAuthErr('');
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, pass);
      setPass('');
    } catch (err) {
      setAuthErr(authErrorMsg(err));
    } finally { setLoggingIn(false); }
  }

  async function handleGoogleLogin() {
    setLoggingIn(true); setAuthErr('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthErr(authErrorMsg(err));
    } finally { setLoggingIn(false); }
  }

  /* ── Formulaire produit ──────────────────────────────────────── */
  const openNew = useCallback(() => {
    setForm(EMPTY_FORM); setEditIdx(null); setUploadMsg(''); setShowModal(true);
  }, []);

  const openEdit = useCallback((p, i) => {
    setForm({ name: p.name, type: p.type, price: String(p.price), desc: p.desc, image: p.image ?? '' });
    setEditIdx(i); setUploadMsg(''); setShowModal(true);
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadMsg('Upload en cours…');
    try {
      const url = await uploadImageToImgBB(file);
      setForm(f => ({ ...f, image: url }));
      setUploadMsg('Image uploadée avec succès.');
    } catch (err) {
      setUploadMsg(err.message ?? 'Erreur upload');
    } finally { setUploading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    const { name, type, price, desc, image } = form;
    if (!name || !price || !desc) { alert('Nom, prix et description requis.'); return; }
    const existing = editIdx !== null ? products[editIdx] : null;
    const payload  = {
      id: existing?.id ?? uid(),
      name: name.trim(), type,
      price: price.trim(), desc: desc.trim(),
      image: image.trim() || '/background.jpg',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try { await saveProduct(payload); setShowModal(false); }
    catch (err) { alert('Erreur Firestore : ' + err.message); }
  }

  async function handleDeleteProduct(p) {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    await fbDeleteProduct(p.id).catch(console.warn);
  }

  async function handleOrderStatus(o, status) {
    await updateOrderStatus(o.id, status).catch(console.warn);
  }
  async function handleDeleteOrder(o) {
    if (!confirm('Supprimer cette commande ?')) return;
    await fbDeleteOrder(o.id).catch(console.warn);
  }

  const customers = deriveCustomers(orders);

  /* ── Loading ─────────────────────────────────────────────────── */
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Écran de connexion ──────────────────────────────────────── */
  if (!user) {
    return (
      <>
        <div className="bg-navy py-16 text-center">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader eyebrow="Espace privé" title="Administration" theme="dark" />
          </div>
        </div>

        <div className="bg-surface min-h-[60vh] flex items-start justify-center py-16 px-4">
          <div className="w-full max-w-md bg-white border border-border rounded-3xl shadow-xl shadow-ink/8 overflow-hidden">

            {/* Header carte */}
            <div className="bg-navy px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Connexion administrateur</div>
                <div className="text-white/50 text-xs">Accès réservé</div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleLogin} noValidate className="p-6 space-y-4">
              <div>
                <label htmlFor="a-email" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                  Email
                </label>
                <input
                  id="a-email" type="email" required autoComplete="username"
                  placeholder="admin@fasopagnes.bf"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label htmlFor="a-pass" className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-1.5">
                  Mot de passe
                </label>
                <input
                  id="a-pass" type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={pass} onChange={e => setPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              {authErr && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                  <X size={15} className="mt-0.5 shrink-0" />
                  <span>{authErr}</span>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loggingIn}>
                {loggingIn ? 'Connexion…' : 'Se connecter'}
              </Button>

              {/* Séparateur */}
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">ou</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loggingIn}
                className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-border hover:border-navy/30 hover:bg-surface text-ink font-bold text-xs tracking-wide px-6 py-3.5 transition-all duration-200 disabled:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
                </svg>
                <span>Continuer avec Google</span>
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  /* ── Dashboard ───────────────────────────────────────────────── */
  const pending = orders.filter(o => !o.status || o.status === 'en attente').length;

  const STAT_CARDS = [
    { icon: Package,     label: 'Pagnes',       value: products.length,  color: 'text-brand' },
    { icon: ShoppingCart,label: 'Commandes',    value: orders.length,    color: 'text-brand' },
    { icon: ShoppingCart,label: 'En attente',   value: pending,          color: 'text-amber-500' },
    { icon: Users,       label: 'Clients',      value: customers.length, color: 'text-brand' },
  ];

  const TABS = [
    { key: 'products',  label: 'Pagnes',    Icon: Package,     count: products.length },
    { key: 'orders',    label: 'Commandes', Icon: ShoppingCart,count: orders.length },
    { key: 'customers', label: 'Clients',   Icon: Users,       count: customers.length },
  ];

  return (
    <>
      {/* ── Header dashboard ─────────────────────────────────── */}
      <div className="bg-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} className="text-brand" />
            <div>
              <h1 className="font-serif font-bold text-white text-2xl leading-none">Dashboard</h1>
              <p className="text-white/40 text-xs mt-1">{user.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut(firebaseAuth).catch(console.warn)}
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>

      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── Statistiques ───────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-brand-pale flex items-center justify-center shrink-0">
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <div className="font-serif font-bold text-ink text-2xl leading-none">{value}</div>
                  <div className="text-muted text-xs uppercase tracking-wider mt-1">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Onglets ─────────────────────────────────────── */}
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">

            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map(({ key, label, Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-2.5 px-6 py-4 text-[11px] font-bold uppercase tracking-widest border-b-2 whitespace-nowrap transition-all duration-200',
                    tab === key
                      ? 'border-brand text-brand bg-brand-pale/50'
                      : 'border-transparent text-muted hover:text-ink hover:bg-surface',
                  )}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  <span className={cn('text-[10px] px-2 py-0.5 font-bold rounded-full', tab === key ? 'bg-brand text-white' : 'bg-surface text-muted')}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── TAB : Pagnes ───────────────────────────────── */}
            {tab === 'products' && (
              <div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-ink">Gestion des pagnes</h2>
                  <Button variant="primary" size="sm" onClick={openNew}>
                    <Plus size={14} />
                    <span>Nouveau pagne</span>
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <Th>Image</Th><Th>Nom</Th><Th>Type</Th><Th>Prix</Th><Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 && (
                        <tr><Td className="text-center py-12" colSpan={5}>Aucun pagne enregistré.</Td></tr>
                      )}
                      {products.map((p, i) => (
                        <tr key={p.id} className="hover:bg-surface/70 transition-colors">
                          <Td>
                            {p.image
                              ? <img src={p.image} alt={p.name} className="w-14 h-14 object-cover border border-border" />
                              : <div className="w-14 h-14 bg-surface border border-border flex items-center justify-center text-border"><Package size={20} /></div>
                            }
                          </Td>
                          <Td><span className="font-semibold text-ink">{p.name}</span></Td>
                          <Td><Badge variant="blue">{categoryLabel(p.type)}</Badge></Td>
                          <Td><span className="font-serif font-bold text-amber-600">{p.price} FCFA</span></Td>
                          <Td>
                            <div className="flex gap-2">
                              <button onClick={() => openEdit(p, i)} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand hover:bg-brand hover:text-white border border-brand px-3 py-1.5 transition-colors">
                                <Pencil size={11} /><span>Modifier</span>
                              </button>
                              <button onClick={() => handleDeleteProduct(p)} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-crimson hover:bg-crimson hover:text-white border border-crimson px-3 py-1.5 transition-colors">
                                <Trash2 size={11} /><span>Supprimer</span>
                              </button>
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB : Commandes ─────────────────────────────── */}
            {tab === 'orders' && (
              <div>
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-ink">Gestion des commandes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr><Th>Client</Th><Th>Article / Qté</Th><Th>Statut</Th><Th>Date</Th><Th>Actions</Th></tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 && (
                        <tr><Td className="text-center py-12">Aucune commande reçue.</Td></tr>
                      )}
                      {orders.map(o => {
                        const statusInfo = STATUS_MAP[o.status];
                        return (
                          <tr key={o.id} className="hover:bg-surface/70 transition-colors">
                            <Td>
                              <div className="font-semibold text-ink text-sm">{o.clientName}</div>
                              <a href={`https://wa.me/${String(o.clientPhone ?? '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline block">
                                {o.clientPhone}
                              </a>
                              {o.clientEmail && (
                                <a href={`mailto:${o.clientEmail}`} className="text-xs text-muted hover:text-brand block truncate max-w-[160px]">
                                  {o.clientEmail}
                                </a>
                              )}
                            </Td>
                            <Td>
                              {(o.items ?? []).map((it, j) => (
                                <div key={`${o.id}-item-${j}`} className="text-xs">
                                  {it.name} <span className="text-brand font-bold">×{it.qty}</span>
                                </div>
                              ))}
                            </Td>
                            <Td>
                              <Badge variant={statusInfo?.variant ?? 'gold'}>
                                {statusInfo?.label ?? 'En attente'}
                              </Badge>
                            </Td>
                            <Td><span className="text-xs">{formatDate(o.createdAt)}</span></Td>
                            <Td>
                              <div className="flex flex-wrap gap-1.5">
                                <button onClick={() => handleOrderStatus(o, 'confirmée')} className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand hover:bg-brand hover:text-white border border-brand px-2.5 py-1 transition-colors">
                                  <Check size={10} /><span>Confirmer</span>
                                </button>
                                <button onClick={() => handleOrderStatus(o, 'livrée')} className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 hover:bg-green-600 hover:text-white border border-green-500 px-2.5 py-1 transition-colors">
                                  <ChevronRight size={10} /><span>Livrer</span>
                                </button>
                                <button onClick={() => handleDeleteOrder(o)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-crimson hover:bg-crimson hover:text-white border border-crimson px-2.5 py-1 transition-colors">
                                  <Trash2 size={10} /><span>Annuler</span>
                                </button>
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB : Clients ───────────────────────────────── */}
            {tab === 'customers' && (
              <div>
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-ink">Fiches clients</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr><Th>Nom</Th><Th>Téléphone</Th><Th>Commandes</Th><Th>Première</Th><Th>Dernière</Th></tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 && (
                        <tr><Td className="text-center py-12">Aucun client enregistré.</Td></tr>
                      )}
                      {customers.map(c => (
                        <tr key={c.phone} className="hover:bg-surface/70 transition-colors">
                          <Td><span className="font-semibold text-ink">{c.name}</span></Td>
                          <Td>{c.phone}</Td>
                          <Td><Badge variant="blue">{c.count}</Badge></Td>
                          <Td><span className="text-xs">{formatDate(c.first)}</span></Td>
                          <Td><span className="text-xs">{formatDate(c.last)}</span></Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Modal formulaire pagne ══════════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl shadow-ink/20">

            {/* Header modal */}
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-serif font-bold text-ink text-xl">
                {editIdx !== null ? 'Modifier le pagne' : 'Nouveau pagne'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink hover:bg-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="p-6 space-y-5">
              {/* Nom + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="p-name" className="block text-[10px] font-bold uppercase tracking-widest text-muted">Nom *</label>
                  <input id="p-name" type="text" required placeholder="Pagne Bogolan Premium"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="p-type" className="block text-[10px] font-bold uppercase tracking-widest text-muted">Catégorie *</label>
                  <select id="p-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  >
                    {PRODUCT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prix + URL image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="p-price" className="block text-[10px] font-bold uppercase tracking-widest text-muted">Prix (FCFA) *</label>
                  <input id="p-price" type="text" required placeholder="15 000"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="p-url" className="block text-[10px] font-bold uppercase tracking-widest text-muted">URL de l'image</label>
                  <input id="p-url" type="url" placeholder="https://…"
                    value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                  />
                </div>
              </div>

              {/* Upload image */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Ou uploader une image</p>
                <label
                  htmlFor="p-upload"
                  className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border hover:border-brand bg-surface hover:bg-brand-pale/30 cursor-pointer p-8 transition-all duration-200 group"
                >
                  {form.image ? (
                    <img src={form.image} alt="Aperçu" className="w-24 h-24 object-cover border border-border" />
                  ) : (
                    <Upload size={28} className="text-border group-hover:text-brand transition-colors" />
                  )}
                  <span className="text-xs text-muted group-hover:text-brand transition-colors font-medium">
                    {uploading ? 'Upload en cours…' : 'Cliquer pour choisir un fichier'}
                  </span>
                  <input id="p-upload" type="file" accept="image/*" className="sr-only"
                    onChange={handleUpload} disabled={uploading}
                  />
                </label>
                {uploadMsg && (
                  <p className={cn('text-xs flex items-center gap-1.5', uploadMsg.includes('succès') ? 'text-green-600' : 'text-crimson')}>
                    {uploadMsg.includes('succès') ? <Check size={12} /> : <X size={12} />}
                    {uploadMsg}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="p-desc" className="block text-[10px] font-bold uppercase tracking-widest text-muted">Description *</label>
                <textarea id="p-desc" required rows={3} placeholder="Décrivez ce pagne…"
                  value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border text-ink text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={uploading}>
                  <Check size={15} />
                  <span>Enregistrer</span>
                </Button>
                <Button type="button" variant="muted" size="lg" className="px-6" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
