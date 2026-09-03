import type { Product } from './products';
import type { RowIssue } from './catalog-validation';
import { looksLikePlaceholder } from './catalog-validation';
import type { CatalogSource } from './catalog-loader';
import type { Store } from './store';
import type { SiteContent, SiteContentStatus } from './site-content';

/**
 * Public, client-side store diagnostics (/verificar-loja).
 * Never includes sensitive configuration — the page is public.
 */

export interface CheckItem {
  key: string;
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'error' | 'info';
  hint?: string;
}

export interface StoreCheckReport {
  generatedAt: string;
  source: CatalogSource;
  updatedAt: string | null;
  items: CheckItem[];
  issues: RowIssue[];
}

const countCode = (issues: RowIssue[], ...codes: string[]) =>
  issues.filter((i) => codes.includes(i.code)).length;

/** Site-content keys that are safe to inspect on a public page. */
const PUBLIC_CONTENT_KEYS = [
  'site_name',
  'site_tagline',
  'meta_title',
  'meta_description',
  'hero_title',
  'hero_description',
  'about_text',
  'email',
  'location',
  'whatsapp_number',
  'whatsapp_message',
  'logo_url',
  'hero_image_url',
];

export interface BuildReportInput {
  products: Product[];
  issues: RowIssue[];
  totalRows: number;
  source: CatalogSource;
  updatedAt: string | null;
  spreadsheetConfigured: boolean;
  spreadsheetError: string | null;
  contentStatus: SiteContentStatus;
  contentError: string | null;
  contentKeyCount: number;
  content: SiteContent;
  store: Store;
}

