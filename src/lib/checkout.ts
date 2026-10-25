import type { CartItem } from '@/context/CartContext';

/**
 * One-page progressive checkout logic.
 *
 * Everything here is pure and client-side: no backend, no accounts, no
 * payment verification. The checkout state is persisted in localStorage so
 * the bank-app round trip (copy Pix → pay → return → WhatsApp) never loses
 * anything.
 */

export type DeliveryMethod = 'entrega' | 'retirada';

export interface CheckoutData {
  delivery: DeliveryMethod;
  name: string;
  cep: string;
  street: string;
  number: string;
  noNumber: boolean;
  /** "Complemento ou referência" — one field, always optional. */
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const EMPTY_CHECKOUT: CheckoutData = {
  delivery: 'entrega',
  name: '',
  cep: '',
  street: '',
  number: '',
  noNumber: false,
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

/* ------------------------------------------------------------------ */
/* Persistence — survives refresh, PWA resume and bank-app switching  */
/* ------------------------------------------------------------------ */

const CHECKOUT_KEY = 'checkout:v1';

export function loadCheckout(): CheckoutData | null {
  try {
    const raw = globalThis.localStorage?.getItem(CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return { ...EMPTY_CHECKOUT, ...(parsed as Partial<CheckoutData>) };
  } catch {
    return null;
  }
}

export function saveCheckout(data: CheckoutData): void {
  try {
    globalThis.localStorage?.setItem(CHECKOUT_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — checkout still works in memory */
  }
}

export function clearCheckout(): void {
  try {
    globalThis.localStorage?.removeItem(CHECKOUT_KEY);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Reference code — NOT a confirmed order number, never proof of payment */
/* ------------------------------------------------------------------ */

export const generateReferenceCode = (): string => {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return `LC-${timestamp}${random}`;
};

/* ------------------------------------------------------------------ */
/* Validation — minimal, friendly, one thing at a time                 */
/* ------------------------------------------------------------------ */

const filled = (value: string) => value.trim().length > 0;

/** The number field accepts "S/N" as an explicit no-number value. */
export const hasNumber = (data: CheckoutData): boolean =>
  data.noNumber || /^s\/?n$/i.test(data.number.trim()) || filled(data.number);

export const resolvedNumber = (data: CheckoutData): string => {
  const raw = data.number.trim();
  if (data.noNumber || /^s\/?n$/i.test(raw)) return 'S/N';
  return raw;
};

export type CheckoutMissing = 'name' | 'number' | 'city';

/**
 * The single thing still needed, in the order the form asks for it.
 * null = checkout is ready. CEP itself is never required: many Indigenous,
 * riverside and rural addresses have no usable CEP — city/state + a number
 * or reference are enough.
 */
export function firstMissing(data: CheckoutData): CheckoutMissing | null {
  if (data.delivery === 'entrega') {
    if (!filled(data.city) || !filled(data.state)) return 'city';
    if (!hasNumber(data)) return 'number';
  }
  if (data.name.trim().length < 2) return 'name';
  return null;
}

export const isCheckoutReady = (data: CheckoutData): boolean => firstMissing(data) === null;

/* ------------------------------------------------------------------ */
/* Pix eligibility — never charge an unknown or misleading amount      */
/* ------------------------------------------------------------------ */

export interface PixDecision {
  /** Show the Pix block automatically. */
  show: boolean;
  /** true = Pix covers products only; freight is arranged separately. */
  freightNote: boolean;
}

/**
 * Automatic Pix appears only when every condition holds:
 * - pix_automatico is not "FALSE" (it defaults to ON)
 * - the Pix configuration is complete and valid
 * - the checkout information is complete
 * - the amount is known and positive
 * - the amount is FINAL: pickup orders, or delivery orders only when the
 *   store explicitly operates with freight arranged separately.
 */
export function pixDecision(opts: {
  pixAutomatic: boolean;
  pixAvailable: boolean;
  ready: boolean;
  amount: number;
  delivery: DeliveryMethod;
  freightSeparate: boolean;
}): PixDecision {
  if (!opts.pixAutomatic || !opts.pixAvailable || !opts.ready) {
    return { show: false, freightNote: false };
  }
  if (!Number.isFinite(opts.amount) || opts.amount <= 0) {
    return { show: false, freightNote: false };
  }
  if (opts.delivery === 'entrega' && !opts.freightSeparate) {
    // Freight is unknown client-side — never present the subtotal as final.
    return { show: false, freightNote: false };
  }
  return { show: true, freightNote: opts.delivery === 'entrega' };
}

/* ------------------------------------------------------------------ */
/* Inventory guard — never take payment for an obviously invalid cart  */
/* ------------------------------------------------------------------ */

/** Name of the first sold-out cart item, or null when the cart is payable. */
export function cartBlockingIssue(
  cart: CartItem[],
  isSoldOut: (id: number) => boolean,
): string | null {
  const item = cart.find((it) => isSoldOut(it.id));
  return item ? item.name : null;
}

/* ------------------------------------------------------------------ */
/* WhatsApp message — concise, human, no technical metadata            */
/* ------------------------------------------------------------------ */

const money = (value: number, locale = 'pt-BR', currency = 'BRL') => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
};

/** Concise delivery lines — only fields that actually have values. */
export function buildDeliveryLines(data: CheckoutData): string[] {
  if (data.delivery === 'retirada') {
    return ['📍 Retirada', 'Retirada combinada com a loja.'];
  }

  const lines: string[] = ['🚚 Entrega'];
  const num = resolvedNumber(data);
  if (filled(data.street)) {
    lines.push(num ? `${data.street.trim()}, ${num}` : data.street.trim());
  } else if (filled(data.neighborhood)) {
    lines.push(data.neighborhood.trim());
    if (num) lines.push(`Número: ${num}`);
  } else if (num) {
    lines.push(`Número: ${num}`);
  }
  if (filled(data.city) && filled(data.state)) {
    lines.push(`${data.city.trim()}/${data.state.trim().toUpperCase()}`);
  } else if (filled(data.city)) {
    lines.push(data.city.trim());
  }
  if (filled(data.complement)) lines.push(`Referência: ${data.complement.trim()}`);
  return lines;
}

export function buildCheckoutMessage(params: {
  cart: CartItem[];
  total: number;
  reference: string;
  data: CheckoutData;
  storeName?: string;
  /** true = customer declares they already paid via Pix. */
  paid: boolean;
  /** true = Pix covered products only; freight is arranged separately. */
  freightNote?: boolean;
  locale?: string;
  currency?: string;
}): string {
  const { cart, total, reference, data, storeName, paid, freightNote, locale, currency } =
    params;
  const brl = (value: number) => money(value, locale, currency);

  const lines: string[] = [];
  lines.push(
    storeName?.trim()
      ? `Olá! Fiz este pedido na ${storeName.trim()}:`
      : 'Olá! Fiz este pedido:',
  );
  lines.push('');
  lines.push(`🛍️ Pedido ${reference}`);
  lines.push('');
  cart.forEach((item) => {
    lines.push(
      item.quantity > 1
        ? `• ${item.quantity}× ${item.name} — ${brl(item.price)} cada`
        : `• 1× ${item.name} — ${brl(item.price)}`,
    );
  });
  lines.push('');
  if (paid && freightNote) {
    lines.push(`Produtos: ${brl(total)}`);
    lines.push('Frete será combinado separadamente.');
  } else if (paid) {
    lines.push(`Total: ${brl(total)}`);
  } else {
    lines.push(`Total dos produtos: ${brl(total)}`);
  }
  lines.push('');
  lines.push(...buildDeliveryLines(data));
  lines.push('');
  lines.push(`Nome: ${data.name.trim()}`);
  lines.push('');
  if (paid) {
    lines.push('Já fiz o pagamento por Pix.');
    lines.push('');
    lines.push('E aqui está o comprovante 👇');
  } else {
    lines.push('Gostaria de confirmar o pedido e receber as informações para pagamento.');
  }

  return lines.join('\n');
}
