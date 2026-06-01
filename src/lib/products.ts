import { getEnv } from './env';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  longDescription?: string;
  quantity?: number; // Optional: If undefined or 0, product is unique
  isUnique?: boolean; // Derived property: true if quantity is undefined or 0
  category?: string;
  featured?: boolean;
  galleryImages?: string[];
  slug?: string;
}

const truthy = (v: unknown) => {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'sim' || s === 'y';
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
 */
function rowToProduct(row: Record<string, unknown>): Product | null {
  const id = Number.parseInt(String(row.id ?? ''), 10);
  const name = String(row.name ?? '').trim();
  const price = Number.parseFloat(String(row.price ?? ''));
  const image = String(row.image ?? row.image_url ?? '').trim() || '/placeholder.svg';
  const description = String(row.description ?? '').trim();

  if (!Number.isFinite(id) || !name || !Number.isFinite(price)) {
    console.warn('[PRODUCTS] Skipping invalid row:', row);
    return null;
  }

  const qRaw = String(row.quantity ?? row.stock_quantity ?? '').trim();
  const quantity = qRaw ? Number.parseInt(qRaw, 10) : undefined;
  const isUnique = quantity === undefined || quantity === 0;

  const galleryRaw = String(row.gallery_image_urls ?? '').trim();
  const galleryImages = galleryRaw
    ? galleryRaw.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  return {
    id,
    name,
    price,
    image,
    description,
    longDescription: row.longDescription
      ? String(row.longDescription)
      : row.details
      ? String(row.details)
      : undefined,
    quantity,
    isUnique,
    category: row.category ? String(row.category) : undefined,
    featured: truthy(row.featured),
    galleryImages,
    slug: row.slug ? String(row.slug) : undefined,
  };
}

/**
 * Load products from CSV file
 */
export async function loadProductsFromCSV(): Promise<Product[]> {
  try {
    const response = await fetch('/data/products.csv');
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
    const csv = await response.text();
    return parseCSV(csv);
  } catch (error) {
    console.error('Error loading products from CSV:', error);
    return [];
  }
}

/**
 * Load products from Google Spreadsheet
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
  return data
    .map(rowToProduct)
    .filter((p): p is Product => p !== null);
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
