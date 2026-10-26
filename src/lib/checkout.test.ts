import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildCheckoutMessage,
  buildDeliveryLines,
  cartBlockingIssue,
  EMPTY_CHECKOUT,
  firstMissing,
  generateReferenceCode,
  isCheckoutReady,
  loadCheckout,
  pixDecision,
  saveCheckout,
  type CheckoutData,
} from '@/lib/checkout';
import { buildPixPayload } from '@/lib/pix';
import { createStore } from '@/lib/store';
import type { SiteContent } from '@/lib/site-content';
import type { CartItem } from '@/context/CartContext';

const item = (over: Partial<CartItem>): CartItem => ({
  id: 1,
  name: 'Cesto Krahô',
  price: 120,
  image: '',
  quantity: 1,
  ...over,
});

const delivery: CheckoutData = {
  ...EMPTY_CHECKOUT,
  name: 'Maria',
  cep: '69000000',
  street: 'Rua das Flores',
  number: '25',
  city: 'Manaus',
  state: 'AM',
  complement: 'próximo à escola',
};

const pickup: CheckoutData = {
  ...EMPTY_CHECKOUT,
  delivery: 'retirada',
  name: 'Maria',
};

const pixConfig = {
  key: 'loja@exemplo.com',
  recipientName: 'Associacao',
  recipientCity: 'Manaus',
};

const content = (over: Partial<SiteContent>): SiteContent =>
  ({ ...over } as unknown as SiteContent);

describe('pix_automatico flag', () => {
  it('defaults to ON when the flag is absent', () => {
    expect(createStore(content({})).pixAutomatic).toBe(true);
  });

  it('is ON when explicitly TRUE', () => {
    expect(createStore(content({ pix_automatico: 'TRUE' })).pixAutomatic).toBe(true);
  });

  it('is OFF when FALSE (any casing)', () => {
    expect(createStore(content({ pix_automatico: 'FALSE' })).pixAutomatic).toBe(false);
    expect(createStore(content({ pix_automatico: 'false' })).pixAutomatic).toBe(false);
  });
});

describe('pixDecision', () => {
  const base = {
    pixAutomatic: true,
    pixAvailable: true,
    ready: true,
    amount: 240,
    delivery: 'retirada' as const,
    freightSeparate: false,
  };

  it('shows Pix for pickup when everything is ready', () => {
    expect(pixDecision(base)).toEqual({ show: true, freightNote: false });
  });

  it('never shows Pix when pix_automatico is FALSE', () => {
    expect(pixDecision({ ...base, pixAutomatic: false }).show).toBe(false);
  });

  it('never shows Pix with invalid/missing Pix configuration', () => {
    expect(pixDecision({ ...base, pixAvailable: false }).show).toBe(false);
  });

  it('never shows Pix before the checkout information is complete', () => {
    expect(pixDecision({ ...base, ready: false }).show).toBe(false);
  });

  it('never shows Pix for a zero or unknown amount', () => {
    expect(pixDecision({ ...base, amount: 0 }).show).toBe(false);
  });

  it('skips Pix for delivery when freight is unknown (default)', () => {
    const d = pixDecision({ ...base, delivery: 'entrega', freightSeparate: false });
    expect(d.show).toBe(false);
  });

  it('shows Pix for delivery with freightNote when freight is separate', () => {
    const d = pixDecision({ ...base, delivery: 'entrega', freightSeparate: true });
    expect(d).toEqual({ show: true, freightNote: true });
  });
});

describe('Pix payload amount', () => {
  it('charges exactly the known amount', () => {
    const payload = buildPixPayload({ ...pixConfig, amount: 240, reference: 'LC-A7F42' });
    expect(payload).toContain('5406240.00');
  });

  it('regenerates a different payload when the cart amount changes', () => {
    const a = buildPixPayload({ ...pixConfig, amount: 240, reference: 'LC-A7F42' });
    const b = buildPixPayload({ ...pixConfig, amount: 120, reference: 'LC-A7F42' });
    expect(a).not.toBe(b);
  });

  it('returns empty string for invalid configuration (never a broken QR)', () => {
    expect(buildPixPayload({ ...pixConfig, key: '', amount: 240, reference: 'X' })).toBe('');
  });
});

