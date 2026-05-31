const STORAGE_PRODUCTS = 'faspagnes_products_v2';
const STORAGE_ORDERS = 'faspagnes_orders_v2';
const ORDER_EMAIL = 'contact@fasopagnes.bf';
const SELLER_WHATSAPP = '22663240663';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Faso2026!';
const IMGBB_API_KEY = '3693b780e2a691fdbad5f3bda9fcf716';
const FIREBASE_CONFIG = globalThis.FASOPAGNES_FIREBASE_CONFIG || null;
const APP_STATE = {
  products: [],
  orders: [],
  customers: [],
};
const FIREBASE_STATE = {
  enabled: false,
  db: null,
  storage: null,
};
let LAST_UPLOADED_IMAGE_URL = '';
let CURRENT_PRODUCT_IMAGE_URL = '';
let SELECTED_PRODUCT_UPLOAD_FILE = null;
const FIXED_TYPES = [
  { value: 'tisse', label: 'Tissé' },
  { value: 'batiks', label: 'Batiks' },
  { value: 'kokodonda', label: 'Kokodonda' },
  { value: 'bogolla', label: 'Bogolla' },
  { value: 'galani', label: 'Galani' },
  { value: 'accessoire', label: 'Accessoire' },
];

const DEFAULT_PRODUCTS = [
  { id: uid(), name: 'Pagne Bogolan Premium', type: 'tisse', price: '18 000', desc: 'Motifs géométriques traditionnels. Colorants naturels.', image: 'PagneTisse1.jpg' },
  { id: uid(), name: 'Pagne Faso Dan Fani', type: 'tisse', price: '12 000', desc: 'Tissé à la main par des artisans de Koudougou.', image: 'PagneTisse4.jpg' },
  { id: uid(), name: 'Batik Tremblant', type: 'batiks', price: '9 500', desc: 'Batik tremblant aux couleurs vives, parfait pour des tenues élégantes.', image: 'PagneTisse2.jpg' },
  { id: uid(), name: 'Batik Coton', type: 'batiks', price: '8 000', desc: 'Batik en coton confortable, idéal pour un usage quotidien.', image: 'PagneTisse3.jpg' },
  { id: uid(), name: 'Kokodonda Bleu Royal', type: 'kokodonda', price: '25 000', desc: 'Kokodonda de qualité supérieure, teinture artisanale durable.', image: 'PagneTisse3.jpg' },
  { id: uid(), name: 'Kokodonda Doré Brodé', type: 'kokodonda', price: '30 000', desc: 'Kokodonda premium avec finitions raffinées pour grandes occasions.', image: 'PagneTisse2.jpg' },
  { id: uid(), name: 'Bogolla Prestige', type: 'bogolla', price: '16 000', desc: 'Bogolla authentique au style moderne, coupe polyvalente.', image: 'PagneTisse1.jpg' },
  { id: uid(), name: 'Galani Signature', type: 'galani', price: '14 000', desc: 'Galani traditionnel avec motifs élégants et résistants.', image: 'PagneTisse4.jpg' },
  { id: uid(), name: 'Écharpe Tissée', type: 'accessoire', price: '5 000', desc: 'Accessoire en tissu tissé, idéal comme cadeau.', image: 'PagneTisse3.jpg' },
  { id: uid(), name: 'Sac Pagne Traditionnel', type: 'accessoire', price: '8 000', desc: 'Sac artisanal fabriqué à partir de pagnes tissés.', image: 'PagneTisse4.jpg' },
];

function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function isFirebaseConfigured() {
  if (!FIREBASE_CONFIG || typeof FIREBASE_CONFIG !== 'object') return false;
  const required = ['apiKey', 'authDomain', 'projectId'];
  return required.every(key => String(FIREBASE_CONFIG[key] || '').trim().length > 0);
}

