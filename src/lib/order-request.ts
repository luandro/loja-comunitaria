import type { CartItem } from '@/context/CartContext';

export interface OrderRequestData {
  name: string;
  phone: string;
  zip: string;
  city: string;
  state: string;
  delivery: 'entrega' | 'retirada';
  notes: string;
  acknowledged: boolean;
}

export const EMPTY_ORDER_REQUEST: OrderRequestData = {
  name: '',
  phone: '',
  zip: '',
  city: '',
  state: '',
  delivery: 'entrega',
  notes: '',
  acknowledged: false,
};

export const isOrderRequestValid = (data: OrderRequestData): boolean =>
  data.name.trim().length > 1 &&
  data.city.trim().length > 1 &&
  data.state.trim().length > 0 &&
  data.acknowledged;

/** Reference code for the request — NOT a confirmed order number. */
export const generateReferenceCode = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return `LC-${timestamp}${random}`;
};

const brl = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const productUrl = (id: number) => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/produto/${id}`;
};

export function buildOrderRequestMessage(params: {
  cart: CartItem[];
  subtotal: number;
  reference: string;
  data: OrderRequestData;
  storeName?: string;
}): string {
  const { cart, subtotal, reference, data, storeName } = params;

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
  lines.push(`Telefone: ${data.phone.trim() || '—'}`);
  lines.push(`CEP: ${data.zip.trim() || '—'}`);
  lines.push(`Cidade/UF: ${data.city.trim()}/${data.state.trim().toUpperCase()}`);
  lines.push(`Entrega ou retirada: ${data.delivery === 'entrega' ? 'Entrega' : 'Retirada'}`);
  lines.push(`Observações: ${data.notes.trim() || '—'}`);
  lines.push('');
  lines.push(
    'Entendo que a disponibilidade dos produtos, o prazo e o valor do frete ainda precisam ser confirmados.',
  );

  return lines.join('\n');
}
