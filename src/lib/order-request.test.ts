import { describe, expect, it } from 'vitest';
import {
  buildAddressBlock,
  buildOrderRequestMessage,
  EMPTY_ORDER_REQUEST,
  isOrderRequestValid,
  resolvedNumber,
  type OrderRequestData,
} from '@/lib/order-request';

const base: OrderRequestData = {
  ...EMPTY_ORDER_REQUEST,
  name: 'Maria Silva',
  cep: '66000000',
  street: 'Rua Exemplo',
  number: '123',
  neighborhood: 'Centro',
  city: 'Belém',
  state: 'PA',
  landmark: 'Próximo ao porto',
  complement: 'Casa azul',
};

describe('order request address', () => {
  it('formats a conventional delivery address (19)', () => {
    expect(buildAddressBlock(base)).toEqual([
      '*ENTREGA*',
      'Nome: Maria Silva',
      'CEP: 66000-000',
      'Endereço: Rua Exemplo, 123',
      'Complemento: Casa azul',
      'Bairro: Centro',
      'Cidade/UF: Belém/PA',
      'Ponto de referência: Próximo ao porto',
    ]);
  });

  it('formats a rural/community address without street (18, 19)', () => {
    const rural: OrderRequestData = {
      ...EMPTY_ORDER_REQUEST,
      name: 'Maria Silva',
      cep: '68000000',
      neighborhood: 'Comunidade Exemplo',
      noNumber: true,
      city: 'Santarém',
      state: 'PA',
      landmark: 'Desembarque no porto comunitário',
    };
    expect(buildAddressBlock(rural)).toEqual([
      '*ENTREGA*',
      'Nome: Maria Silva',
      'CEP: 68000-000',
      'Localidade: Comunidade Exemplo',
      'Número: S/N',
      'Cidade/UF: Santarém/PA',
      'Ponto de referência: Desembarque no porto comunitário',
    ]);
  });

  it('accepts "S/N" typed in the number field (18)', () => {
    expect(resolvedNumber({ ...base, number: 's/n' })).toBe('S/N');
    expect(resolvedNumber({ ...base, number: '', noNumber: true })).toBe('S/N');
  });

  it('omits empty address fields entirely', () => {
    const block = buildAddressBlock({ ...base, complement: '', landmark: '' });
    expect(block.join('\n')).not.toMatch(/Complemento|Ponto de referência/);
  });

  it('local pickup does not require an address (17)', () => {
    const pickup: OrderRequestData = {
      ...EMPTY_ORDER_REQUEST,
      name: 'Maria Silva',
      delivery: 'retirada',
      acknowledged: true,
    };
    expect(isOrderRequestValid(pickup)).toBe(true);
    expect(buildAddressBlock(pickup)).toEqual([
      '*RETIRADA*',
      'Retirada combinada com a loja.',
    ]);
  });

  it('delivery requires city, state, number and acknowledgement', () => {
    expect(isOrderRequestValid({ ...base, acknowledged: true })).toBe(true);
    expect(isOrderRequestValid({ ...base, acknowledged: false })).toBe(false);
    expect(isOrderRequestValid({ ...base, acknowledged: true, city: '' })).toBe(false);
    expect(isOrderRequestValid({ ...base, acknowledged: true, number: '' })).toBe(false);
    expect(
      isOrderRequestValid({ ...base, acknowledged: true, number: '', noNumber: true }),
    ).toBe(true);
  });

  it('never leaks provider or technical details into the message', () => {
    const message = buildOrderRequestMessage({
      cart: [
        {
          id: 1,
          name: 'Cesto',
          price: 100,
          quantity: 1,
          image: '',
        } as never,
      ],
      subtotal: 100,
      reference: 'LC-123456',
      data: { ...base, acknowledged: true },
      storeName: 'Loja',
    });
    expect(message).toMatch('*ENTREGA*');
    expect(message).toMatch('Referência: LC-123456');
    expect(message).not.toMatch(/brasilapi|cache|provider|status \d/i);
  });
});