async function initFirebase() {
  if (!isFirebaseConfigured()) return;
  
  // Wait for Firebase SDK to load (with timeout)
  let attempts = 0;
  while ((!globalThis.firebase?.initializeApp || !globalThis.firebase?.firestore) && attempts < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  if (!globalThis.firebase?.initializeApp || !globalThis.firebase?.firestore) {
    console.error('[Firebase] SDK failed to load');
    return;
  }

  let app = null;
  if (globalThis.firebase.apps?.length) {
    app = globalThis.firebase.app();
  } else {
    app = globalThis.firebase.initializeApp(FIREBASE_CONFIG);
  }

  if (globalThis.firebase?.analytics) {
    try {
      globalThis.firebase.analytics(app);
    } catch {
      // analytics optional in local/dev contexts
    }
  }

  FIREBASE_STATE.db = globalThis.firebase.firestore();

  // Init Firebase Storage
  if (globalThis.firebase.storage) {
    try {
      FIREBASE_STATE.storage = globalThis.firebase.storage();
      console.log('[Firebase] ✓ Storage connecté');
    } catch (e) {
      console.warn('[Firebase] Storage non disponible :', e);
    }
  }

  FIREBASE_STATE.enabled = true;
  console.log('[Firebase] ✓ Connected to Firestore');
}

function productsDocRef() {
  if (!FIREBASE_STATE.enabled || !FIREBASE_STATE.db) return null;
  return FIREBASE_STATE.db.collection('fasopagnes').doc('products');
}

function ordersDocRef() {
  if (!FIREBASE_STATE.enabled || !FIREBASE_STATE.db) return null;
  return FIREBASE_STATE.db.collection('fasopagnes').doc('orders');
}

function getUploadElements() {
  return {
    fileInput: document.getElementById('product-upload-file'),
    urlInput: document.getElementById('product-upload-url'),
    preview: document.getElementById('product-upload-preview'),
    previewImg: document.getElementById('product-upload-preview-img'),
    status: document.getElementById('product-upload-status'),
  };
}

function setUploadStatus(message) {
  const { status } = getUploadElements();
  if (status) status.textContent = message;
}

function updateUploadPreview(src, title = 'Aperçu de l’image', subtitle = 'Le fichier choisi apparaîtra ici') {
  const { preview, previewImg } = getUploadElements();
  if (!preview || !previewImg) return;
  previewImg.src = src || '';
  previewImg.classList.toggle('hidden', !src);
  const text = preview.querySelector('.dropzone-text');
  if (text) {
    text.innerHTML = src
      ? `<strong>${title}</strong><span>${subtitle}</span>`
      : '<strong>Aucune image sélectionnée</strong><span>Le fichier choisi apparaîtra ici</span>';
  }
}

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Impossible de lire la photo.'));
    reader.readAsDataURL(file);
  });
}

async function uploadImageFile(file) {
  if (!file) throw new Error('Aucun fichier sélectionné.');
  if (!file.type?.startsWith('image/')) throw new Error('Veuillez sélectionner une image valide.');
  if (file.size > 32 * 1024 * 1024) throw new Error('Image trop lourde. Taille maximale : 32 MB.');

  if (!IMGBB_API_KEY) {
    throw new Error('Clé API ImgBB manquante. Définissez IMGBB_API_KEY en haut de script.js.');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Échec de l'upload (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (!result?.success || !result?.data?.url) {
    throw new Error(result?.error?.message || 'Échec de l\'upload sur ImgBB.');
  }
  return result.data.url;
}

function bindImageUploadSection() {
  const { fileInput } = getUploadElements();
  if (!fileInput || fileInput.dataset.bound === '1') return;
  fileInput.dataset.bound = '1';

  fileInput.addEventListener('change', event => {
    const file = event.target.files?.[0] || null;
    SELECTED_PRODUCT_UPLOAD_FILE = file;
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      updateUploadPreview(objectUrl, 'Image sélectionnée', 'Cliquez sur Uploader l’image');
      setUploadStatus(`Fichier prêt : ${file.name}`);
    } else {
      updateUploadPreview('');
      setUploadStatus('Sélectionnez un fichier puis lancez l’upload.');
    }
  });
}

async function uploadSelectedProductImage() {
  const { urlInput } = getUploadElements();
  if (!SELECTED_PRODUCT_UPLOAD_FILE) {
    alert('Choisissez d’abord une image.');
    return;
  }

  try {
    setUploadStatus('Upload en cours...');
    const url = await uploadImageFile(SELECTED_PRODUCT_UPLOAD_FILE);
    LAST_UPLOADED_IMAGE_URL = url;
    CURRENT_PRODUCT_IMAGE_URL = url;
    if (urlInput) urlInput.value = url;
    updateUploadPreview(url, 'Upload terminé', 'Cette image sera utilisée pour le pagne en cours');
    setUploadStatus('Image prête. Elle sera utilisée quand vous enregistrerez le pagne.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload impossible.';
    setUploadStatus(message);
    alert(message);
  }
}

async function copyUploadedImageUrl() {
  const { urlInput } = getUploadElements();
  const value = String(urlInput?.value || CURRENT_PRODUCT_IMAGE_URL || '').trim();
  if (!value) {
    alert('Aucun lien à copier.');
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    setUploadStatus('Lien copié.');
  } catch {
    alert('Impossible de copier automatiquement.');
  }
}

function loadLocalProducts() {
  const stored = localStorage.getItem(STORAGE_PRODUCTS);
  return stored ? JSON.parse(stored) : [...DEFAULT_PRODUCTS];
}

function loadLocalOrders() {
  const stored = localStorage.getItem(STORAGE_ORDERS);
  return stored ? JSON.parse(stored) : [];
}

function saveLocalProducts(products) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
}

