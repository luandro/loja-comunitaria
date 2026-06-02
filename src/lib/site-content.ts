import { getEnv } from './env';

/**
 * All site-wide content keys editable from the Conteudo_Site (or Site_Content) tab
 * in the Google Spreadsheet (CMS). Add new keys here as the sheet grows.
 */
export interface SiteContent {
  // Branding
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  og_image_url: string;

  // Theme
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  sand_color: string;

  // Hero
  hero_title: string;
  hero_description: string;
  hero_button_label: string;
  hero_image_url: string;

  // Products page / cards
  featured_products_title: string;
  all_products_button_label: string;
  products_page_title: string;
  add_to_cart_label: string;
  stock_label_singular: string;
  stock_label_plural: string;

  // About
  about_title: string;
  about_text: string;
  about_button_label: string;
  about_image_url: string;

  // Footer / Contact
  footer_store_name: string;
  footer_tagline: string;
  whatsapp_number: string;
  whatsapp_message: string;
  email: string;
  location: string;
  business_hours: string;
  pix_key: string;
  pix_qr_image_url: string;
  instagram_url: string;
  facebook_url: string;
  copyright_text: string;
  shipping_policy: string;
  checkout_instructions: string;

  // SEO
  meta_title: string;
  meta_description: string;

  // Catch-all
  [key: string]: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  site_name: 'Artesanatos Indígenas',
  site_tagline:
    'Conectando a arte indígena brasileira com amantes de artesanato em todo o mundo.',
  logo_url: '',
  favicon_url: '',
  og_image_url: '',

  primary_color: '',
  secondary_color: '',
  accent_color: '',
  background_color: '',
  sand_color: '',

  hero_title: 'Arte Indígena Autêntica',
  hero_description:
    'Descubra a riqueza do artesanato indígena brasileiro: peças únicas que contam histórias milenares.',
  hero_button_label: 'Explorar Produtos',
  hero_image_url: '',

  featured_products_title: 'Produtos em Destaque',
  all_products_button_label: 'Ver todos os produtos',
  products_page_title: 'Nossos Produtos',
  add_to_cart_label: 'Adicionar ao carrinho',
  stock_label_singular: 'em estoque',
  stock_label_plural: 'em estoque',

  about_title: 'Nossa História',
  about_text:
    'A Tribal Artesanatos nasceu do desejo de valorizar e compartilhar a rica tradição artística dos povos indígenas brasileiros. Cada peça em nossa loja carrega consigo séculos de história e cultura.',
  about_button_label: 'Conheça Nossa História',
  about_image_url: '/placeholder.svg',

  footer_store_name: '',
  footer_tagline: '',
  whatsapp_number: '',
  whatsapp_message: '',
  email: 'contato@tribalartesanatos.com',
  location: 'São Paulo, SP',
  business_hours: 'Seg-Sex: 9h às 18h · Sáb: 9h às 13h',
  pix_key: '',
  pix_qr_image_url: '',
  instagram_url: '',
  facebook_url: '',
  copyright_text: '',
  shipping_policy: '',
  checkout_instructions: '',

  meta_title: 'Loja Comunitária – Artesanatos Indígenas Autênticos',
  meta_description:
    'E-commerce de artesanatos indígenas com produtos exclusivos e autênticos.',
};

/**
 * pt-BR sheet key → internal English key.
 * The sheet may use either column, both are accepted.
 */
const KEY_ALIASES: Record<string, string> = {
  // Branding
  nome_site: 'site_name',
  slogan_site: 'site_tagline',
  url_logo: 'logo_url',
  url_favicon: 'favicon_url',
  url_imagem_og: 'og_image_url',
  titulo_meta: 'meta_title',
  descricao_meta: 'meta_description',
  // Theme
  cor_primaria: 'primary_color',
  cor_secundaria: 'secondary_color',
  cor_destaque: 'accent_color',
  cor_fundo: 'background_color',
  cor_areia: 'sand_color',
  // Hero
  titulo_hero: 'hero_title',
  descricao_hero: 'hero_description',
  texto_botao_hero: 'hero_button_label',
  url_imagem_hero: 'hero_image_url',
  // Products
  titulo_produtos_destaque: 'featured_products_title',
  texto_botao_todos_produtos: 'all_products_button_label',
  titulo_pagina_produtos: 'products_page_title',
  texto_adicionar_carrinho: 'add_to_cart_label',
  rotulo_estoque_singular: 'stock_label_singular',
  rotulo_estoque_plural: 'stock_label_plural',
  // About
  titulo_sobre: 'about_title',
  texto_sobre: 'about_text',
  texto_botao_sobre: 'about_button_label',
  url_imagem_sobre: 'about_image_url',
  // Footer / contact
  nome_footer: 'footer_store_name',
  slogan_footer: 'footer_tagline',
  numero_whatsapp: 'whatsapp_number',
  mensagem_whatsapp: 'whatsapp_message',
  localizacao: 'location',
  horario_atendimento: 'business_hours',
  chave_pix: 'pix_key',
  url_qr_pix: 'pix_qr_image_url',
  url_instagram: 'instagram_url',
  url_facebook: 'facebook_url',
  texto_copyright: 'copyright_text',
  politica_envio: 'shipping_policy',
  instrucoes_checkout: 'checkout_instructions',
};

/**
 * Fetch the Conteudo_Site (or Site_Content) sheet as a key/value map.
 * Supports both English (`key`/`value`) and pt-BR (`chave`/`valor`) column names.
 */
export async function loadSiteContent(): Promise<SiteContent> {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID as string | undefined;
  const contentTab =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_CONTENT_TAB as string | undefined) ||
    'Conteudo_Site';

  if (!spreadsheetId) {
    console.warn('[SITE_CONTENT] No spreadsheet ID configured, using defaults');
    return { ...DEFAULT_SITE_CONTENT };
  }

  try {
    const url = `https://opensheet.elk.sh/${spreadsheetId}/${contentTab}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<Record<string, string>>;

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]).map((h) => h.toLowerCase());
      const hasKey = headers.some((h) => ['key', 'chave'].includes(h));
      const hasValue = headers.some((h) => ['value', 'valor'].includes(h));
      if (!hasKey || !hasValue) {
        console.warn(
          '[SITE_CONTENT] Sheet is missing required key/value (or chave/valor) columns. Found:',
          headers,
        );
      }
    }

    const merged: SiteContent = { ...DEFAULT_SITE_CONTENT };
    for (const row of rows) {
      const rawKey = (row.key ?? row.Key ?? row.chave ?? row.Chave ?? '')
        .toString()
        .trim();
      const rawValue = (row.value ?? row.Value ?? row.valor ?? row.Valor ?? '').toString();
      if (!rawKey) continue;
      const internalKey = KEY_ALIASES[rawKey] ?? rawKey;
      // Don't clobber a default with an empty string
      if (rawValue.trim() !== '') merged[internalKey] = rawValue;
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

/**
 * Convert a hex color (#rrggbb) into an `H S% L%` triplet usable as a CSS HSL var
 * (matches the design system tokens defined in src/index.css).
 * Returns null if the input doesn't look like a hex color.
 */
export function hexToHslTriplet(hex: string): string | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6}|[0-9a-f]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hh = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hh = (b - r) / d + 2; break;
      case b: hh = (r - g) / d + 4; break;
    }
    hh *= 60;
  }
  return `${Math.round(hh)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
