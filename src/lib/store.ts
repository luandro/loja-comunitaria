import { translate, type TranslationKey } from './i18n';
import { resolveWhatsApp, type SiteContent } from './site-content';

/**
 * Single typed access layer over the site content.
 *
 * Components MUST NOT invent their own fallbacks: every visible string comes
 * either from the spreadsheet (store-specific) or from the translation
 * dictionary (generic). Missing essential values are reported in `diagnostics`
 * and the related feature is hidden — never replaced with fake data.
 */

export interface StoreContact {
  whatsappNumber: string;
  whatsappMessage: string;
  whatsappLink: string;
  hasWhatsApp: boolean;
  email: string;
  location: string;
  businessHours: string;
  instagramUrl: string;
  facebookUrl: string;
  hasAnyChannel: boolean;
}

export interface StoreDiagnostic {
  key: string;
  message: string;
}

export interface Store {
  content: SiteContent;
  language: string;
  locale: string;
  currency: string;
  /** Generic UI string from the translation dictionary. */
  t: (key: TranslationKey) => string;
  /** Spreadsheet value, falling back to a generic dictionary string. */
  text: (key: keyof SiteContent & string, fallback: TranslationKey) => string;
  /** Spreadsheet value or empty string (caller hides the feature when empty). */
  optional: (key: keyof SiteContent & string) => string;
  storeName: string;
  tagline: string;
  formatPrice: (value: number) => string;
  contact: StoreContact;
  checkoutMode: string;
  pickupAvailable: boolean;
  diagnostics: StoreDiagnostic[];
}

const truthy = (value: string) =>
  ['true', '1', 'sim', 'yes', 'y'].includes(value.trim().toLowerCase());

function buildWhatsAppLink(number: string, message: string) {
  if (!number) return '';
  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}

export function createStore(content: SiteContent): Store {
  const language = content.default_language?.trim() || 'pt-BR';
  const locale = content.locale?.trim() || language;
  const currency = content.currency?.trim() || 'BRL';

  const t = (key: TranslationKey) => translate(key, language);
  const optional = (key: keyof SiteContent & string) => (content[key] ?? '').toString().trim();
  const text = (key: keyof SiteContent & string, fallback: TranslationKey) =>
    optional(key) || t(fallback);

  const storeName = optional('site_name') || t('store_name_fallback');
  const tagline = optional('site_tagline');

  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
  } catch {
    formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  const formatPrice = (value: number) => formatter.format(Number.isFinite(value) ? value : 0);

  const { number: whatsappNumber, message: whatsappMessage } = resolveWhatsApp(content);
  const contact: StoreContact = {
    whatsappNumber,
    whatsappMessage,
    whatsappLink: buildWhatsAppLink(whatsappNumber, whatsappMessage || tagline || storeName),
    hasWhatsApp: !!whatsappNumber,
    email: optional('email'),
    location: optional('location'),
    businessHours: optional('business_hours'),
    instagramUrl: optional('instagram_url'),
    facebookUrl: optional('facebook_url'),
    hasAnyChannel: false,
  };
  contact.hasAnyChannel = !!(contact.hasWhatsApp || contact.email || contact.location);

  const diagnostics: StoreDiagnostic[] = [];
  if (!import.meta.env.VITE_GOOGLE_SPREADSHEET_ID) {
    diagnostics.push({ key: 'spreadsheet', message: t('diag_missing_spreadsheet') });
  }
  if (!optional('site_name')) {
    diagnostics.push({ key: 'site_name', message: t('diag_missing_store_name') });
  }
  if (!contact.hasWhatsApp) {
    diagnostics.push({ key: 'whatsapp', message: t('diag_missing_whatsapp') });
  }
  if (!contact.hasAnyChannel) {
    diagnostics.push({ key: 'contact', message: t('diag_missing_contact') });
  }

  return {
    content,
    language,
    locale,
    currency,
    t,
    text,
    optional,
    storeName,
    tagline,
    formatPrice,
    contact,
    checkoutMode: optional('checkout_mode') || 'whatsapp',
    pickupAvailable: truthy(optional('pickup_available') || 'true'),
    diagnostics,
  };
}
