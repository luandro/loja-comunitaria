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

  // Catalog filters
  filters_title: 'Filtros',
  filter_category: 'Categoria',
  filter_community: 'Comunidade',
  filter_inventory: 'Disponibilidade',
  filter_sort: 'Ordenar por',
  filter_all_option: 'Todas',
  clear_filters: 'Limpar filtros',
  active_filters_label: 'Filtros ativos',
  remove_filter: 'Remover filtro',
  results_count_one: '1 produto encontrado',
  results_count_many: '{count} produtos encontrados',
  inv_all: 'Todos',
  inv_available: 'Disponíveis',
  inv_unique: 'Peças únicas',
  inv_made_to_order: 'Feitos sob encomenda',
  inv_sold_out: 'Esgotados',
  sort_featured: 'Destaques',
  sort_community: 'Ordem da comunidade',
  sort_name: 'Nome',
  sort_price_asc: 'Menor preço',
  sort_price_desc: 'Maior preço',

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

  // Product detail / provenance labels
  label_community: 'Povo ou comunidade',
  label_maker: 'Quem fez',
  label_origin: 'Local de origem',
  label_materials: 'Materiais',
  label_technique: 'Técnica',
  label_dimensions: 'Dimensões',
  label_care: 'Cuidados',
  label_production_time: 'Tempo de produção',
  label_shipping: 'Envio',
  label_revenue: 'Destino da renda',
  label_category: 'Categoria',
  product_gallery_label: 'Galeria de imagens do produto',
  community_page_products_title: 'Produtos desta comunidade',
  community_not_found: 'Comunidade não encontrada',
  community_links_title: 'Contato e redes',
  view_community: 'Ver comunidade',

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

  // Catalog data source / freshness
  catalog_stale_notice:
    'Estamos exibindo a última versão disponível do catálogo. Algumas informações podem ter sido atualizadas pela comunidade.',
  catalog_refresh: 'Atualizar catálogo',
  catalog_refreshing: 'Atualizando…',
  catalog_source_spreadsheet: 'Planilha',
  catalog_source_cache: 'Cópia salva no navegador',
  catalog_source_csv: 'Arquivo interno do site',
  catalog_source_none: 'Sem dados',
  catalog_last_update: 'Última atualização',
  store_check_link: 'Verificar loja',

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
  filters_title: 'Filters',
  filter_category: 'Category',
  filter_community: 'Community',
  filter_inventory: 'Availability',
  filter_sort: 'Sort by',
  filter_all_option: 'All',
  clear_filters: 'Clear filters',
  active_filters_label: 'Active filters',
  remove_filter: 'Remove filter',
  results_count_one: '1 product found',
  results_count_many: '{count} products found',
  inv_all: 'All',
  inv_available: 'Available',
  inv_unique: 'One-of-a-kind',
  inv_made_to_order: 'Made to order',
  inv_sold_out: 'Sold out',
  sort_featured: 'Featured',
  sort_community: 'Community order',
  sort_name: 'Name',
  sort_price_asc: 'Lowest price',
  sort_price_desc: 'Highest price',

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
  label_community: 'People or community',
  label_maker: 'Made by',
  label_origin: 'Place of origin',
  label_materials: 'Materials',
  label_technique: 'Technique',
  label_dimensions: 'Dimensions',
  label_care: 'Care',
  label_production_time: 'Production time',
  label_shipping: 'Shipping',
  label_revenue: 'Where the revenue goes',
  label_category: 'Category',
  product_gallery_label: 'Product image gallery',
  community_page_products_title: 'Products from this community',
  community_not_found: 'Community not found',
  community_links_title: 'Contact and links',
  view_community: 'View community',
};

const DICTIONARIES: Record<LanguageCode, Partial<Record<TranslationKey, string>>> = {
  'pt-BR': ptBR,
  en,
};

export function translate(key: TranslationKey, language: string): string {
  const lang: LanguageCode = language?.toLowerCase().startsWith('en') ? 'en' : 'pt-BR';
  return DICTIONARIES[lang][key] ?? ptBR[key];
}
