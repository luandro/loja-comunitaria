import { getEnv } from './env';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  longDescription?: string;
  quantity?: number; // If undefined or 0, product is treated as unique
  isUnique?: boolean;
  category?: string;
  featured?: boolean;
  active?: boolean;
  galleryImages?: string[];
  slug?: string;
  materials?: string;
  peopleOrCommunity?: string;
  originLocation?: string;
  dimensions?: string;
  weightGrams?: number;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
}

const truthy = (v: unknown) => {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  if (!s) return false;
  return s === 'true' || s === '1' || s === 'yes' || s === 'sim' || s === 'y' || s === 'verdadeiro';
};

/** Pick the first non-empty value across alias keys. */
const pick = (row: Record<string, unknown>, ...keys: string[]): string => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim();
    }
  }
  return '';
};

/**
 * Parse CSV string into array of product objects
 */
export function parseCSV(csv: string): Product[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue);

      const cleanValues = values.map((value) => {
        const trimmed = value.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = cleanValues[index] ?? '';
      });
      return rowToProduct(row);
    })
    .filter((p): p is Product => p !== null);
}

/**
 * Convert a raw sheet/CSV row into a normalized Product, or null if invalid.
 * Supports both English (name, price, image_url) and pt-BR (nome, preco, url_imagem) headers.
 */
function rowToProduct(row: Record<string, unknown>): Product | null {
  const idStr = pick(row, 'id');
  const id = Number.parseInt(idStr, 10);
  const name = pick(row, 'name', 'nome');
  const priceStr = pick(row, 'price', 'price_brl', 'preco', 'preco_brl').replace(',', '.');
  const price = Number.parseFloat(priceStr);
  const image =
    pick(row, 'image', 'image_url', 'url_imagem') || '/placeholder.svg';
  const description = pick(row, 'description', 'descricao', 'short_description', 'descricao_curta');

  if (!Number.isFinite(id) || !name || !Number.isFinite(price)) {
    console.warn('[PRODUCTS] Skipping invalid row (missing id/name/price):', row);
    return null;
  }

  const qRaw = pick(row, 'quantity', 'stock_quantity', 'quantidade_estoque');
  const quantity = qRaw ? Number.parseInt(qRaw, 10) : undefined;
  const isUnique = quantity === undefined || quantity === 0;

  const galleryRaw = pick(row, 'gallery_image_urls', 'urls_galeria_imagens');
  const galleryImages = galleryRaw
    ? galleryRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  const longDescription =
    pick(row, 'longDescription', 'details', 'full_description', 'detalhes') || undefined;

  // active defaults to TRUE when the column is absent altogether
  const activeRaw = pick(row, 'active', 'ativo');
  const active = activeRaw === '' ? true : truthy(activeRaw);

  const sortRaw = pick(row, 'sort_order', 'ordem');
  const sortOrder = sortRaw ? Number.parseInt(sortRaw, 10) : undefined;

  const weightRaw = pick(row, 'weight_grams', 'peso_gramas');
  const weightGrams = weightRaw ? Number.parseFloat(weightRaw) : undefined;

  return {
    id,
    name,
    price,
    image,
    description,
    longDescription,
    quantity,
    isUnique,
    active,
    category: pick(row, 'category', 'categoria') || undefined,
    featured: truthy(pick(row, 'featured', 'destaque')),
    galleryImages,
    slug: pick(row, 'slug') || undefined,
    materials: pick(row, 'materials', 'materiais') || undefined,
    peopleOrCommunity: pick(row, 'people_or_community', 'povo_ou_comunidade') || undefined,
    originLocation: pick(row, 'origin_location', 'local_de_origem') || undefined,
    dimensions: pick(row, 'dimensions', 'dimensoes') || undefined,
    weightGrams: Number.isFinite(weightGrams as number) ? weightGrams : undefined,
    sortOrder: Number.isFinite(sortOrder as number) ? sortOrder : undefined,
    seoTitle: pick(row, 'seo_title', 'titulo_seo') || undefined,
    seoDescription: pick(row, 'seo_description', 'descricao_seo') || undefined,
  };
}

/** Filter inactive products and sort by sort_order/ordem then name. */
function finalize(products: Product[]): Product[] {
  return products
    .filter((p) => p.active !== false)
    .sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.sortOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Load products from CSV file
 */
export async function loadProductsFromCSV(): Promise<Product[]> {
  try {
    const response = await fetch('/data/products.csv');
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
    const csv = await response.text();
    return finalize(parseCSV(csv));
  } catch (error) {
    console.error('Error loading products from CSV:', error);
    return [];
  }
}

/**
 * Load products from Google Spreadsheet (via opensheet.elk.sh)
 */
export async function loadProductsFromSpreadsheet(): Promise<Product[]> {
  const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
  const tabName = getEnv('GOOGLE_SPREADSHEET_TAB');

  if (!spreadsheetId || !tabName) {
    throw new Error('Missing spreadsheet configuration');
  }

  const url = `https://opensheet.elk.sh/${spreadsheetId}/${tabName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch from Google Spreadsheet: ${response.status}`);
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;
  if (data.length > 0) {
    const headers = Object.keys(data[0]).map((h) => h.toLowerCase());
    const hasId = headers.includes('id');
    const hasName = headers.some((h) => ['name', 'nome'].includes(h));
    const hasPrice = headers.some((h) =>
      ['price', 'price_brl', 'preco', 'preco_brl'].includes(h),
    );
    if (!hasId || !hasName || !hasPrice) {
      console.warn(
        '[PRODUCTS] Spreadsheet is missing required columns. Found headers:',
        headers,
      );
    }
  }

  return finalize(
    data.map(rowToProduct).filter((p): p is Product => p !== null),
  );
}

/**
 * Load products from the preferred source with fallback
 */
export async function loadProducts(): Promise<Product[]> {
  const hasSpreadsheetConfig =
    !!import.meta.env.VITE_GOOGLE_SPREADSHEET_ID &&
    !!import.meta.env.VITE_GOOGLE_SPREADSHEET_TAB;

  if (hasSpreadsheetConfig) {
    try {
      return await loadProductsFromSpreadsheet();
    } catch (err) {
      console.warn('[PRODUCTS] Spreadsheet load failed, falling back to CSV', err);
    }
  }
  return await loadProductsFromCSV();
}

/**
 * Find a single product by ID
 */
export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find((p) => p.id === id);
}
