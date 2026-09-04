import { describe, expect, it } from 'vitest';
import { validateProductRows } from './catalog-validation';

const base = {
  id: '1',
  nome: 'Cesto',
  preco: '10,50',
  url_imagem: 'https://cdn.test/a.jpg',
  tipo_estoque: 'limited',
  quantidade_estoque: '2',
};

describe('validateProductRows', () => {
  it('accepts a valid row and normalizes the price', () => {
    const { products, issues } = validateProductRows([base]);
    expect(products).toHaveLength(1);
    expect(products[0].price).toBe(10.5);
    expect(issues.filter((i) => i.severity === 'error')).toHaveLength(0);
  });

  it('skips malformed rows without breaking the catalog', () => {
    const { products, issues } = validateProductRows([
      { id: '', nome: '', preco: 'abc' },
      base,
    ]);
    expect(products).toHaveLength(1);
    expect(issues.some((i) => i.code === 'missing_name')).toBe(true);
    expect(issues.some((i) => i.code === 'invalid_price')).toBe(true);
  });

  it('reports duplicate ids and keeps the first row only', () => {
    const { products, issues } = validateProductRows([base, { ...base, nome: 'Outro' }]);
    expect(products).toHaveLength(1);
    expect(issues.some((i) => i.code === 'duplicate_id')).toBe(true);
  });

  it('warns about missing images, zero stock and placeholder values', () => {
    const { products, issues } = validateProductRows([
      {
        ...base,
        url_imagem: '',
        quantidade_estoque: '0',
        descricao: 'https://example.com/foto',
      },
    ]);
    expect(products).toHaveLength(1);
    expect(issues.some((i) => i.code === 'missing_image')).toBe(true);
    expect(issues.some((i) => i.code === 'zero_stock')).toBe(true);
    expect(issues.some((i) => i.code === 'placeholder')).toBe(true);
  });

  it('flags unknown inventory types but still loads the product', () => {
    const { products, issues } = validateProductRows([{ ...base, tipo_estoque: 'infinito' }]);
    expect(products).toHaveLength(1);
    expect(issues.some((i) => i.code === 'invalid_inventory')).toBe(true);
  });
});
