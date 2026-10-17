import { describe, it, expect } from 'vitest';
import { rowToProduct } from './products';

const basePt = {
  id: '1',
  nome: 'Cesto de palha',
  preco: '120,00',
  url_imagem: 'https://img/cesto.webp',
  descricao: 'Peça artesanal.',
  categoria: 'Cestaria',
};

describe('rowToProduct — aliases PT/EN', () => {
  it('lit une ligne en portugais', () => {
    const p = rowToProduct({ ...basePt, tipo_estoque: 'unique', quantidade_estoque: '1' });
    expect(p).not.toBeNull();
    expect(p!.id).toBe(1);
    expect(p!.name).toBe('Cesto de palha');
    expect(p!.price).toBe(120);
    expect(p!.image).toBe('https://img/cesto.webp');
  });

  it('lit la même ligne en anglais', () => {
    const p = rowToProduct({
      id: '1',
      name: 'Cesto de palha',
      price: '120.00',
      image_url: 'https://img/cesto.webp',
      description: 'Peça artesanal.',
      category: 'Cestaria',
      inventory_type: 'unique',
      stock_quantity: '1',
    });
    expect(p).not.toBeNull();
    expect(p!.price).toBe(120);
    expect(p!.inventoryType).toBe('unique');
  });

  it('accepte le prix avec virgule', () => {
    expect(rowToProduct(basePt)!.price).toBe(120);
  });
});

describe('rowToProduct — lignes invalides', () => {
  it('refuse une ligne sans id', () => {
    expect(rowToProduct({ nome: 'X', preco: '10', url_imagem: 'https://i/x' })).toBeNull();
  });
  it('refuse une ligne sans nom', () => {
    expect(rowToProduct({ id: '1', preco: '10', url_imagem: 'https://i/x' })).toBeNull();
  });
  it('refuse un prix invalide', () => {
    expect(rowToProduct({ ...basePt, preco: 'abc' })).toBeNull();
  });
});

describe('rowToProduct — inventaire', () => {
  it('peça única : quantité limitée à 1 même si la feuille dit 5', () => {
    const p = rowToProduct({ ...basePt, tipo_estoque: 'unique', quantidade_estoque: '5' });
    expect(p!.inventoryType).toBe('unique');
    expect(p!.stockQuantity).toBe(1);
  });

  it('estoque 0 = esgotado (statut sold_out)', () => {
    const p = rowToProduct({ ...basePt, tipo_estoque: 'limited', quantidade_estoque: '0' });
    expect(p!.stockQuantity).toBe(0);
  });

  it('made_to_order garde le prazo de produção', () => {
    const p = rowToProduct({
      ...basePt,
      tipo_estoque: 'made_to_order',
      prazo_producao: '15 dias',
    });
    expect(p!.inventoryType).toBe('made_to_order');
    expect(p!.productionTime).toBe('15 dias');
  });
});
