import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadCatalogSnapshot, readCachedCatalog } from './catalog-loader';
import type { Product } from './products';

const cachedProduct = {
  id: 1,
  name: 'Cesto de palha',
  price: 120,
  image: 'https://i/x',
  description: '',
  inventoryType: 'unique',
  stockQuantity: 1,
  active: true,
} as Product;

describe('fallback du catalogue caché', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_GOOGLE_SPREADSHEET_ID', 'sheet-id');
    vi.stubEnv('VITE_GOOGLE_SPREADSHEET_TAB', 'Produtos');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('réseau coupé')));
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sert le dernier catalogue valide quand la planilha échoue', async () => {
    localStorage.setItem(
      'catalogLastKnownGood',
      JSON.stringify({ version: 1, products: [cachedProduct], updatedAt: '2026-01-01T00:00:00Z' }),
    );
    const snap = await loadCatalogSnapshot();
    expect(snap.source).toBe('cache');
    expect(snap.products.map((p) => p.id)).toEqual([1]);
    expect(snap.spreadsheetError).toBeTruthy();
  });

  it('sans cache ni planilha, tombe sur le CSV interne ou none', async () => {
    const snap = await loadCatalogSnapshot();
    expect(['csv', 'none']).toContain(snap.source);
    expect(snap.spreadsheetError).toBeTruthy();
  });

  it('readCachedCatalog ignore un cache vide ou corrompu', () => {
    localStorage.setItem('catalogLastKnownGood', '{"version":1,"products":[]}');
    expect(readCachedCatalog()).toBeNull();
    localStorage.setItem('catalogLastKnownGood', '{json cassé');
    expect(readCachedCatalog()).toBeNull();
  });
});
