import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

function buildConfig() {
  if (typeof window !== 'undefined' && window.FASOPAGNES_FIREBASE_CONFIG) {
    return window.FASOPAGNES_FIREBASE_CONFIG;
  }
  return {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

function isConfigured(cfg) {
  return Boolean(cfg?.apiKey && cfg?.authDomain && cfg?.projectId);
}

const cfg = buildConfig();
const firebaseApp = isConfigured(cfg)
  ? (getApps().length ? getApps()[0] : initializeApp(cfg))
  : null;

export const firebaseEnabled = Boolean(firebaseApp);
export const firebaseAuth    = firebaseApp ? getAuth(firebaseApp)      : null;
export const firebaseDb      = firebaseApp ? getFirestore(firebaseApp) : null;

/* ── Connexion Google ────────────────────────────────────────── */
export function signInWithGoogle() {
  if (!firebaseAuth) return Promise.reject(new Error('Firebase non configuré.'));
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(firebaseAuth, provider);
}

/* ── Collections ─────────────────────────────────────────────── */
export function productsCol() {
  return firebaseDb ? collection(firebaseDb, 'products') : null;
}
export function ordersCol() {
  return firebaseDb ? collection(firebaseDb, 'orders') : null;
}

/* ── Real-time subscriptions ─────────────────────────────────── */
export function subscribeProducts(onData, onError) {
  const col = productsCol();
  if (!col) return () => {};
  const q = query(col, orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

export function subscribeOrders(onData, onError) {
  const col = ordersCol();
  if (!col) return () => {};
  const q = query(col, orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() }))), onError);
}

/* ── Products CRUD ───────────────────────────────────────────── */
export function saveProduct(product) {
  const col = productsCol();
  if (!col) return Promise.resolve();
  return setDoc(doc(col, product.id), product, { merge: true });
}

export function deleteProduct(productId) {
  const col = productsCol();
  if (!col) return Promise.resolve();
  return deleteDoc(doc(col, productId));
}

/* ── Orders CRUD ─────────────────────────────────────────────── */
export function saveOrder(order) {
  const col = ordersCol();
  if (!col) return Promise.resolve();
  return setDoc(doc(col, order.id), order, { merge: true });
}

export function updateOrderStatus(orderId, status) {
  const col = ordersCol();
  if (!col) return Promise.resolve();
  return setDoc(doc(col, orderId), { status, updatedAt: new Date().toISOString() }, { merge: true });
}

export function deleteOrder(orderId) {
  const col = ordersCol();
  if (!col) return Promise.resolve();
  return deleteDoc(doc(col, orderId));
}

/* ── Auth error helper ───────────────────────────────────────── */
export function authErrorMsg(err) {
  const code = err?.code ?? '';
  if (code === 'auth/invalid-email') return 'Adresse email invalide.';
  if (code === 'auth/user-disabled') return 'Ce compte est désactivé.';
  if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(code))
    return 'Email ou mot de passe incorrect.';
  if (code === 'auth/too-many-requests') return 'Trop de tentatives. Réessayez plus tard.';
  if (code === 'auth/network-request-failed') return 'Vérifiez votre connexion réseau.';
  return err instanceof Error ? err.message : 'Connexion impossible.';
}

/* ── UID helper ──────────────────────────────────────────────── */
export function uid() {
  return crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
