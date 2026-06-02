import { jsPDF } from 'jspdf';
import { BRAND, EMAIL } from '../constants/theme';

/* ── Couleurs du site ── */
const NAVY   = [13, 27, 62];     // #0D1B3E
const BLUE   = [0, 82, 204];     // #0052CC
const BLUE_L = [219, 234, 254];  // bleu pâle
const GOLD   = [180, 83, 9];     // amber-600
const GRAY   = [100, 116, 139];
const INK    = [15, 23, 42];
const SOFT   = [241, 245, 249];

/* ── Cache du logo en dataURL ── */
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

/** "18 000" → 18000 */
function parsePrice(p) {
  const n = Number(String(p).replace(/[^0-9]/g, ''));
  return Number.isFinite(n) ? n : 0;
}
/** 18000 → "18 000" */
function fmt(n) {
  return n.toLocaleString('fr-FR');
}

/**
 * Génère le reçu PDF (style facture, couleurs du site). Async (charge le logo).
 * @returns {Promise<jsPDF>}
 */
export async function buildReceipt(order) {
  const logo = await loadLogo();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 16;

  /* ════════ HEADER ════════ */
  // Bande blanche en haut, bloc navy arrondi à droite
  doc.setFillColor(...NAVY);
  doc.roundedRect(86, 12, W - 86 - M, 26, 4, 4, 'F');
  // Cercles décoratifs (bleu) dans le bloc navy
  doc.setFillColor(...BLUE);
  doc.circle(W - M - 8, 17, 5, 'F');
  doc.setFillColor(40, 70, 140);
  doc.circle(W - M - 16, 33, 3.5, 'F');

  // Titre REÇU
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('REÇU', 96, 29);

  // Logo + nom à gauche
  if (logo) {
    try { doc.addImage(logo, 'PNG', M, 13, 22, 22); } catch { /* ignore */ }
  }
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('FasoPagnes', M + 25, 22);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text("Tissé D'lux", M + 25, 28);

  /* ════════ INFOS CLIENT + REÇU ════════ */
  let y = 54;
  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('REÇU À :', M, y);

  doc.setTextColor(...INK);
  doc.setFontSize(15);
  doc.text(order.clientName || 'Client', M + 24, y + 0.5);

  doc.setTextColor(...GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  let cy = y + 8;
  doc.text(`Tél / WhatsApp : ${order.clientPhone || '-'}`, M + 24, cy);
  if (order.clientEmail) { cy += 5.5; doc.text(order.clientEmail, M + 24, cy); }

  // Bloc droite : N°, date, réf
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const rx = W - M;
  doc.text(`Reçu N° : ${order.id.slice(0, 8).toUpperCase()}`, rx, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, rx, y + 6, { align: 'right' });
  doc.text(`Statut : En attente`, rx, y + 12, { align: 'right' });

  // Filet bleu séparateur
  y = 76;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);

  /* ════════ SIDEBAR GAUCHE (gris) ════════ */
  const sideX = M, sideW = 52, sideY = y + 8;
  doc.setFillColor(...SOFT);
  doc.roundedRect(sideX, sideY, sideW, 96, 3, 3, 'F');

  let sy = sideY + 9;
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAIEMENT', sideX + 5, sy);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(8.5);
  ['Wave', 'Orange Money', 'Moov Money', 'Western Union', 'Espèces'].forEach((m, i) => {
    doc.text(m, sideX + 5, sy + 6 + i * 5);
  });

  sy = sideY + 48;
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('CONDITIONS', sideX + 5, sy);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  doc.setFontSize(7.8);
  const terms =
    'Commande confirmée après validation sur WhatsApp. Livraison à Ouagadougou sous 24 à 48h. ' +
    'Reçu non contractuel, valable comme récapitulatif de commande.';
  doc.text(doc.splitTextToSize(terms, sideW - 10), sideX + 5, sy + 6);

  /* ════════ TABLEAU ARTICLES ════════ */
  const tx = sideX + sideW + 8;        // début table
  const tw = W - M - tx;               // largeur table
  let ty = y + 8;

  // En-têtes
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  const colPrix = tx + tw - 56;
  const colQte  = tx + tw - 30;
  const colTot  = tx + tw;
  doc.text('ARTICLE', tx, ty);
  doc.text('PRIX',  colPrix, ty, { align: 'right' });
  doc.text('QTÉ',   colQte,  ty, { align: 'right' });
  doc.text('TOTAL', colTot,  ty, { align: 'right' });
  ty += 2.5;
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(tx, ty, colTot, ty);
  ty += 7;

  // Lignes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  let subtotal = 0;
  (order.items ?? []).forEach((it) => {
    const unit = parsePrice(it.price);
    const line = unit * (it.qty || 1);
    subtotal += line;
    doc.setTextColor(...INK);
    doc.text(String(it.name).slice(0, 32), tx, ty);
    doc.setTextColor(...GRAY);
    doc.text(`${fmt(unit)}`, colPrix, ty, { align: 'right' });
    doc.text(String(it.qty), colQte, ty, { align: 'right' });
    doc.setTextColor(...INK);
    doc.text(`${fmt(line)}`, colTot, ty, { align: 'right' });
    ty += 8;
  });

  /* ════════ TOTAUX ════════ */
  ty += 2;
  doc.setDrawColor(220, 224, 230);
  doc.setLineWidth(0.3);
  doc.line(colPrix - 6, ty, colTot, ty);
  ty += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  doc.text('SOUS-TOTAL', colQte, ty, { align: 'right' });
  doc.setTextColor(...INK);
  doc.text(`${fmt(subtotal)} FCFA`, colTot, ty, { align: 'right' });
  ty += 9;

  // TOTAL en surbrillance bleu
  doc.setFillColor(...BLUE_L);
  doc.roundedRect(colPrix - 6, ty - 6, colTot - colPrix + 6, 11, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text('TOTAL', colQte, ty + 1.5, { align: 'right' });
  doc.setTextColor(...BLUE);
  doc.text(`${fmt(subtotal)} FCFA`, colTot, ty + 1.5, { align: 'right' });

  /* ════════ NOTE CLIENT ════════ */
  if (order.note) {
    ty += 16;
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PRÉCISION', tx, ty);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.text(doc.splitTextToSize(order.note, tw), tx, ty + 5);
  }

  /* ════════ SIGNATURE ════════ */
  const sigY = 232;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(13);
  doc.text('FasoPagnes', W - M, sigY, { align: 'right' });
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.3);
  doc.line(W - M - 45, sigY + 3, W - M, sigY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text('Service Commande', W - M, sigY + 8, { align: 'right' });

  /* ════════ FOOTER NAVY ════════ */
  const fy = H - 26;
  doc.setFillColor(...NAVY);
  doc.rect(0, fy, W, 26, 'F');
  // Cercles déco
  doc.setFillColor(...BLUE);
  doc.circle(14, fy + 13, 7, 'F');
  doc.setFillColor(40, 70, 140);
  doc.circle(W - 12, fy + 6, 5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('+226 63 24 06 63', 30, fy + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(EMAIL, 30, fy + 16);
  doc.text('Dassasgho, Ouagadougou, Burkina Faso', 30, fy + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 200, 70);
  doc.text('Merci pour votre confiance !', W - 22, fy + 15, { align: 'right' });

  return doc;
}

/** Télécharge le reçu PDF */
export async function downloadReceipt(order) {
  const doc = await buildReceipt(order);
  doc.save(`recu-fasopagnes-${order.id.slice(0, 8)}.pdf`);
}

/** Ouvre le client mail pré-rempli (récap texte) */
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
    'WhatsApp : +226 63 24 06 63',
  ].filter(Boolean).join('\n');
  return `mailto:${order.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