function saveLocalOrders(orders) {
  localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
}

function getProducts() {
  return APP_STATE.products.length ? APP_STATE.products : loadLocalProducts();
}

function getOrders() {
  return APP_STATE.orders.length ? APP_STATE.orders : loadLocalOrders();
}

function saveProducts(products) {
  APP_STATE.products = [...products];
  saveLocalProducts(APP_STATE.products);
  if (FIREBASE_STATE.enabled) {
    void syncProductsToFirebase().catch(() => {});
  }
}

function saveOrders(orders) {
  APP_STATE.orders = [...orders];
  saveLocalOrders(APP_STATE.orders);
  if (FIREBASE_STATE.enabled) {
    void syncOrdersToFirebase().catch(() => {});
  }
}

async function loadProductsFromApi() {
  const localProducts = loadLocalProducts();
  APP_STATE.products = localProducts;

  if (FIREBASE_STATE.enabled) {
    const ref = productsDocRef();
    const snap = ref ? await ref.get() : null;
    const items = Array.isArray(snap?.data()?.items) ? snap.data().items : [];
    if (items.length) {
      APP_STATE.products = items;
    } else if (localProducts.length) {
      await syncProductsToFirebase();
    }
  }

  saveLocalProducts(APP_STATE.products.length ? APP_STATE.products : [...DEFAULT_PRODUCTS]);
  if (!APP_STATE.products.length) APP_STATE.products = [...DEFAULT_PRODUCTS];
}

async function loadOrdersFromApi() {
  const localOrders = loadLocalOrders();
  APP_STATE.orders = localOrders;

  if (FIREBASE_STATE.enabled) {
    const ref = ordersDocRef();
    const snap = ref ? await ref.get() : null;
    const items = Array.isArray(snap?.data()?.items) ? snap.data().items : [];
    if (items.length || localOrders.length === 0) {
      APP_STATE.orders = items;
    } else {
      await syncOrdersToFirebase();
    }
  }

  saveLocalOrders(APP_STATE.orders);
}

async function loadCustomersFromApi() {
  refreshCustomersFromOrders();
}

async function createOrderOnServer(_order) {
  return syncOrdersToFirebase();
}

async function updateOrderOnServer(_orderId, _status) {
  return syncOrdersToFirebase();
}

async function deleteOrderOnServer(_orderId) {
  return syncOrdersToFirebase();
}

async function loginAdminOnServer(username, password) {
  if (username !== ADMIN_USER || password !== ADMIN_PASS) {
    throw new Error('Identifiants invalides.');
  }
}

async function logoutAdminOnServer() {
  return;
}

async function syncProductsToFirebase() {
  if (!FIREBASE_STATE.enabled) return;
  const ref = productsDocRef();
  if (!ref) return;
  await ref.set({ items: APP_STATE.products, updatedAt: new Date().toISOString() }, { merge: true });
}

async function syncOrdersToFirebase() {
  if (!FIREBASE_STATE.enabled) return;
  const ref = ordersDocRef();
  if (!ref) return;
  await ref.set({ items: APP_STATE.orders, updatedAt: new Date().toISOString() }, { merge: true });
}

