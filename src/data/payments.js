/**
 * Moyens de paiement + instructions (popup).
 * NOTE : remplace les numéros/noms bénéficiaires par les vrais (entre <…>).
 */
export const MERCHANT_NAME = 'BOUDA SONIA';        // nom bénéficiaire (transferts internationaux)
const WAVE_NUM   = '+226 63 24 06 63';             // Wave
const ORANGE_NUM = '+226 66 74 69 67';             // Orange Money
const MOOV_NUM   = '+226 63 24 06 63';             // Moov (à confirmer)

export const PAYMENTS = [
  {
    id: 'orange',
    label: 'Orange Money',
    color: '#FF6600',
    short: 'Mobile Money',
    steps: [
      `Compose *144# sur ton téléphone Orange.`,
      `Choisis « Transfert d'argent ».`,
      `Entre le numéro : ${ORANGE_NUM}.`,
      `Saisis le montant de ta commande puis valide avec ton code secret.`,
      `Envoie-nous la capture / le SMS de confirmation sur WhatsApp.`,
    ],
  },
  {
    id: 'moov',
    label: 'Moov Money',
    color: '#0066B3',
    short: 'Mobile Money',
    steps: [
      `Compose *555# sur ton téléphone Moov.`,
      `Choisis « Transfert d'argent ».`,
      `Entre le numéro : ${MOOV_NUM}.`,
      `Saisis le montant puis valide avec ton code secret.`,
      `Envoie la confirmation sur WhatsApp.`,
    ],
  },
  {
    id: 'wave',
    label: 'Wave',
    color: '#1DC3FF',
    short: 'Mobile Money',
    steps: [
      `Ouvre l'application Wave.`,
      `Choisis « Envoyer » puis entre le numéro : ${WAVE_NUM}.`,
      `Saisis le montant de ta commande et valide.`,
      `Wave est sans frais — envoie la confirmation sur WhatsApp.`,
    ],
  },
  {
    id: 'western',
    label: 'Western Union',
    color: '#FFDD00',
    short: 'Transfert international',
    steps: [
      `Rends-toi dans une agence Western Union ou utilise l'app.`,
      `Bénéficiaire : ${MERCHANT_NAME}, Ouagadougou, Burkina Faso.`,
      `Effectue le transfert du montant de ta commande.`,
      `Envoie-nous le code MTCN + le montant sur WhatsApp.`,
    ],
  },
  {
    id: 'ria',
    label: 'RIA',
    color: '#E2001A',
    short: 'Transfert international',
    steps: [
      `Va dans une agence RIA ou utilise l'app RIA.`,
      `Bénéficiaire : ${MERCHANT_NAME}, Ouagadougou, Burkina Faso.`,
      `Effectue le transfert.`,
      `Envoie le code de retrait (PIN) + le montant sur WhatsApp.`,
    ],
  },
  {
    id: 'moneygram',
    label: 'MoneyGram',
    color: '#E5006D',
    short: 'Transfert international',
    steps: [
      `Va dans une agence MoneyGram ou utilise l'app.`,
      `Bénéficiaire : ${MERCHANT_NAME}, Ouagadougou, Burkina Faso.`,
      `Effectue le transfert.`,
      `Envoie le numéro de référence + le montant sur WhatsApp.`,
    ],
  },
];

export function findPayment(id) {
  return PAYMENTS.find(p => p.id === id) ?? null;
}
