import { BRAND, EMAIL } from '../constants/theme';

/* ── Couleurs (logo) ── */
const NAVY = [13, 27, 62];
const BLUE = [0, 82, 204];
const GOLD = [176, 124, 38];
const INK  = [33, 37, 49];
const GRAY = [122, 130, 144];
const LINE = [222, 224, 232];
const BG   = [244, 245, 249];   // gris clair
const WHITE = [255, 255, 255];

const CONTACT_PHONE = '+226 63 24 06 63';

/* ── Cache logo ── */
let LOGO_CACHE = null;
function loadLogo() {
  if (LOGO_CACHE !== null) return Promise.resolve(LOGO_CACHE);
  return fetch('/logo.png')
    .then(r => r.blob())
    .then(blob => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => { LOGO_CACHE = reader.result; resolve(LOGO_CACHE); };
      reader.onerror = () => { LOGO_CACHE = ''; resolve(''); };
      reader.readAsDataURL(blob);
    }))
    .catch(() => { LOGO_CACHE = ''; return ''; });
}

const parsePrice = (p) => { const n = Number(String(p).replace(/[^0-9]/g, '')); return Number.isFinite(n) ? n : 0; };
// Séparateur de milliers = espace ASCII normale (jsPDF ne rend pas l'espace insécable U+202F de toLocaleString)
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/**
 * Reçu PDF — style facture épurée (inspiré modèle pro), couleurs du site.
 * @returns {Promise<jsPDF>}
 */