function refreshCustomersFromOrders() {
  const orders = getOrders();
  const byPhone = new Map();

  orders.forEach(order => {
    const phone = String(order.clientPhone || '').trim();
    if (!phone) return;
    const name = String(order.clientName || '').trim() || 'Client';
    const createdAt = String(order.createdAt || new Date().toISOString());

    if (!byPhone.has(phone)) {
      byPhone.set(phone, {
        id: uid(),
        name,
        phone,
        ordersCount: 0,
        firstOrderAt: createdAt,
        lastOrderAt: createdAt,
      });
    }

    const customer = byPhone.get(phone);
    customer.ordersCount += 1;
    if (new Date(createdAt) < new Date(customer.firstOrderAt)) customer.firstOrderAt = createdAt;
    if (new Date(createdAt) > new Date(customer.lastOrderAt)) customer.lastOrderAt = createdAt;
    if (!customer.name && name) customer.name = name;
  });

  APP_STATE.customers = [...byPhone.values()].sort((a, b) => {
    const ad = new Date(a.lastOrderAt).getTime();
    const bd = new Date(b.lastOrderAt).getTime();
    return bd - ad;
  });
}

function typeLabel(type) {
  const item = FIXED_TYPES.find(t => t.value === type);
  return item ? item.label : type;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return iso;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getProductImageElements() {
  return {
    dropzone: document.getElementById('product-image-dropzone'),
    preview: document.getElementById('product-image-preview'),
  };
}

function updateProductImagePreview(value) {
  const { dropzone, preview } = getProductImageElements();
  if (!dropzone || !preview) return;

  const hasImage = Boolean(value);
  preview.src = value || '';
  preview.classList.toggle('hidden', !hasImage);
  dropzone.classList.toggle('has-image', hasImage);
  const text = dropzone.querySelector('.dropzone-text');
  if (text) {
    text.innerHTML = hasImage
      ? '<strong>Photo définie</strong><span>Modifiez l’URL pour changer l’image</span>'
      : '<strong>Aperçu de l’image</strong><span>Collez l’URL de la photo dans le champ ci-dessous</span>';
  }
}

function setProductImageValue(value) {
  CURRENT_PRODUCT_IMAGE_URL = value || '';
  const { urlInput } = getUploadElements();
  if (urlInput) urlInput.value = CURRENT_PRODUCT_IMAGE_URL;
  updateProductImagePreview(CURRENT_PRODUCT_IMAGE_URL);
  updateUploadPreview(CURRENT_PRODUCT_IMAGE_URL, CURRENT_PRODUCT_IMAGE_URL ? 'Image prête' : 'Aucune image sélectionnée', CURRENT_PRODUCT_IMAGE_URL ? 'Cette image sera utilisée au prochain enregistrement' : 'Le fichier choisi apparaîtra ici');
}

function bindProductImageDropzone() {
  const { dropzone } = getProductImageElements();
  if (!dropzone || dropzone.dataset.bound === '1') return;

  dropzone.dataset.bound = '1';
  updateProductImagePreview('');
}

function seedDefaults() {
  saveProducts([...DEFAULT_PRODUCTS]);
  saveOrders([]);
  refreshAll();
}

function refreshOrderSelect(selectedId) {
  const select = document.getElementById('order-pagne');
  if (!select) return;
  const products = getProducts();
  select.innerHTML = products.map(p => `<option value="${p.id}">${escapeHtml(p.name)} — ${typeLabel(p.type)}</option>`).join('');
  if (selectedId) select.value = selectedId;
}

function refreshAll() {
  renderProducts();
  renderHomeProducts();
  renderAdminProducts();
  renderAdminOrders();
  refreshOrderSelect(document.getElementById('order-pagne')?.value);
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const products = getProducts();
  const filtered = filter === 'all' ? products : products.filter(p => p.type === filter);
  grid.innerHTML = filtered.map(p => `
    <div class="product-card">
      <div class="product-img" style="background-image:url('${p.image}')">
        <span class="product-badge" style="background:var(--ocre)">${typeLabel(p.type)}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-desc">${escapeHtml(p.desc)}</div>
      </div>
      <div class="product-footer">
        <div class="product-price">${escapeHtml(p.price)} <small>FCFA</small></div>
        <button class="btn-add" type="button" onclick="chooseOrderProduct('${p.id}')"><i class="bi bi-whatsapp" aria-hidden="true"></i> Commander</button>
      </div>
    </div>
  `).join('');
}

function renderHomeProducts() {
  const grid = document.getElementById('home-products-grid');
  if (!grid) return;

  const products = getProducts();

  // Afficher un message si aucun produit Firebase (ignorer les DEFAULT_PRODUCTS)
  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-light);">
        <p>Aucun produit disponible pour le moment.<br>Revenez bientôt !</p>
      </div>`;
    return;
  }

  // Afficher les 4 premiers produits (les plus récents en premier)
  const latest = [...products].slice(0, 4);

  grid.innerHTML = latest.map((p, i) => {
    const badge = i === 0 ? '<span class="product-badge">Nouveau</span>' : '';
    // Ignorer les images base64 (corrompues / trop lourdes)
    const imgUrl = p.image && !p.image.startsWith('data:') ? p.image : '';
    const imgStyle = imgUrl ? `background-image:url('${imgUrl}')` : 'background:#e9edf3';
    return `
      <div class="product-card">
        <div class="product-img" style="${imgStyle}">
          ${badge}
        </div>
        <div class="product-info">
          <div class="product-name">${escapeHtml(p.name)}</div>
          <div class="product-desc">${escapeHtml(p.desc)}</div>
        </div>
        <div class="product-footer">
          <div class="product-price">${escapeHtml(p.price)} <small>FCFA</small></div>
          <button class="btn-add" type="button" onclick="chooseOrderProduct('${p.id}')">
            <i class="bi bi-whatsapp" aria-hidden="true"></i> Commander
          </button>
        </div>
      </div>`;
  }).join('');
}

function filterProducts(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function chooseOrderProduct(productId) {
  const product = getProducts().find(p => p.id === productId);
  if (!product) return;
  
  // Pré-remplir le formulaire de commande avec le produit sélectionné
  const productSelect = document.getElementById('order-pagne');
  if (productSelect) {
    productSelect.value = productId;
  }
  
  // Rediriger vers la section de commande
  showSection('order');
}

function chooseOrderProductByName(productName) {
  const product = getProducts().find(p => p.name === productName);
  if (product) {
    chooseOrderProduct(product.id);
    return;
  }
  const message = `Bonjour, je souhaite commander : ${productName}`;
  const url = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

function getProductPublicImageUrl(product) {
  if (!product?.image) return '';
  if (String(product.image).startsWith('data:')) return '';
  try {
    return new URL(product.image, globalThis.location.href).href;
  } catch {
    return '';
  }
}

function buildWhatsAppOrderMessage(product) {
  const lines = [
    `Bonjour, je souhaite commander : ${product.name}`,
    `Type : ${typeLabel(product.type)}`,
  ];
  const imageUrl = getProductPublicImageUrl(product);
  if (imageUrl) {
    lines.push(`Photo : ${imageUrl}`);
  }
  return lines.join('\n');
}

async function submitVisitorOrder() {
  const name = document.getElementById('order-client-name').value.trim();
  const phone = document.getElementById('order-client-phone').value.trim();
  const productId = document.getElementById('order-pagne').value;
  const qty = Number(document.getElementById('order-qty').value || 1);
  const note = document.getElementById('order-note').value.trim();

  if (!name || !phone || !productId || qty < 1) {
    alert('Veuillez remplir le nom, le téléphone, le pagne et la quantité.');
    return;
  }

  const product = getProducts().find(p => p.id === productId);
  if (!product) {
    alert('Le pagne sélectionné est introuvable.');
    return;
  }

  const orders = getOrders();
  const order = {
    id: uid(),
    clientName: name,
    clientPhone: phone,
    items: [{ productId: product.id, name: product.name, type: product.type, qty, price: product.price }],
    note,
    status: 'en attente',
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  saveOrders(orders);
  refreshCustomersFromOrders();
  renderAdminOrders();
  renderAdminCustomers();
  createOrderOnServer(order).catch(() => {});

  alert('Commande enregistrée. Vous pouvez maintenant l’envoyer via WhatsApp.');
  prefillOrderWhatsApp(order);
}

function prefillOrderEmail(orderInput) {
  const name = document.getElementById('order-client-name')?.value.trim() || '';
  const phone = document.getElementById('order-client-phone')?.value.trim() || '';
  const productId = document.getElementById('order-pagne')?.value || '';
  const qty = document.getElementById('order-qty')?.value || '1';
  const note = document.getElementById('order-note')?.value.trim() || '';
  const product = getProducts().find(p => p.id === productId);
  const order = orderInput || {
    clientName: name,
    clientPhone: phone,
    items: [{ name: product?.name || '', type: product?.type || '', qty, price: product?.price || '' }],
    note,
    status: 'en attente',
  };

  const orderLabel = order.items.map(i => i.name + ' (' + typeLabel(i.type) + ') x' + i.qty).join(', ');

  const body = [
    'Nouvelle commande FasoPagnes',
    `Client : ${order.clientName}`,
    `Téléphone : ${order.clientPhone}`,
    'Pagne : ' + orderLabel,
    `Statut : ${order.status}`,
    order.note ? `Note : ${order.note}` : '',
  ].filter(Boolean).join('\n');

  const subject = encodeURIComponent('Commande FasoPagnes Tissé D\'lux');
  const mailBody = encodeURIComponent(body);
  globalThis.location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${mailBody}`;
}

