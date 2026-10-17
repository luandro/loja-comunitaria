import { describe, it, expect } from 'vitest';
import { normalize, buildSearchIndex, filterProducts, DEFAULT_FILTERS } from './catalog';
import type { Product } from './products';

const make = (over: Partial<Product>): Product => ({
  id: 1,
  name: 'Produto',
  price: 10,
  image: 'https://i/x',
  description: '',
  inventoryType: 'available',
  active: true,
  ...over,
} as Product);

const products = [
  make({ id: 1, name: 'Colar de sementes açaí', category: 'Adornos', peopleOrCommunity: 'Yawanawá', price: 45 }),
  make({ id: 2, name: 'Cesto de palha', category: 'Cestaria', peopleOrCommunity: 'Kayapó', price: 120 }),
  make({ id: 3, name: 'Pulseira tucumã', category: 'Adornos', inventoryType: 'unique', stockQuantity: 1, price: 30 }),
];

const index = buildSearchIndex(products);

describe('busca insensível a acentos', () => {
  it('normalize retire les accents et la casse', () => {
    expect(normalize('Açaí TUCUMÃ')).toBe('acai tucuma');
  });
  it('trouve "açaí" en tapant "acai"', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, query: 'acai' }, index);
    expect(r.map((p) => p.id)).toEqual([1]);
  });
  it('trouve "tucumã" en tapant "tucuma"', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, query: 'tucuma' }, index);
    expect(r.map((p) => p.id)).toEqual([3]);
  });
});

describe('filtros e ordenação', () => {
  it('filtre par catégorie', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, category: 'Cestaria' }, index);
    expect(r.map((p) => p.id)).toEqual([2]);
  });
  it('filtre par communauté', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, community: 'Yawanawá' }, index);
    expect(r.map((p) => p.id)).toEqual([1]);
  });
  it('filtre les peças únicas disponíveis', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, inventory: 'unique' }, index);
    expect(r.map((p) => p.id)).toEqual([3]);
  });
  it('filtre les esgotados', () => {
    const list = [...products, make({ id: 4, name: 'Esgotado', inventoryType: 'limited', stockQuantity: 0 })];
    const r = filterProducts(list, { ...DEFAULT_FILTERS, inventory: 'sold_out' }, buildSearchIndex(list));
    expect(r.map((p) => p.id)).toEqual([4]);
  });
  it('trie par prix croissant', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, sort: 'price_asc' }, index);
    expect(r.map((p) => p.id)).toEqual([3, 1, 2]);
  });
});
