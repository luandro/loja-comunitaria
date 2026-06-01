import { getEnv } from './env';

/**
 * All site-wide content keys editable from the Site_Content tab in the
 * Google Spreadsheet (CMS). Add new keys here as the sheet grows.
 */
export interface SiteContent {
  // Branding
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;

  // Hero
  hero_title: string;
  hero_description: string;
  hero_button_label: string;
  hero_image_url: string;

  // About / Nossa História
  about_title: string;
  about_text: string;
  about_button_label: string;
  about_image_url: string;

  // Contact / Footer
  whatsapp_number: string;
  whatsapp_message: string;
  email: string;
  location: string;
  business_hours: string;
  pix_key: string;
  instagram_url: string;
  facebook_url: string;

  // SEO
  meta_title: string;
  meta_description: string;
  og_image_url: string;

  // Catch-all for any unknown keys defined in the sheet
  [key: string]: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  site_name: 'Artesanatos Indígenas',
  site_tagline:
    'Conectando a arte indígena brasileira com amantes de artesanato em todo o mundo.',
  logo_url: '',
  favicon_url: '',
  primary_color: '',
  secondary_color: '',

  hero_title: 'Arte Indígena Autêntica',
  hero_description:
    'Descubra a riqueza do artesanato indígena brasileiro: peças únicas que contam histórias milenares.',
  hero_button_label: 'Explorar Produtos',
  hero_image_url: '',

  about_title: 'Nossa História',
  about_text:
    'A Tribal Artesanatos nasceu do desejo de valorizar e compartilhar a rica tradição artística dos povos indígenas brasileiros. Cada peça em nossa loja carrega consigo séculos de história e cultura.',
  about_button_label: 'Conheça Nossa História',
  about_image_url: '/placeholder.svg',

  whatsapp_number: '',
  whatsapp_message: '',
  email: 'contato@tribalartesanatos.com',
  location: 'São Paulo, SP',
  business_hours: 'Seg-Sex: 9h às 18h · Sáb: 9h às 13h',
  pix_key: '',
  instagram_url: '',
  facebook_url: '',

  meta_title: 'Loja Comunitária – Artesanatos Indígenas Autênticos',
  meta_description:
    'E-commerce de artesanatos indígenas com produtos exclusivos e autênticos.',
  og_image_url: '',
};

/**
 * Fetch the Site_Content sheet as a key/value map.
 * Sheet shape: two columns named `key` and `value` (extra columns are ignored).
 */
export async function loadSiteContent(): Promise<SiteContent> {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID as string | undefined;
  const contentTab =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_CONTENT_TAB as string | undefined) ||
    'Site_Content';

  if (!spreadsheetId) {
    console.warn('[SITE_CONTENT] No spreadsheet ID configured, using defaults');
    return { ...DEFAULT_SITE_CONTENT };
  }

  try {
    const url = `https://opensheet.elk.sh/${spreadsheetId}/${contentTab}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<Record<string, string>>;

    const merged: SiteContent = { ...DEFAULT_SITE_CONTENT };
    for (const row of rows) {
      const key = (row.key || row.Key || '').trim();
      const value = (row.value ?? row.Value ?? '').toString();
      if (key) merged[key] = value;
    }
    return merged;
  } catch (err) {
    console.error('[SITE_CONTENT] Failed to load, using defaults:', err);
    return { ...DEFAULT_SITE_CONTENT };
  }
}

/**
 * Resolve the WhatsApp number / message — prefers sheet value, falls back to env.
 */
export function resolveWhatsApp(content: SiteContent) {
  const number = content.whatsapp_number?.trim() || getEnv('WHATSAPP_NUMBER');
  const message = content.whatsapp_message?.trim() || getEnv('WHATSAPP_MESSAGE');
  return { number, message };
}