function prefillOrderWhatsApp(orderInput) {
  const name = document.getElementById('order-client-name')?.value.trim() || '';
  const phone = document.getElementById('order-client-phone')?.value.trim() || '';
  const productId = document.getElementById('order-pagne')?.value || '';
  const qty = document.getElementById('order-qty')?.value || '1';
  const note = document.getElementById('order-note')?.value.trim() || '';
  const product = getProducts().find(p => p.id === productId);

  const order = orderInput || {
    clientName: name,
    clientPhone: phone,
    items: [{ name: product?.name || '', type: product?.type || '', qty, price: product?.price || '' }],
    note,
    status: 'en attente',
  };

  const orderLabel = order.items.map(i => `${i.name} (${typeLabel(i.type)}) x${i.qty}`).join(', ');
  const lines = [
    'Bonjour, je souhaite commander :',
    orderLabel,
    order.clientName ? `Nom client : ${order.clientName}` : '',
    order.clientPhone ? `Téléphone : ${order.clientPhone}` : '',
    order.note ? `Précision : ${order.note}` : '',
  ].filter(Boolean);

  const url = `https://wa.me/${SELLER_WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`;
  globalThis.open(url, '_blank', 'noopener');
}

function renderAdminProducts() {
  const tbody = document.getElementById('admin-products-table');
  if (!tbody) return;
  const products = getProducts();
  tbody.innerHTML = products.map((p, index) => `
    <tr>
      <td><img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"></td>
      <td>${escapeHtml(p.name)}</td>
      <td>${typeLabel(p.type)}</td>
      <td>${escapeHtml(p.price)} FCFA</td>
      <td>${escapeHtml(p.desc)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-edit-row" type="button" onclick="openProductForm(${index})">Modifier</button>
          <button class="btn-delete-row" type="button" onclick="deleteProduct(${index})">Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getOrderStatusClass(status) {
  if (status === 'confirmée') return 'st-confirmee';
  if (status === 'livrée') return 'st-livree';
  return 'st-attente';
}

function renderAdminOrders() {
  const tbody = document.getElementById('admin-orders-table');
  if (!tbody) return;
  const orders = getOrders();
  tbody.innerHTML = orders.map((o, index) => `
    <tr>
      <td><strong>${escapeHtml(o.clientName)}</strong><br>${escapeHtml(o.clientPhone)}</td>
      <td>${o.items.map(i => `${escapeHtml(i.name)} x${i.qty}`).join('<br>')}</td>
      <td><span class="status-pill ${getOrderStatusClass(o.status)}">${o.status}</span></td>
      <td>${formatDate(o.createdAt)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-view-row" type="button" onclick="setOrderStatus(${index}, 'confirmée')">Confirmer</button>
          <button class="btn-view-row" type="button" onclick="setOrderStatus(${index}, 'livrée')">Livrer</button>
          <button class="btn-delete-row" type="button" onclick="deleteOrder(${index})">Annuler</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminCustomers() {
  const tbody = document.getElementById('admin-customers-table');
  if (!tbody) return;
  const customers = APP_STATE.customers;
  tbody.innerHTML = customers.map(customer => `
    <tr>
      <td><strong>${escapeHtml(customer.name)}</strong></td>
      <td>${escapeHtml(customer.phone)}</td>
      <td>${customer.ordersCount || 0}</td>
      <td>${customer.firstOrderAt ? formatDate(customer.firstOrderAt) : '-'}</td>
      <td>${customer.lastOrderAt ? formatDate(customer.lastOrderAt) : '-'}</td>
    </tr>
  `).join('');
}

function exportCustomersCsv() {
  const rows = [
    ['Nom', 'Téléphone', 'Nombre de commandes', 'Première commande', 'Dernière commande'],
    ...APP_STATE.customers.map(c => [
      c.name || '',
      c.phone || '',
      String(c.ordersCount || 0),
      c.firstOrderAt ? formatDate(c.firstOrderAt) : '',
      c.lastOrderAt ? formatDate(c.lastOrderAt) : '',
    ]),
  ];

  const csv = rows
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clients-fasopagnes.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function setOrderStatus(index, status) {
  const orders = getOrders();
  if (!orders[index]) return;
  orders[index].status = status;
  saveOrders(orders);
  refreshCustomersFromOrders();
  renderAdminOrders();
  renderAdminCustomers();
  updateOrderOnServer(orders[index].id, status).catch(() => {});
}

async function deleteOrder(index) {
  const orders = getOrders();
  if (!orders[index]) return;
  if (!confirm('Supprimer cette commande ?')) return;
  const orderId = orders[index].id;
  orders.splice(index, 1);
  saveOrders(orders);
  refreshCustomersFromOrders();
  renderAdminOrders();
  renderAdminCustomers();
  deleteOrderOnServer(orderId).catch(() => {});
}

function openProductForm(index) {
  const products = getProducts();
  const panel = document.getElementById('product-form-panel');
  const title = document.getElementById('product-form-title');
  const editIndex = document.getElementById('product-edit-index');
  // Ensure modal overlay exists and move panel into it
  if (!globalThis._productPanelOrigin) {
    globalThis._productPanelOrigin = { parent: panel.parentNode, nextSibling: panel.nextSibling };
  }

  let overlay = document.getElementById('product-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'product-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeProductForm();
    });
  }
  overlay.appendChild(panel);
  panel.classList.remove('hidden');
  panel.classList.add('modal');
  // trigger opening animation
  panel.classList.remove('modal-closing');
  panel.classList.add('modal-open');
  document.body.style.overflow = 'hidden';
  if (typeof index === 'number') {
    const p = products[index];
    title.textContent = 'Modifier le pagne';
    editIndex.value = String(index);
    document.getElementById('product-name').value = p.name;
    document.getElementById('product-type').value = p.type;
    document.getElementById('product-price').value = p.price;
    setProductImageValue(p.image);
    document.getElementById('product-desc').value = p.desc;
  } else {
    title.textContent = 'Nouveau pagne';
    editIndex.value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-type').value = 'tisse';
    document.getElementById('product-price').value = '';
    setProductImageValue('');
    document.getElementById('product-desc').value = '';
  }
}

function closeProductForm() {
  const panel = document.getElementById('product-form-panel');
  if (!panel) return;
  const panelEl = document.getElementById('product-form-panel');
  if (!panelEl) return;
  // play closing animation then finalize
  panelEl.classList.remove('modal-open');
  panelEl.classList.add('modal-closing');
  const onAnimEnd = (e) => {
    if (e.target !== panelEl) return;
    panelEl.classList.add('hidden');
    panelEl.classList.remove('modal', 'modal-closing');
    const overlay = document.getElementById('product-modal-overlay');
    const origin = globalThis._productPanelOrigin;
    if (overlay) overlay.remove();
    if (origin?.parent) origin.parent.insertBefore(panelEl, origin.nextSibling || null);
    else document.body.appendChild(panelEl);
    document.body.style.overflow = '';
    panelEl.removeEventListener('animationend', onAnimEnd);
  };
  panelEl.addEventListener('animationend', onAnimEnd);
}

function saveProduct() {
  const name = document.getElementById('product-name').value.trim();
  const type = document.getElementById('product-type').value;
  const price = document.getElementById('product-price').value.trim();
  const image = CURRENT_PRODUCT_IMAGE_URL || 'background.png';
  const desc = document.getElementById('product-desc').value.trim();
  const editIndex = document.getElementById('product-edit-index').value;

  if (!name || !price || !desc) {
    alert('Veuillez remplir le nom, le type, le prix et la description.');
    return;
  }

  const products = getProducts();
  const isEditing = editIndex.length > 0;
  const payload = { id: isEditing ? products[Number(editIndex)].id : uid(), name, type, price, image, desc };
  if (isEditing) products[Number(editIndex)] = payload;
  else products.unshift(payload);
  saveProducts(products);
  closeProductForm();
  refreshAll();
  showSection('admin');
  switchAdminTab('products');
}

function deleteProduct(index) {
  const products = getProducts();
  if (!products[index]) return;
  if (!confirm('Supprimer ce pagne ?')) return;
  products.splice(index, 1);
  saveProducts(products);
  refreshAll();
}

async function adminLogin() {
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();
  if (!user || !pass) {
    alert('Veuillez renseigner l’identifiant et le mot de passe.');
    return;
  }

  try {
    await loginAdminOnServer(user, pass);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Identifiants invalides.';
    alert(message);
    return;
  }

  sessionStorage.setItem('faspagnes_admin', '1');
  await showAdminDashboard();
}

async function adminLogout() {
  sessionStorage.removeItem('faspagnes_admin');
  await logoutAdminOnServer();
  showAdminLogin();
}

function showAdminLogin() {
  document.getElementById('admin-login-view').classList.remove('hidden');
  document.getElementById('admin-dashboard-view').classList.add('hidden');
}

async function showAdminDashboard() {
  document.getElementById('admin-login-view').classList.add('hidden');
  document.getElementById('admin-dashboard-view').classList.remove('hidden');
  await loadOrdersFromApi();
  refreshCustomersFromOrders();
  renderAdminProducts();
  renderAdminOrders();
  renderAdminCustomers();
}



function switchAdminTab(tab) {
  const prod = document.getElementById('admin-products-panel');
  const ord = document.getElementById('admin-orders-panel');
  const clients = document.getElementById('admin-customers-panel');
  document.querySelectorAll('.admin-menu button').forEach(btn => btn.classList.remove('active'));
  const activeBtn = [...document.querySelectorAll('.admin-menu button')].find(b => b.textContent.toLowerCase().includes(tab));
  if (activeBtn) activeBtn.classList.add('active');
  if (tab === 'orders') {
    prod.classList.add('hidden');
    ord.classList.remove('hidden');
    clients.classList.add('hidden');
  } else if (tab === 'customers' || tab === 'clients') {
    prod.classList.add('hidden');
    ord.classList.add('hidden');
    clients.classList.remove('hidden');
  } else {
    prod.classList.remove('hidden');
    ord.classList.add('hidden');
    clients.classList.add('hidden');
  }
}

/* ── Menu hamburger mobile ── */
function toggleMenu() {
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('nav-hamburger');
  if (!links || !burger) return;
  links.classList.toggle('open');
  burger.classList.toggle('open');
}

function closeMenu() {
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('nav-hamburger');
  if (links) links.classList.remove('open');
  if (burger) burger.classList.remove('open');
}

// Fermer le menu si on clique en dehors
document.addEventListener('click', (e) => {
  const nav = document.querySelector('nav');
  if (nav && !nav.contains(e.target)) closeMenu();
});

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'boutique') renderProducts('all');
  if (id === 'order') refreshOrderSelect(document.getElementById('order-pagne')?.value);
  if (id === 'admin') {
    if (sessionStorage.getItem('faspagnes_admin') === '1') void showAdminDashboard();
    else showAdminLogin();
  }
}

