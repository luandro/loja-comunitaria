import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { CartProvider, useCart, type CartItem } from './CartContext';
import { SiteContentProvider } from './SiteContentContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SiteContentProvider>
    <CartProvider>{children}</CartProvider>
  </SiteContentProvider>
);

const item = (over: Partial<CartItem>): CartItem => ({
  id: 1,
  name: 'Peça única',
  price: 100,
  image: 'https://i/x',
  quantity: 1,
  ...over,
});

describe('limites de quantité du panier', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  });

  it('peça única : une seule unité même en ajoutant deux fois', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item({ maxQuantity: 1 })));
    act(() => result.current.addItem(item({ maxQuantity: 1 })));
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('updateQuantity plafonne à maxQuantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item({ maxQuantity: 3 })));
    act(() => result.current.updateQuantity(1, 10));
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it('sans maxQuantity, les quantités s’additionnent librement', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addItem(item({})));
    act(() => result.current.addItem(item({ quantity: 2 })));
    expect(result.current.cart[0].quantity).toBe(3);
  });

  it('createOrder génère une référence LC-XXXXXX stable', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    let ref = '';
    act(() => {
      ref = result.current.createOrder();
    });
    expect(ref).toMatch(/^LC-[A-Z0-9]{6}$/);
    let ref2 = '';
    act(() => {
      ref2 = result.current.createOrder();
    });
    expect(ref2).toBe(ref);
  });
});
