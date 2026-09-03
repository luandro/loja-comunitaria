import { getEnv } from './env';
import { finalize, loadProductsFromCSV, type Product } from './products';
import { validateProductRows, type RowIssue } from './catalog-validation';

/**
 * Catalog loading strategy (100% client-side):
 *   1. Try the Google Sheet → validate & normalize.
 *   2. Valid products found → display + save as "last known good" (localStorage).
 *   3. Sheet load fails → last known good catalog.
 *   4. No cache → bundled CSV.
 * The active source is always reported so the UI can be honest about it.
 */

export type CatalogSource = 'spreadsheet' | 'cache' | 'csv' | 'none';

export interface CatalogSnapshot {
  products: Product[];
  source: CatalogSource;
  /** ISO timestamp of the last successful spreadsheet load. */
  updatedAt: string | null;
  issues: RowIssue[];
  totalRows: number;
  /** Error message when the spreadsheet could not be loaded. */
  spreadsheetError: string | null;
  spreadsheetConfigured: boolean;
}

const CACHE_KEY = 'catalogLastKnownGood';
const CACHE_VERSION = 1;

interface CachedCatalog {
  version: number;
  products: Product[];
  updatedAt: string;
}

export function readCachedCatalog(): CachedCatalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedCatalog;
    if (parsed?.version !== CACHE_VERSION || !Array.isArray(parsed.products)) return null;
    if (parsed.products.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedCatalog(products: Product[], updatedAt: string) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ version: CACHE_VERSION, products, updatedAt } satisfies CachedCatalog),
    );
  } catch {
    /* storage full or unavailable — cache is best-effort */
  }
}

export function spreadsheetUrl(): string | null {
  const id = getEnv('GOOGLE_SPREADSHEET_ID');
  if (!id) return null;
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

/** Fetch + validate the Produtos tab. Throws when the sheet is unreachable. */
async function fetchSheetCatalog() {
  const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
  const tabName = getEnv('GOOGLE_SPREADSHEET_TAB');
  if (!spreadsheetId || !tabName) throw new Error('Planilha não configurada');

  const res = await fetch(`https://opensheet.elk.sh/${spreadsheetId}/${tabName}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Array<Record<string, unknown>>;
  if (!Array.isArray(data)) throw new Error('Resposta inesperada da planilha');
  return validateProductRows(data);
}

export async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  const spreadsheetConfigured = !!getEnv('GOOGLE_SPREADSHEET_ID');

  if (spreadsheetConfigured) {
    try {
      const { products, issues, totalRows } = await fetchSheetCatalog();
      const valid = finalize(products);
      if (valid.length > 0) {
        const updatedAt = new Date().toISOString();
        writeCachedCatalog(valid, updatedAt);
        return {
          products: valid,
          source: 'spreadsheet',
          updatedAt,
          issues,
          totalRows,
          spreadsheetError: null,
          spreadsheetConfigured,
        };
      }
      // Sheet reachable but produced no usable product — fall through to cache/CSV
      const cached = readCachedCatalog();
      if (cached) {
        return {
          products: cached.products,
          source: 'cache',
          updatedAt: cached.updatedAt,
          issues,
          totalRows,
          spreadsheetError: 'Nenhum produto válido na planilha',
          spreadsheetConfigured,
        };
      }
      const csv = await loadProductsFromCSV();
      return {
        products: csv,
        source: csv.length ? 'csv' : 'none',
        updatedAt: null,
        issues,
        totalRows,
        spreadsheetError: 'Nenhum produto válido na planilha',
        spreadsheetConfigured,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[CATALOG] Spreadsheet load failed:', message);
      const cached = readCachedCatalog();
      if (cached) {
        return {
          products: cached.products,
          source: 'cache',
          updatedAt: cached.updatedAt,
          issues: [],
          totalRows: cached.products.length,
          spreadsheetError: message,
          spreadsheetConfigured,
        };
      }
      const csv = await loadProductsFromCSV();
      return {
        products: csv,
        source: csv.length ? 'csv' : 'none',
        updatedAt: null,
        issues: [],
        totalRows: csv.length,
        spreadsheetError: message,
        spreadsheetConfigured,
      };
    }
  }

  const cached = readCachedCatalog();
  if (cached) {
    return {
      products: cached.products,
      source: 'cache',
      updatedAt: cached.updatedAt,
      issues: [],
      totalRows: cached.products.length,
      spreadsheetError: null,
      spreadsheetConfigured,
    };
  }
  const csv = await loadProductsFromCSV();
  return {
    products: csv,
    source: csv.length ? 'csv' : 'none',
    updatedAt: null,
    issues: [],
    totalRows: csv.length,
    spreadsheetError: null,
    spreadsheetConfigured,
  };
}
