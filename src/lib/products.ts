import { getEnv } from './env';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  longDescription?: string;
}

/**
 * Parse CSV string into array of product objects
 */
export function parseCSV(csv: string): Product[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).filter(line => line.trim()).map(line => {
    // More robust CSV parsing for values that may contain commas
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

    // Add the last value
    values.push(currentValue);

    // Clean up quoted values
    const cleanValues = values.map(value => {
      const trimmed = value.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    });
    const product: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      const headerTrim = header.trim();
      if (headerTrim === 'price') {
        product[headerTrim] = Number.parseFloat(cleanValues[index]);
      } else if (headerTrim === 'id') {
        product[headerTrim] = Number.parseInt(cleanValues[index], 10);
      } else {
        product[headerTrim] = cleanValues[index];
      }
    });

    // Validate that the product has all required fields
    if (
      typeof product.id !== 'number' ||
      typeof product.name !== 'string' ||
      typeof product.price !== 'number' ||
      typeof product.image !== 'string' ||
      typeof product.description !== 'string'
    ) {
      throw new Error(`Invalid product data: ${JSON.stringify(product)}`);
    }

    return product as unknown as Product;
  });
}

/**
 * Load products from CSV file
 */
export async function loadProductsFromCSV(): Promise<Product[]> {
  try {
    const response = await fetch('/data/products.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status}`);
    }
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
  try {
    console.log('[PRODUCTS] Attempting to load products from Google Spreadsheet');
    const spreadsheetId = getEnv('GOOGLE_SPREADSHEET_ID');
    const tabName = getEnv('GOOGLE_SPREADSHEET_TAB');

    console.log(`[PRODUCTS] Spreadsheet ID: ${spreadsheetId}, Tab Name: ${tabName}`);

    if (!spreadsheetId || !tabName) {
      console.warn('[PRODUCTS] Missing spreadsheet configuration');
      throw new Error('Missing spreadsheet configuration');
    }

    const url = `https://opensheet.elk.sh/${spreadsheetId}/${tabName}`;
    console.log(`[PRODUCTS] Fetching from URL: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`[PRODUCTS] Failed to fetch from Google Spreadsheet: ${response.status}`);
      throw new Error(`Failed to fetch from Google Spreadsheet: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[PRODUCTS] Received ${data.length} items from spreadsheet`);

    // Transform the data to ensure types are correct
    const transformedData = data.map((item: Record<string, unknown>) => {
      return {
        id: Number.parseInt(String(item.id), 10),
        name: String(item.name),
        price: Number.parseFloat(String(item.price)),
        image: String(item.image),
        description: String(item.description),
        longDescription: item.longDescription ? String(item.longDescription) : undefined
      };
    });

    console.log(`[PRODUCTS] Successfully transformed ${transformedData.length} products`);
    return transformedData;
  } catch (error) {
    console.error('[PRODUCTS] Error loading products from Google Spreadsheet:', error);
    throw error;
  }
}

/**
 * Load products from the preferred source with fallback
 */
export async function loadProducts(): Promise<Product[]> {
  try {
    // Check if Google Spreadsheet configuration is available
    const hasSpreadsheetConfig =
      !!import.meta.env.VITE_GOOGLE_SPREADSHEET_ID &&
      !!import.meta.env.VITE_GOOGLE_SPREADSHEET_TAB;

    if (hasSpreadsheetConfig) {
      // Try loading from Google Spreadsheet
      return await loadProductsFromSpreadsheet();
    }

    console.log('No Google Spreadsheet configuration found, falling back to CSV');
    return await loadProductsFromCSV();
  } catch (error) {
    console.warn('Failed to load from Google Spreadsheet, falling back to CSV', error);
    return await loadProductsFromCSV();
  }
}

/**
 * Find a single product by ID
 */
export async function getProductById(id: number): Promise<Product | undefined> {
  const products = await loadProducts();
  return products.find(p => p.id === id);
}