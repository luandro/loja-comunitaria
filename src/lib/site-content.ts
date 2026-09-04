import { getEnv } from './env';

/**
 * All site-wide content keys editable from the Conteudo_Site (or Site_Content) tab
 * in the Google Spreadsheet (CMS). Add new keys here as the sheet grows.
 *
 * IMPORTANT: defaults must stay white-label. Store-specific values (name, texts,
 * contact data, city) default to an empty string so the UI can hide the feature
 * or show a diagnostics warning instead of displaying fake data.
 */
export interface SiteContent {
  // Branding
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  og_image_url: string;

  // Navigation labels
  home_label: string;
  products_label: string;
  about_label: string;
  contact_label: string;
  cart_label: string;

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

  // Catalog
  featured_products_title: string;
  products_page_title: string;
  all_products_button_label: string;
  search_placeholder: string;
  empty_catalog_message: string;
  add_to_cart_label: string;
  request_order_label: string;
  stock_label_singular: string;
  stock_label_plural: string;

  // About
  about_title: string;
  about_text: string;
  about_button_label: string;
  about_image_url: string;
  mission_text: string;
  values_text: string;
  commitment_text: string;

  // Ordering
  order_notice: string;
  inventory_notice: string;
  checkout_mode: string;
  checkout_instructions: string;
  shipping_policy: string;
  pickup_available: string;

  // Contact
  whatsapp_number: string;
  whatsapp_message: string;
  email: string;
  location: string;
  business_hours: string;
  instagram_url: string;
  facebook_url: string;

  // Footer
  footer_store_name: string;
  footer_tagline: string;
  copyright_text: string;

  // Language / formatting
  default_language: string;
  currency: string;
  locale: string;

  // Payment (only ever shown when explicitly configured)
  pix_enabled: string;
  pix_key: string;
  pix_recipient_name: string;
  pix_recipient_city: string;
  pix_instruction: string;
  pix_confirmation_notice: string;
  pix_qr_image_url: string;

  // CEP lookup
  cep_lookup_enabled: string;
  cep_lookup_privacy_notice: string;
  cep_lookup_loading_message: string;
  cep_lookup_success_message: string;
  cep_lookup_partial_message: string;
  cep_lookup_error_message: string;

  // SEO
  meta_title: string;
  meta_description: string;

  // Catch-all
  [key: string]: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  site_name: '',
  site_tagline: '',
  logo_url: '',
  favicon_url: '',
  og_image_url: '',

  home_label: '',
  products_label: '',
  about_label: '',
  contact_label: '',
  cart_label: '',

  primary_color: '',
  secondary_color: '',
  accent_color: '',
  background_color: '',
  sand_color: '',

  hero_title: '',
  hero_description: '',
  hero_button_label: '',
  hero_image_url: '',

  featured_products_title: '',
  products_page_title: '',
  all_products_button_label: '',
  search_placeholder: '',
  empty_catalog_message: '',
  add_to_cart_label: '',
  request_order_label: '',
  stock_label_singular: '',
  stock_label_plural: '',

  about_title: '',
  about_text: '',
  about_button_label: '',
  about_image_url: '',
  mission_text: '',
  values_text: '',
  commitment_text: '',

  order_notice: '',
  inventory_notice: '',
  checkout_mode: 'whatsapp_first',
  checkout_instructions: '',
  shipping_policy: '',
  pickup_available: '',

  whatsapp_number: '',
  whatsapp_message: '',
  email: '',
  location: '',
  business_hours: '',
  instagram_url: '',
  facebook_url: '',

  footer_store_name: '',
  footer_tagline: '',
  copyright_text: '',

  default_language: 'pt-BR',
  currency: 'BRL',
  locale: 'pt-BR',

  pix_enabled: '',
  pix_key: '',
  pix_recipient_name: '',
  pix_recipient_city: '',
  pix_instruction: '',
  pix_confirmation_notice: '',
  pix_qr_image_url: '',

  cep_lookup_enabled: 'true',
  cep_lookup_privacy_notice:
    'O CEP é consultado em um serviço público para ajudar a preencher o endereço. Confira os dados antes de enviar.',
  cep_lookup_loading_message: 'Buscando endereço…',
  cep_lookup_success_message: 'Endereço encontrado. Confira os dados e informe o número.',
  cep_lookup_partial_message:
    'Encontramos apenas parte do endereço. Complete os campos que faltam.',
  cep_lookup_error_message:
    'Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.',

