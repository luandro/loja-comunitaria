import { z } from 'zod';
import { INVENTORY_TYPES } from './inventory';
import { pick, rowToProduct, type Product } from './products';

/**
 * Schema validation for the public Google Sheets CMS.
 *
 * Every row is parsed → normalized → validated. A malformed row is skipped and
 * reported as an issue; it must never break the storefront.
 */

export type IssueSeverity = 'error' | 'warning';

export interface RowIssue {
  /** 1-based row number as seen in the spreadsheet (header = row 1). */
  row: number;
  id?: string;
  name?: string;
  field: string;
  code: string;
  message: string;
  severity: IssueSeverity;
}

export const productSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().trim().min(1),
  price: z.number().finite().nonnegative(),
  image: z.string().trim().min(1),
  description: z.string(),
  inventoryType: z.enum(INVENTORY_TYPES as unknown as [string, ...string[]]),
  stockQuantity: z.number().int().nonnegative().optional(),
});

/** Values that look like unedited template/demo data. */
const PLACEHOLDER_PATTERNS = [
  /example\.com/i,
  /placeholder/i,
  /lorem ipsum/i,
  /seu[-_ ](nome|email|numero|número)/i,
  /your[-_ ](name|email|number)/i,
  /\b(5599999999999|99999999999|00000000000)\b/,
  /@(exemplo|example)\./i,
  /xxxx/i,
];

export function looksLikePlaceholder(value: string): boolean {
  const v = (value ?? '').trim();
  if (!v) return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(v));
}

export interface CatalogValidation {
  products: Product[];
  issues: RowIssue[];
  totalRows: number;
}

/**
 * Parse, normalize and validate raw spreadsheet/CSV rows.
 * Only sufficiently valid rows reach the catalog.
 */
export function validateProductRows(
  rows: Array<Record<string, unknown>>,
): CatalogValidation {
  const products: Product[] = [];
  const issues: RowIssue[] = [];
  const seenIds = new Map<number, number>();
  const seenSlugs = new Map<string, number>();

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // header occupies row 1
    const rawId = pick(raw, 'id');
    const rawName = pick(raw, 'name', 'nome');
    const add = (
      field: string,
      code: string,
      message: string,
      severity: IssueSeverity = 'error',
    ) =>
      issues.push({
        row: rowNumber,
        id: rawId || undefined,
        name: rawName || undefined,
        field,
        code,
        message,
        severity,
      });

    const product = rowToProduct(raw);
    if (!product) {
      if (!rawId) add('id', 'missing_id', 'Linha sem "id".');
      if (!rawName) add('nome', 'missing_name', 'Linha sem "nome".');
      const rawPrice = pick(raw, 'price', 'price_brl', 'preco', 'preco_brl');
      if (!rawPrice) add('preco', 'missing_price', 'Linha sem "preco".');
      else if (!Number.isFinite(Number.parseFloat(rawPrice.replace(',', '.'))))
        add('preco', 'invalid_price', `Preço inválido: "${rawPrice}".`);
      if (rawId && !Number.isFinite(Number.parseInt(rawId, 10)))
        add('id', 'invalid_id', `ID inválido: "${rawId}".`);
      return;
    }

    const parsed = productSchema.safeParse(product);
    if (!parsed.success) {
      for (const err of parsed.error.issues) {
        add(String(err.path[0] ?? '—'), 'schema', err.message);
      }
      return;
    }

    // Uniqueness checks — duplicates are skipped, not merged.
    const firstIdRow = seenIds.get(product.id);
    if (firstIdRow) {
      add('id', 'duplicate_id', `ID ${product.id} repetido (já usado na linha ${firstIdRow}).`);
      return;
    }
    seenIds.set(product.id, rowNumber);

    if (product.slug) {
      const firstSlugRow = seenSlugs.get(product.slug);
      if (firstSlugRow) {
        add(
          'slug',
          'duplicate_slug',
          `Slug "${product.slug}" repetido (já usado na linha ${firstSlugRow}).`,
          'warning',
        );
      } else {
        seenSlugs.set(product.slug, rowNumber);
      }
    }

    // Non-blocking quality warnings
    const rawInventory = pick(raw, 'inventory_type', 'tipo_estoque');
    if (
      rawInventory &&
      !INVENTORY_TYPES.includes(
        rawInventory.toLowerCase().replace(/[\s-]+/g, '_') as (typeof INVENTORY_TYPES)[number],
      )
    ) {
      add(
        'tipo_estoque',
        'invalid_inventory',
        `Tipo de estoque desconhecido: "${rawInventory}".`,
        'warning',
      );
    }
    if (!pick(raw, 'image', 'image_url', 'url_imagem')) {
      add('url_imagem', 'missing_image', 'Produto sem imagem.', 'warning');
    }
    if (
      (product.inventoryType === 'unique' || product.inventoryType === 'limited') &&
      (product.stockQuantity ?? 0) === 0
    ) {
      add('quantidade_estoque', 'zero_stock', 'Produto sem estoque (esgotado).', 'warning');
    }
    for (const [field, value] of Object.entries({
      nome: product.name,
      url_imagem: product.image,
      descricao: product.description,
    })) {
      if (looksLikePlaceholder(String(value))) {
        add(field, 'placeholder', `Valor de exemplo detectado: "${value}".`, 'warning');
      }
    }

    products.push(product);
  });

  return { products, issues, totalRows: rows.length };
}