export async function buildReceipt(order) {
  const [{ jsPDF }, logo] = await Promise.all([import('jspdf'), loadLogo()]);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 20;
  const colR = W - M;

  /* ════════ FOND gris clair ════════ */
  doc.setFillColor(...BG);
  doc.rect(0, 0, W, H, 'F');

  /* ════════ EN-TÊTE ════════ */
  // Logo + marque (gauche)
  let ly = 24;
  if (logo) {
    try { doc.addImage(logo, 'PNG', M, ly - 4, 16, 16); } catch { /* ignore */ }
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text('FasoPagnes', M + 20, ly + 2);
  doc.setTextColor(...BLUE);
  doc.setFontSize(11);
  doc.text("Tissé D'lux.", M + 20, ly + 8);

  // REÇU (droite)
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('REÇU', colR, ly + 2, { align: 'right' });
  doc.setTextColor(...INK);
  doc.setFontSize(10);
  doc.text(new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), colR, ly + 9, { align: 'right' });

  /* ════════ ADRESSE / CLIENT ════════ */
  let y = 50;
  // Boutique (gauche)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('Boutique', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.text('Quartier Dassasgho, près du ROYAL BEACH Hotel', M, y + 6);
  doc.text('Ouagadougou, Burkina Faso', M, y + 11);
  doc.text(CONTACT_PHONE, M, y + 16);

  // Client (droite)
  const rx = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text('À :', rx, y);
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(order.clientName || 'Client', rx, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.text(order.clientPhone || '-', rx, y + 13);
  if (order.clientEmail) doc.text(order.clientEmail, rx, y + 18);
  // Réf
  doc.text(`Réf : ${order.id.slice(0, 8).toUpperCase()}`, colR, y, { align: 'right' });

  /* ════════ TABLEAU ════════ */
  y = 88;
  const cPrix = colR - 64, cQte = colR - 34, cTot = colR;

  // Bandeau en-tête bleu plein
  doc.setFillColor(...BLUE);
  doc.rect(M, y, colR - M, 11, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DÉSIGNATION', M + 4, y + 7);
  doc.text('PRIX UNIT.', cPrix, y + 7, { align: 'right' });
  doc.text('QTÉ', cQte, y + 7, { align: 'right' });
  doc.text('TOTAL', cTot - 4, y + 7, { align: 'right' });
  y += 11;

  // Lignes
  let subtotal = 0;
  doc.setFontSize(10);
  (order.items ?? []).forEach((it) => {
    const unit = parsePrice(it.price);
    const lineTot = unit * (it.qty || 1);
    subtotal += lineTot;

    y += 9;
    // Nom article (gras) + catégorie en sous-ligne
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.setFontSize(10);
    doc.text(String(it.name).slice(0, 38), M + 4, y);
    if (it.type) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.setFontSize(8);
      doc.text(`Pagne ${it.type}`, M + 4, y + 4);
    }
    // Montants
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.setFontSize(9.5);
    doc.text(`${fmt(unit)}`, cPrix, y, { align: 'right' });
    doc.text(String(it.qty), cQte, y, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`${fmt(lineTot)}`, cTot - 4, y, { align: 'right' });

    y += 7;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y, colR, y);
  });

  /* ════════ TOTAUX (droite) ════════ */
  y += 12;
  const boxX = colR - 92, boxW = 92;       // bloc large
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text('SOUS-TOTAL', boxX + 6, y);
  doc.setTextColor(...INK);
  doc.text(`${fmt(subtotal)} FCFA`, colR - 6, y, { align: 'right' });

  // TOTAL À PAYER — bloc bleu plein
  y += 7;
  const boxH = 14;
  doc.setFillColor(...BLUE);
  doc.rect(boxX, y, boxW, boxH, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL À PAYER', boxX + 6, y + 9);
  doc.setFontSize(11);
  doc.text(`${fmt(subtotal)} FCFA`, colR - 6, y + 9, { align: 'right' });

  /* ════════ NOTE (gauche, en regard des totaux) ════════ */
  if (order.note) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text('Note :', M, y - 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(order.note, 80), M, y - 2);
  }

  /* ════════ MERCI ════════ */
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BLUE);
  doc.setFontSize(13);
  doc.text('Merci pour votre confiance.', M, H - 56);

  /* ════════ PIED — 3 colonnes ════════ */
  const fy = H - 42;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(M, fy, colR, fy);

  const col1 = M, col2 = M + 62, col3 = M + 120;
  const heads = [['Des questions ?', col1], ['Livraison', col2], ['Conditions', col3]];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  heads.forEach(([t, x]) => doc.text(t, x, fy + 8));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  // Col 1
  doc.text(`WhatsApp : ${CONTACT_PHONE}`, col1, fy + 14);
  doc.text(EMAIL, col1, fy + 18.5);
  // Col 2
  doc.text('Ouagadougou : 24 à 48h.', col2, fy + 14);
  doc.text('Retrait boutique à Dassasgho.', col2, fy + 18.5);
  // Col 3
  doc.text(doc.splitTextToSize('Commande confirmée après validation WhatsApp. Reçu récapitulatif.', 56), col3, fy + 14);

  // Triptyque couleur logo
  const dotY = H - 12, dot = 1.3;
  doc.setFillColor(196, 30, 30); doc.circle(M, dotY, dot, 'F');
  doc.setFillColor(...BLUE);     doc.circle(M + 5, dotY, dot, 'F');
  doc.setFillColor(...GOLD);     doc.circle(M + 10, dotY, dot, 'F');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.5);
  doc.text(BRAND, colR, dotY + 1, { align: 'right' });

  return doc;
}

/** Télécharge le reçu PDF */
export async function downloadReceipt(order) {
  const doc = await buildReceipt(order);
  doc.save(`recu-fasopagnes-${order.id.slice(0, 8)}.pdf`);
}

/** Mailto pré-rempli (récap texte) */
export function emailReceipt(order) {
  const lines = (order.items ?? []).map(i => `${i.name} x${i.qty} — ${i.price} FCFA`).join('\n');
  const subject = `Reçu commande FasoPagnes ${order.id.slice(0, 8).toUpperCase()}`;
  const body = [
    `Bonjour ${order.clientName},`,
    '',
    'Récapitulatif de votre commande :',
    lines,
    '',
    `Téléphone : ${order.clientPhone}`,
    order.note ? `Précision : ${order.note}` : '',
    '',
    'Reçu PDF téléchargeable depuis le site.',
    '',
    BRAND,
    `WhatsApp : ${CONTACT_PHONE}`,
  ].filter(Boolean).join('\n');
  return `mailto:${order.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
