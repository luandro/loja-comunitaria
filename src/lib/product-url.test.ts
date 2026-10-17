import { describe, it, expect } from 'vitest';
import { findProductByParam, productPath } from './product-url';
import type { Product } from './products';

const products = [
  { id: 12, name: 'Cesto de palha', slug: 'cesto-de-palha' },
  { id: 7, name: 'Colar de sementes', slug: '' },
] as Product[];

describe('rotas diretas de produto (liens statiques)', () => {
  it('trouve par slug', () => {
    expect(findProductByParam(products, 'cesto-de-palha')!.id).toBe(12);
  });
  it('trouve par id numérico (anciens liens)', () => {
    expect(findProductByParam(products, '12')!.id).toBe(12);
    expect(findProductByParam(products, '7')!.id).toBe(7);
  });
  it('trouve par nome quand pas de slug', () => {
    expect(findProductByParam(products, 'colar-de-sementes')!.id).toBe(7);
  });
  it('retourne undefined pour un paramètre inconnu', () => {
    expect(findProductByParam(products, 'n'existe-pas')).toBeUndefined();
  });
  it('productPath préfère le slug', () => {
    expect(productPath(products[0])).toBe('/produto/cesto-de-palha');
    expect(productPath(products[1])).toBe('/produto/7');
  });
});