describe('checkout validation', () => {
  it('delivery requires city/state and a number or "Sem número"', () => {
    expect(isCheckoutReady(delivery)).toBe(true);
    expect(firstMissing({ ...delivery, city: '' })).toBe('city');
    expect(firstMissing({ ...delivery, number: '' })).toBe('number');
    expect(isCheckoutReady({ ...delivery, number: '', noNumber: true })).toBe(true);
  });

  it('pickup requires only a name', () => {
    expect(isCheckoutReady(pickup)).toBe(true);
    expect(firstMissing({ ...pickup, name: '' })).toBe('name');
  });

  it('name is always required', () => {
    expect(firstMissing({ ...delivery, name: ' ' })).toBe('name');
  });
});

describe('delivery lines (rural/Indigenous/riverside friendly)', () => {
  it('formats a conventional address concisely', () => {
    expect(buildDeliveryLines(delivery)).toEqual([
      '🚚 Entrega',
      'Rua das Flores, 25',
      'Manaus/AM',
      'Referência: próximo à escola',
    ]);
  });

  it('works without street and without number', () => {
    const rural: CheckoutData = {
      ...EMPTY_CHECKOUT,
      name: 'Maria',
      neighborhood: 'Comunidade Exemplo',
      noNumber: true,
      city: 'Santarém',
      state: 'PA',
      complement: 'Desembarque no porto comunitário',
    };
    expect(buildDeliveryLines(rural)).toEqual([
      '🚚 Entrega',
      'Comunidade Exemplo',
      'Número: S/N',
      'Santarém/PA',
      'Referência: Desembarque no porto comunitário',
    ]);
  });

  it('pickup is a single quiet line', () => {
    expect(buildDeliveryLines(pickup)).toEqual([
      '📍 Retirada',
      'Retirada combinada com a loja.',
    ]);
  });
});

describe('WhatsApp message', () => {
  const cart = [item({}), item({ id: 2, name: 'Colar', price: 60, quantity: 2 })];

  it('paid order declares payment and ends with the receipt prompt', () => {
    const msg = buildCheckoutMessage({
      cart,
      total: 240,
      reference: 'LC-A7F42',
      data: delivery,
      storeName: 'Loja Comunitária',
      paid: true,
    });
    expect(msg).toContain('🛍️ Pedido LC-A7F42');
    expect(msg).toContain('• 1× Cesto Krahô — R$ 120,00');
    expect(msg).toContain('• 2× Colar — R$ 60,00 cada');
    expect(msg).toContain('Total: R$ 240,00');
    expect(msg).toContain('Já fiz o pagamento por Pix.');
    expect(msg.trim().endsWith('E aqui está o comprovante 👇')).toBe(true);
  });

  it('labels products-only amount when freight is separate', () => {
    const msg = buildCheckoutMessage({
      cart,
      total: 240,
      reference: 'LC-A7F42',
      data: delivery,
      paid: true,
      freightNote: true,
    });
    expect(msg).toContain('Produtos: R$ 240,00');
    expect(msg).toContain('Frete será combinado separadamente.');
    expect(msg).not.toContain('Total: R$ 240,00');
  });

  it('unpaid order (pix_automatico = FALSE) never claims payment', () => {
    const msg = buildCheckoutMessage({
      cart,
      total: 240,
      reference: 'LC-A7F42',
      data: pickup,
      storeName: 'Loja Comunitária',
      paid: false,
    });
    expect(msg).toContain('Total dos produtos: R$ 240,00');
    expect(msg).toContain('Gostaria de confirmar o pedido e receber as informações para pagamento.');
    expect(msg).not.toContain('Já fiz o pagamento');
    expect(msg).not.toContain('comprovante');
  });

  it('never leaks technical metadata or long URLs', () => {
    const msg = buildCheckoutMessage({
      cart,
      total: 240,
      reference: 'LC-A7F42',
      data: delivery,
      paid: true,
    });
    expect(msg).not.toMatch(/brasilapi|cache|provider|http/i);
  });
});

describe('inventory guard', () => {
  it('blocks payment when a cart item is sold out', () => {
    const cart = [item({ id: 1, name: 'Cesto' }), item({ id: 2, name: 'Colar' })];
    expect(cartBlockingIssue(cart, (id) => id === 2)).toBe('Colar');
    expect(cartBlockingIssue(cart, () => false)).toBeNull();
  });
});

describe('checkout persistence (bank-app round trip)', () => {
  beforeEach(() => localStorage.clear());

  it('restores the checkout state after a refresh', () => {
    saveCheckout(delivery);
    expect(loadCheckout()).toEqual(delivery);
  });

  it('returns null when nothing was saved', () => {
    expect(loadCheckout()).toBeNull();
  });

  it('reference codes are short and stable in format', () => {
    expect(generateReferenceCode()).toMatch(/^LC-\d{6}$/);
  });
});
