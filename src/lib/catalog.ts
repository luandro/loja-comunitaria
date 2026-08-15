import type { Product } from './products';
import { getInventoryStatus } from './inventory';

export type InventoryFilter = 'all' | 'available' | 'unique' | 'made_to_order' | 'sold_out';
export type SortOption = 'featured' | 'community' | 'name' | 'price_asc' | 'price_desc';

export const INVENTORY_FILTERS: InventoryFilter[] = [
  'all',
  'available',
  'unique',
  'made_to_order',
  'sold_out',
];

export const SORT_OPTIONS: SortOption[] = [
  'featured',
  'community',
  'name',
  'price_asc',
  'price_desc',
];

export interface CatalogFilterState {
  query: string;
  category: string;
  community: string;
  inventory: InventoryFilter;
  sort: SortOption;
}

export const DEFAULT_FILTERS: CatalogFilterState = {
  query: '',
  category: '',
  community: '',
  inventory: 'all',
  sort: 'featured',
};

/** Lowercase + strip accents so search ignores case and diacritics. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

const SEARCH_FIELDS: (keyof Product)[] = [
  'name',
  'description',
  'longDescription',
  'category',
  'materials',
  'technique',
  'peopleOrCommunity',
  'makerName',
  'originLocation',
];

/** Precomputed haystack, built once per catalog load. */
export function buildSearchIndex(products: Product[]): Map<number, string> {
  const index = new Map<number, string>();
  for (const product of products) {
    const haystack = SEARCH_FIELDS.map((field) => product[field])
      .filter((v) => typeof v === 'string' && v)
      .join(' ');
    index.set(product.id, normalize(haystack));
  }
  return index;
}

function matchesInventory(product: Product, filter: InventoryFilter): boolean {
  if (filter === 'all') return true;
  const status = getInventoryStatus(product);
  switch (filter) {
    case 'available':
      return !status.isSoldOut;
    case 'unique':
      return status.type === 'unique' && !status.isSoldOut;
    case 'made_to_order':
      return status.type === 'made_to_order';
    case 'sold_out':
      return status.isSoldOut;
    default:
      return true;
  }
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price);
    case 'community':
      return list.sort((a, b) => {
        const ac = a.peopleOrCommunity ?? '';
        const bc = b.peopleOrCommunity ?? '';
        if (ac !== bc) return ac.localeCompare(bc);
        return a.name.localeCompare(b.name);
      });
    case 'featured':
    default:
      return list.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        const ao = a.sortOrder ?? Number.POSITIVE_INFINITY;
        const bo = b.sortOrder ?? Number.POSITIVE_INFINITY;
        if (ao !== bo) return ao - bo;
        return a.name.localeCompare(b.name);
      });
  }
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilterState,
  searchIndex: Map<number, string>,
): Product[] {
  const terms = normalize(filters.query).split(/\s+/).filter(Boolean);
  const category = normalize(filters.category);
  const community = normalize(filters.community);

  const result = products.filter((product) => {
    if (category && normalize(product.category ?? '') !== category) return false;
    if (community && normalize(product.peopleOrCommunity ?? '') !== community) return false;
    if (!matchesInventory(product, filters.inventory)) return false;
    if (terms.length > 0) {
      const haystack = searchIndex.get(product.id) ?? '';
      if (!terms.every((term) => haystack.includes(term))) return false;
    }
    return true;
  });

  return sortProducts(result, filters.sort);
}

/** Distinct, sorted values for a facet. Empty when the facet is not useful. */
export function facetValues(products: Product[], key: 'category' | 'peopleOrCommunity'): string[] {
  const values = new Set<string>();
  for (const product of products) {
    const value = (product[key] ?? '').toString().trim();
    if (value) values.add(value);
  }
  const list = [...values].sort((a, b) => a.localeCompare(b));
  return list.length > 1 ? list : [];
}

/** Inventory options that actually match at least one product. */
export function inventoryOptions(products: Product[]): InventoryFilter[] {
  const useful = INVENTORY_FILTERS.filter(
    (f) => f === 'all' || products.some((p) => matchesInventory(p, f)),
  );
  return useful.length > 2 ? useful : [];
}