  meta_title: '',
  meta_description: '',
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
  // Navigation
  rotulo_inicio: 'home_label',
  rotulo_produtos: 'products_label',
  rotulo_sobre: 'about_label',
  rotulo_contato: 'contact_label',
  rotulo_carrinho: 'cart_label',
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
  // Catalog
  titulo_produtos_destaque: 'featured_products_title',
  texto_botao_todos_produtos: 'all_products_button_label',
  titulo_pagina_produtos: 'products_page_title',
  placeholder_busca: 'search_placeholder',
  mensagem_catalogo_vazio: 'empty_catalog_message',
  texto_adicionar_carrinho: 'add_to_cart_label',
  texto_solicitar_pedido: 'request_order_label',
  rotulo_estoque_singular: 'stock_label_singular',
  rotulo_estoque_plural: 'stock_label_plural',
  // About
  titulo_sobre: 'about_title',
  texto_sobre: 'about_text',
  texto_botao_sobre: 'about_button_label',
  url_imagem_sobre: 'about_image_url',
  texto_missao: 'mission_text',
  texto_valores: 'values_text',
  texto_compromisso: 'commitment_text',
  // Ordering
  aviso_pedido: 'order_notice',
  aviso_estoque: 'inventory_notice',
  modo_checkout: 'checkout_mode',
  instrucoes_checkout: 'checkout_instructions',
  politica_envio: 'shipping_policy',
  retirada_disponivel: 'pickup_available',
  // Contact
  numero_whatsapp: 'whatsapp_number',
  mensagem_whatsapp: 'whatsapp_message',
  email_contato: 'email',
  localizacao: 'location',
  horario_atendimento: 'business_hours',
  url_instagram: 'instagram_url',
  url_facebook: 'facebook_url',
  // Footer
  nome_footer: 'footer_store_name',
  slogan_footer: 'footer_tagline',
  texto_copyright: 'copyright_text',
  // Language
  idioma_padrao: 'default_language',
  moeda: 'currency',
  local: 'locale',
  // Payment
  pix_ativo: 'pix_enabled',
  ativar_pix: 'pix_enabled',
  chave_pix: 'pix_key',
  nome_recebedor_pix: 'pix_recipient_name',
  cidade_recebedor_pix: 'pix_recipient_city',
  instrucao_pix: 'pix_instruction',
  aviso_confirmacao_pix: 'pix_confirmation_notice',
  url_qr_pix: 'pix_qr_image_url',
  // CEP lookup
  consulta_cep_ativa: 'cep_lookup_enabled',
  aviso_privacidade_cep: 'cep_lookup_privacy_notice',
  mensagem_carregando_cep: 'cep_lookup_loading_message',
  mensagem_sucesso_cep: 'cep_lookup_success_message',
  mensagem_parcial_cep: 'cep_lookup_partial_message',
  mensagem_erro_cep: 'cep_lookup_error_message',
};

export type SiteContentStatus = 'ok' | 'error' | 'not-configured';

export interface SiteContentResult {
  content: SiteContent;
  status: SiteContentStatus;
  error: string | null;
  keyCount: number;
}

/**
 * Fetch the Conteudo_Site (or Site_Content) sheet as a key/value map.
 * Supports both English (`key`/`value`) and pt-BR (`chave`/`valor`) column names.
 */
export async function loadSiteContent(): Promise<SiteContentResult> {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SPREADSHEET_ID as string | undefined;
  const contentTab =
    (import.meta.env.VITE_GOOGLE_SPREADSHEET_CONTENT_TAB as string | undefined) ||
    'Conteudo_Site';

  if (!spreadsheetId) {
    console.warn('[SITE_CONTENT] No spreadsheet ID configured, using defaults');
    return {
      content: { ...DEFAULT_SITE_CONTENT },
      status: 'not-configured',
      error: null,
      keyCount: 0,
    };
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
        throw new Error('A aba de conteúdo não tem as colunas "chave" e "valor".');
      }
    }

    const merged: SiteContent = { ...DEFAULT_SITE_CONTENT };
    let keyCount = 0;
    for (const row of rows) {
      const rawKey = (row.key ?? row.Key ?? row.chave ?? row.Chave ?? '')
        .toString()
        .trim();
      const rawValue = (row.value ?? row.Value ?? row.valor ?? row.Valor ?? '').toString();
      if (!rawKey) continue;
      const internalKey = KEY_ALIASES[rawKey] ?? rawKey;
      // Don't clobber a default with an empty string
      if (rawValue.trim() !== '') {
        merged[internalKey] = rawValue;
        keyCount += 1;
      }
    }
    return { content: merged, status: 'ok', error: null, keyCount };
  } catch (err) {
    console.error('[SITE_CONTENT] Failed to load, using defaults:', err);
    return {
      content: { ...DEFAULT_SITE_CONTENT },
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      keyCount: 0,
    };
  }
}

/**
 * Resolve the WhatsApp number / message — prefers sheet value, falls back to env.
 * Returns empty strings when nothing is configured (never a placeholder number).
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
