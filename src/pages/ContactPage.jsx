import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ButtonLink } from '../components/ui/Button';
import { WHATSAPP, WHATSAPP_2, PHONE, EMAIL } from '../constants/theme';

const CONTACT_ITEMS = [
  {
    id: 'address',
    Icon: MapPin,
    label: 'Adresse',
    content: 'Quartier Dassasgho\nPrès du ROYAL BEACH Hotel\nOuagadougou, Burkina Faso',
  },
  {
    id: 'whatsapp',
    Icon: MessageCircle,
    label: 'WhatsApp',
    links: [
      { href: `https://wa.me/${WHATSAPP}`,  text: '+226 63 24 06 63', external: true },
      { href: `https://wa.me/${WHATSAPP_2}`, text: '+226 52 83 24 24', external: true },
    ],
  },
  {
    id: 'phone',
    Icon: Phone,
    label: 'Téléphone',
    links: [{ href: `tel:${PHONE}`, text: PHONE }],
  },
  {
    id: 'email',
    Icon: Mail,
    label: 'Email',
    links: [{ href: `mailto:${EMAIL}`, text: EMAIL }],
  },
  {
    id: 'hours',
    Icon: Clock,
    label: 'Horaires',
    content: 'Lun – Ven : 08h00 – 19h00\nSamedi : 09h00 – 19h00',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* ── En-tête ──────────────────────────────────────────── */}
      <div className="bg-navy py-16 sm:py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            eyebrow="Localisation"
            title="Nous Trouver"
            subtitle="Venez nous rendre visite ou contactez-nous directement"
            theme="dark"
            className="[&_h2]:text-4xl sm:[&_h2]:text-5xl"
          />
        </div>
      </div>

      {/* ── Contenu principal ────────────────────────────────── */}
      <div className="bg-surface py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* ── Bloc infos ─────────────────────────────────── */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif font-bold text-ink text-2xl mb-1">
                  FasoPagnes <em className="not-italic text-brand">Tissé D'lux</em>
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  Disponibles du lundi au samedi pour toute question ou commande.
                </p>
              </div>

              {/* Cartes de contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CONTACT_ITEMS.map(({ id, Icon, label, content, links }) => (
                  <div
                    key={id}
                    className="bg-white border border-border rounded-2xl p-5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/8 transition-all duration-200 group"
                  >
                    {/* Icône + label */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-9 h-9 rounded-full bg-brand-pale group-hover:bg-brand flex items-center justify-center transition-colors duration-200 shrink-0">
                        <Icon size={15} className="text-brand group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
                    </div>

                    {/* Valeur */}
                    {content && (
                      <p className="text-ink text-sm leading-relaxed whitespace-pre-line">{content}</p>
                    )}
                    {links && (
                      <div className="space-y-1">
                        {links.map(({ href, text, external }) => (
                          <a
                            key={href}
                            href={href}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className="block text-brand hover:text-brand-dark text-sm font-medium transition-colors duration-200"
                          >
                            {text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 pt-2">
                <ButtonLink
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="wa"
                  size="lg"
                >
                  <MessageCircle size={17} />
                  <span>Écrire sur WhatsApp</span>
                </ButtonLink>
                <ButtonLink href={`tel:${PHONE}`} variant="secondary" size="lg">
                  <Phone size={17} />
                  <span>Appeler</span>
                </ButtonLink>
              </div>
            </div>

            {/* ── Carte Google Maps ──────────────────────────── */}
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border shadow-md" style={{ height: 440 }}>
                <iframe
                  title="FasoPagnes — Dassasgho, Ouagadougou"
                  src="https://www.google.com/maps?q=Dassasgho,+Ouagadougou,+Burkina+Faso&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', filter: 'saturate(0.85) contrast(1.05)' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="flex items-center gap-2 text-muted text-xs">
                <MapPin size={13} className="text-brand shrink-0" />
                <span>Quartier Dassasgho, près du ROYAL BEACH Hotel, Ouagadougou</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
