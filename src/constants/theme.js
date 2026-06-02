export const WHATSAPP = '22663240663';
export const WHATSAPP_2 = '22652832424';
export const PHONE = '+22666746967';
export const EMAIL = 'contact@fasopagnes.bf';
export const BRAND = "FasoPagnes Tissé D'lux";
export const ADDRESS = 'Quartier Dassasgho, près du ROYAL BEACH Hotel\nOuagadougou, Burkina Faso';

export const CATEGORIES = [
  { value: 'all',        label: 'Tout voir' },
  { value: 'tisse',      label: 'Pagnes Tissés' },
  { value: 'batiks',     label: 'Batiks' },
  { value: 'kokodonda',  label: 'Kokodonda' },
  { value: 'bogolla',    label: 'Bogolla' },
  { value: 'galani',     label: 'Galani' },
  { value: 'accessoire', label: 'Accessoires' },
];

export function categoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value;
}

export function waOrderUrl(productName, price) {
  const msg = productName
    ? `Bonjour, je souhaite commander : ${productName} — ${price} FCFA. Pouvez-vous confirmer la disponibilité ?`
    : 'Bonjour, je souhaite passer une commande.';
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