async function initApp() {
  await initFirebase();
  bindImageUploadSection();

  // Affichage immédiat depuis le localStorage (pas d'attente)
  const localProds = loadLocalProducts();
  APP_STATE.products = localProds.length ? localProds : [];
  renderHomeProducts();

  // Ensuite chargement complet depuis Firebase
  await loadProductsFromApi();
  await loadOrdersFromApi();
  refreshCustomersFromOrders();
  refreshOrderSelect();
  renderProducts();
  renderHomeProducts(); // re-render avec les données Firebase
  renderAdminProducts();
  renderAdminOrders();
  renderAdminCustomers();

  // Écoute en temps réel Firestore : mise à jour automatique dès qu'un produit change
  if (FIREBASE_STATE.enabled && FIREBASE_STATE.db) {
    FIREBASE_STATE.db.collection('fasopagnes').doc('products')
      .onSnapshot(snap => {
        const items = Array.isArray(snap?.data()?.items) ? snap.data().items : [];
        if (items.length) {
          APP_STATE.products = items;
          saveLocalProducts(items);
          renderProducts();
          renderHomeProducts();
          refreshOrderSelect();
        }
      });
    FIREBASE_STATE.db.collection('fasopagnes').doc('orders')
      .onSnapshot(snap => {
        const items = Array.isArray(snap?.data()?.items) ? snap.data().items : [];
        APP_STATE.orders = items;
        saveLocalOrders(items);
        refreshCustomersFromOrders();
        renderAdminOrders();
        renderAdminCustomers();
      });
  }

  if (sessionStorage.getItem('faspagnes_admin') === '1') await showAdminDashboard();
  else showAdminLogin();
  bindProductImageDropzone();
}

document.addEventListener('DOMContentLoaded', () => { void initApp(); });
