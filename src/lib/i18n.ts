/**
 * Central translation dictionary for generic (non store-specific) UI strings.
 *
 * Nothing here may mention a specific store, city, culture, phone number or
 * e-mail. Store-specific content lives in the `Conteudo_Site` spreadsheet tab.
 */

export type LanguageCode = 'pt-BR' | 'en';

const ptBR = {
  // Generic branding fallbacks (white-label, never a real store name)
  store_name_fallback: 'Loja Comunitária',
  store_tagline_fallback: 'Produtos feitos pela nossa comunidade.',

  // Navigation
  nav_home: 'Início',
  nav_products: 'Produtos',
  nav_about: 'Sobre',
  nav_contact: 'Contato',
  nav_cart: 'Carrinho',
  nav_menu: 'Menu',
  quick_links: 'Links rápidos',

  // Hero / home
  hero_title_fallback: 'Artesanato da nossa comunidade',
  hero_description_fallback:
    'Peças feitas à mão, vendidas diretamente por quem produz.',
  hero_button_fallback: 'Ver produtos',
  featured_products_title: 'Produtos em destaque',
  all_products_button_label: 'Ver todos os produtos',

  // Catalog
  products_page_title: 'Nossos produtos',
  search_placeholder: 'Buscar produtos…',
  search_label: 'Buscar produtos',
  empty_catalog_message: 'Nenhum produto disponível no momento. Volte mais tarde!',
  empty_search_message: 'Nenhum produto encontrado para esta busca.',
  add_to_cart_label: 'Adicionar ao carrinho',
  sold_out_label: 'Esgotado',
  already_in_cart_label: 'Já no carrinho',
  unavailable_label: 'Indisponível',
  loading: 'Carregando…',
  product_not_found: 'Produto não encontrado',
  back_to_products: 'Voltar para produtos',
  decrease_quantity: 'Diminuir quantidade',
  increase_quantity: 'Aumentar quantidade',
  remove_item: 'Remover item',

  // About
  about_title_fallback: 'Sobre a loja',
  about_button_fallback: 'Conheça a loja',
  mission_title: 'Nossa missão',
  values_title: 'Nossos valores',
  commitment_title: 'Nosso compromisso',

  // Cart / order request
  cart_title: 'Seu carrinho',
  cart_empty_title: 'Seu carrinho está vazio',
  continue_shopping: 'Continuar navegando',
  order_summary_title: 'Resumo da solicitação',
  subtotal: 'Subtotal',
  reference_code: 'Código de referência',
  request_order_label: 'Solicitar pedido pelo WhatsApp',
  clear_cart: 'Limpar carrinho',
  order_notice_fallback:
    'Monte sua solicitação — a loja confirma disponibilidade, prazo e frete pelo WhatsApp.',
  inventory_notice_fallback:
    'Seu carrinho não reserva os produtos. A loja confirmará disponibilidade, prazo e frete.',
  availability_disclaimer: 'Disponibilidade sujeita à confirmação.',
  shipping_pending_notice: 'Frete e valor final serão informados pela loja no WhatsApp.',
  order_form_incomplete:
    'Preencha nome, cidade, estado e marque a confirmação para liberar o envio.',
  order_ready_title: 'Solicitação pronta para envio',
  order_ready_description:
    'Envie a mensagem no WhatsApp. Seu carrinho continua salvo até a loja confirmar.',

  // Contact
  contact_page_title: 'Entre em contato',
  contact_info_title: 'Informações de contato',
  whatsapp: 'WhatsApp',
  whatsapp_cta_title: 'Fale conosco pelo WhatsApp',
  whatsapp_cta_subtitle: 'Resposta rápida e direta com a loja',
  whatsapp_click_to_talk: 'Clique para conversar',
  address: 'Endereço',
  email: 'E-mail',
  business_hours: 'Horário de atendimento',
  contact_form_title: 'Envie sua mensagem',
  field_name: 'Nome',
  field_email: 'E-mail',
  field_message: 'Mensagem',
  send_message: 'Enviar mensagem',
  message_sent_title: 'Mensagem enviada!',
  message_sent_description: 'Entraremos em contato em breve.',
  no_contact_channel:
    'Esta loja ainda não configurou um canal de contato.',

  // Diagnostics
  diagnostics_title: 'Configuração incompleta',
  diag_missing_spreadsheet:
    'Nenhuma planilha configurada (VITE_GOOGLE_SPREADSHEET_ID). O catálogo e o conteúdo do site não serão carregados.',
  diag_missing_store_name: 'Defina "nome_site" (site_name) na aba Conteudo_Site.',
  diag_missing_whatsapp:
    'Defina "numero_whatsapp" (whatsapp_number) na aba Conteudo_Site. Os botões de WhatsApp estão ocultos.',
  diag_missing_contact:
    'Nenhum canal de contato configurado (WhatsApp, e-mail ou endereço).',

  // Footer
  rights_reserved: 'Todos os direitos reservados.',
} as const;

export type TranslationKey = keyof typeof ptBR;

const en: Partial<Record<TranslationKey, string>> = {
  store_name_fallback: 'Community Store',
  store_tagline_fallback: 'Products made by our community.',
  nav_home: 'Home',
  nav_products: 'Products',
  nav_about: 'About',
  nav_contact: 'Contact',
  nav_cart: 'Cart',
  nav_menu: 'Menu',
  quick_links: 'Quick links',
  hero_title_fallback: 'Handmade by our community',
  hero_description_fallback: 'Handcrafted pieces, sold directly by their makers.',
  hero_button_fallback: 'Browse products',
  featured_products_title: 'Featured products',
  all_products_button_label: 'See all products',
  products_page_title: 'Our products',
  search_placeholder: 'Search products…',
  search_label: 'Search products',
  empty_catalog_message: 'No products available right now. Check back soon!',
  empty_search_message: 'No products matched your search.',
  add_to_cart_label: 'Add to cart',
  sold_out_label: 'Sold out',
  already_in_cart_label: 'Already in cart',
  unavailable_label: 'Unavailable',
  loading: 'Loading…',
  product_not_found: 'Product not found',
  back_to_products: 'Back to products',
  cart_title: 'Your cart',
  cart_empty_title: 'Your cart is empty',
  continue_shopping: 'Keep browsing',
  order_summary_title: 'Request summary',
  subtotal: 'Subtotal',
  reference_code: 'Reference code',
  request_order_label: 'Request order on WhatsApp',
  clear_cart: 'Clear cart',
  contact_page_title: 'Get in touch',
  contact_info_title: 'Contact information',
  address: 'Address',
  email: 'Email',
  business_hours: 'Opening hours',
  send_message: 'Send message',
  rights_reserved: 'All rights reserved.',
};

const DICTIONARIES: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
  'pt-BR': ptBR,
  en,
};

export function translate(key: TranslationKey, language: string): string {
  const lang: LanguageCode = language?.toLowerCase().startsWith('en') ? 'en' : 'pt-BR';
  return DICTIONARIES[lang][key] ?? ptBR[key];
}