export function buildStoreCheckReport(input: BuildReportInput): StoreCheckReport {
  const { products, issues, store, content } = input;
  const items: CheckItem[] = [];
  const num = (n: number) => String(n);

  // ---- Connections ----
  items.push({
    key: 'spreadsheet_connection',
    label: 'Conexão com a planilha de produtos',
    value: !input.spreadsheetConfigured
      ? 'Não configurada'
      : input.spreadsheetError
        ? `Falhou (${input.spreadsheetError})`
        : 'Conectada',
    status: !input.spreadsheetConfigured ? 'error' : input.spreadsheetError ? 'error' : 'ok',
    hint: input.spreadsheetError
      ? 'Confira se a planilha está compartilhada como "qualquer pessoa com o link pode ver" e se o nome da aba está correto.'
      : undefined,
  });
  items.push({
    key: 'content_connection',
    label: 'Conexão com o conteúdo do site',
    value:
      input.contentStatus === 'ok'
        ? `Conectada (${input.contentKeyCount} campos preenchidos)`
        : input.contentStatus === 'error'
          ? `Falhou (${input.contentError ?? 'erro desconhecido'})`
          : 'Não configurada',
    status: input.contentStatus === 'ok' ? 'ok' : 'error',
  });
  items.push({
    key: 'source',
    label: 'Fonte de dados exibida agora',
    value:
      input.source === 'spreadsheet'
        ? 'Planilha (dados ao vivo)'
        : input.source === 'cache'
          ? 'Cópia salva no navegador'
          : input.source === 'csv'
            ? 'Arquivo interno do site'
            : 'Sem dados',
    status: input.source === 'spreadsheet' ? 'ok' : input.source === 'none' ? 'error' : 'warn',
  });
  items.push({
    key: 'last_update',
    label: 'Última atualização bem-sucedida',
    value: input.updatedAt
      ? new Date(input.updatedAt).toLocaleString(store.locale)
      : 'Nenhuma nesta sessão',
    status: input.updatedAt ? 'info' : 'warn',
  });

  // ---- Catalog quality ----
  const invalidRows = new Set(
    issues.filter((i) => i.severity === 'error').map((i) => i.row),
  ).size;
  items.push({
    key: 'valid_products',
    label: 'Produtos válidos no catálogo',
    value: num(products.length),
    status: products.length > 0 ? 'ok' : 'error',
  });
  items.push({
    key: 'invalid_rows',
    label: 'Linhas ignoradas por erro',
    value: num(invalidRows),
    status: invalidRows > 0 ? 'warn' : 'ok',
  });
  const checks: Array<[string, string, number]> = [
    ['duplicate_ids', 'IDs repetidos', countCode(issues, 'duplicate_id')],
    ['duplicate_slugs', 'Slugs repetidos', countCode(issues, 'duplicate_slug')],
    ['missing_names', 'Produtos sem nome', countCode(issues, 'missing_name')],
    [
      'invalid_prices',
      'Preços ausentes ou inválidos',
      countCode(issues, 'missing_price', 'invalid_price'),
    ],
    ['missing_images', 'Produtos sem imagem', countCode(issues, 'missing_image')],
    ['invalid_inventory', 'Tipos de estoque inválidos', countCode(issues, 'invalid_inventory')],
    ['zero_stock', 'Produtos com estoque zerado', countCode(issues, 'zero_stock')],
    ['placeholders', 'Valores de exemplo detectados', countCode(issues, 'placeholder')],
  ];
  for (const [key, label, count] of checks) {
    items.push({ key, label, value: num(count), status: count > 0 ? 'warn' : 'ok' });
  }

  // ---- Store configuration (non-sensitive) ----
  items.push({
    key: 'store_name',
    label: 'Nome da loja',
    value: store.optional('site_name') ? 'Configurado' : 'Não configurado',
    status: store.optional('site_name') ? 'ok' : 'error',
    hint: 'Preencha "nome_site" na aba Conteudo_Site.',
  });
  items.push({
    key: 'whatsapp',
    label: 'Número de WhatsApp',
    value: store.contact.hasWhatsApp ? 'Configurado' : 'Não configurado',
    status: store.contact.hasWhatsApp ? 'ok' : 'error',
    hint: 'Preencha "numero_whatsapp" na aba Conteudo_Site.',
  });

  const pixEnabled =
    (store.checkoutMode ?? '').toLowerCase().includes('pix') ||
    ['true', '1', 'sim'].includes((store.optional('pix_enabled') || '').toLowerCase());
  if (pixEnabled) {
    const hasPix = !!store.optional('pix_key');
    items.push({
      key: 'pix',
      label: 'Configuração do Pix',
      value: hasPix ? 'Configurada' : 'Ausente',
      status: hasPix ? 'ok' : 'error',
      hint: 'Preencha "chave_pix" na aba Conteudo_Site.',
    });
  }

  const contentPlaceholders = PUBLIC_CONTENT_KEYS.filter((k) =>
    looksLikePlaceholder(String(content[k] ?? '')),
  );
  items.push({
    key: 'content_placeholders',
    label: 'Campos de conteúdo com valores de exemplo',
    value: contentPlaceholders.length ? contentPlaceholders.join(', ') : 'Nenhum',
    status: contentPlaceholders.length ? 'warn' : 'ok',
  });

  return {
    generatedAt: new Date().toISOString(),
    source: input.source,
    updatedAt: input.updatedAt,
    items,
    issues,
  };
}

export function reportToText(report: StoreCheckReport): string {
  const lines = [
    `Verificação da loja — ${new Date(report.generatedAt).toLocaleString('pt-BR')}`,
    '',
    ...report.items.map((i) => `- ${i.label}: ${i.value}`),
  ];
  if (report.issues.length) {
    lines.push('', 'Linhas com problemas:');
    for (const issue of report.issues) {
      lines.push(
        `- Linha ${issue.row} (${issue.severity === 'error' ? 'erro' : 'aviso'}) [${issue.field}] ${issue.message}`,
      );
    }
  }
  return lines.join('\n');
}

export function issuesToCsv(issues: RowIssue[]): string {
  const header = 'linha,id,nome,campo,codigo,severidade,mensagem';
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = issues.map((i) =>
    [i.row, i.id, i.name, i.field, i.code, i.severity, i.message].map(escape).join(','),
  );
  return [header, ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
