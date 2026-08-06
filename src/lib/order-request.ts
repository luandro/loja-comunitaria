import type { CartItem } from '@/context/CartContext';

export type DeliveryMethod = 'entrega' | 'retirada';

/** Which address fields were filled by the CEP lookup and not touched since. */
export type AutoFilledAddressField = 'street' | 'neighborhood' | 'city' | 'state';

export interface OrderRequestData {
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  noNumber: boolean;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  landmark: string;
  delivery: DeliveryMethod;
  notes: string;
  acknowledged: boolean;
}

export const EMPTY_ORDER_REQUEST: OrderRequestData = {
  name: '',
  phone: '',
  cep: '',
  street: '',
  number: '',
  noNumber: false,
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  landmark: '',
  delivery: 'entrega',
  notes: '',
  acknowledged: false,
};

const filled = (value: string) => value.trim().length > 0;

/** The number field accepts "S/N" as an explicit no-number value. */
export const hasNumber = (data: OrderRequestData): boolean =>
  data.noNumber || /^s\/?n$/i.test(data.number.trim()) || filled(data.number);

export const resolvedNumber = (data: OrderRequestData): string => {
  const raw = data.number.trim();
  if (data.noNumber || /^s\/?n$/i.test(raw)) return 'S/N';
  return raw;
};

export function isOrderRequestValid(data: OrderRequestData): boolean {
  if (data.name.trim().length < 2) return false;
  if (!data.acknowledged) return false;

  // Local pickup never requires a delivery address.
  if (data.delivery === 'retirada') return true;

  if (!filled(data.city) || !filled(data.state)) return false;
  if (!hasNumber(data)) return false;
  return true;
}

/** Reference code for the request — NOT a confirmed order number. */
export const generateReferenceCode = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return `LC-${timestamp}${random}`;
};

const money = (value: number, locale = 'pt-BR', currency = 'BRL') => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
};

const productUrl = (id: number) => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/produto/${id}`;
};

const maskedCep = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value.trim();
};

/** Delivery block — only fields that actually have values are included. */
export function buildAddressBlock(data: OrderRequestData): string[] {
  if (data.delivery === 'retirada') {
    return ['*RETIRADA*', 'Retirada combinada com a loja.'];
  }

  const lines: string[] = ['*ENTREGA*'];
  const push = (label: string, value: string) => {
    if (filled(value)) lines.push(`${label}: ${value.trim()}`);
  };

  push('Nome', data.name);
  if (filled(data.cep)) push('CEP', maskedCep(data.cep));

  const num = resolvedNumber(data);
  if (filled(data.street)) {
    push('Endereço', num ? `${data.street.trim()}, ${num}` : data.street.trim());
  } else {
    if (filled(data.neighborhood) || filled(data.city)) {
      push('Localidade', data.neighborhood.trim() || data.city.trim());
    }
    if (num) push('Número', num);
  }

  push('Complemento', data.complement);
  if (filled(data.street)) push('Bairro', data.neighborhood);
  if (filled(data.city) && filled(data.state)) {
    lines.push(`Cidade/UF: ${data.city.trim()}/${data.state.trim().toUpperCase()}`);
  } else {
    push('Cidade', data.city);
    push('Estado', data.state);
  }
  push('Ponto de referência', data.landmark);

  return lines;
}

export function buildOrderRequestMessage(params: {
  cart: CartItem[];
  subtotal: number;
  reference: string;
  data: OrderRequestData;
  storeName?: string;
  locale?: string;
  currency?: string;
}): string {
  const { cart, subtotal, reference, data, storeName, locale, currency } = params;
  const brl = (value: number) => money(value, locale, currency);

  const lines: string[] = [];
  lines.push(
    storeName?.trim()
      ? `Olá, ${storeName.trim()}! Gostaria de solicitar este pedido:`
      : 'Olá! Gostaria de solicitar este pedido:',
  );
  lines.push('');
  lines.push(`Referência: ${reference}`);
  lines.push('');
  lines.push('*ITENS*');
  cart.forEach((item) => {
    const url = productUrl(item.id);
    lines.push(
      `${item.quantity} × ${item.name} — ${brl(item.price * item.quantity)}${url ? `\n${url}` : ''}`,
    );
  });
  lines.push('');
  lines.push(`Subtotal: ${brl(subtotal)}`);
  lines.push('');
  lines.push('*DADOS*');
  lines.push(`Nome: ${data.name.trim()}`);
  if (filled(data.phone)) lines.push(`Telefone: ${data.phone.trim()}`);
  lines.push(`Entrega ou retirada: ${data.delivery === 'entrega' ? 'Entrega' : 'Retirada'}`);
  lines.push('');
  lines.push(...buildAddressBlock(data));
  if (filled(data.notes)) {
    lines.push('');
    lines.push(`Observações: ${data.notes.trim()}`);
  }
  lines.push('');
  lines.push(
    'Entendo que a disponibilidade dos produtos, o prazo e o valor do frete ainda precisam ser confirmados.',
  );

  return lines.join('\n');
}
