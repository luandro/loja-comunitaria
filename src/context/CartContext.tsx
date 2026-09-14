import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateOrderId } from '@/lib/whatsapp';
import { useSiteContent } from '@/context/SiteContentContext';
import { translate, type TranslationKey } from '@/lib/i18n';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Max units the store reported as available. undefined = no precise limit. */
  maxQuantity?: number;
}


interface CartContextValue {
  cart: CartItem[];
  total: number;
  itemCount: number;
  orderId: string;
  isEmpty: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  createOrder: () => string;
  /** Last cart change, announced to screen readers through a live region. */
  announcement: string;
}

const CART_KEY = 'cart';
const ORDER_KEY = 'cart:orderId';

const readCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const readOrderId = (): string => {
  try {
    return localStorage.getItem(ORDER_KEY) ?? '';
  } catch {
    return '';
  }
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const { content } = useSiteContent();
  const language = content.default_language || 'pt-BR';
  const [cart, setCart] = useState<CartItem[]>(() => readCart());
  const [announcement, setAnnouncement] = useState('');
  const pending = useRef<{ key: TranslationKey; name?: string; quantity?: number } | null>(null);
  const [orderId, setOrderId] = useState<string>(() => readOrderId());

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('[Cart] persist failed', err);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (orderId) localStorage.setItem(ORDER_KEY, orderId);
      else localStorage.removeItem(ORDER_KEY);
    } catch {
      /* ignore */
    }
  }, [orderId]);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => {
      const item = prev.find((it) => it.id === id);
      if (item) pending.current = { key: 'cart_quantity_updated', name: item.name, quantity };
      return
      prev.map((it) => {
        if (it.id !== id) return it;
        const capped =
          it.maxQuantity !== undefined ? Math.min(quantity, it.maxQuantity) : quantity;
        return { ...it, quantity: Math.max(1, capped) };
      });
    });
  }, []);

  const removeItem = useCallback(
    (id: number) => {
      setCart((prev) => {
        const item = prev.find((it) => it.id === id);
        pending.current = { key: 'cart_item_removed', name: item?.name };
        return prev.filter((it) => it.id !== id);
      });
      toast({ description: 'Item removido do carrinho' });
    },
    [toast],
  );

  const clearCart = useCallback(() => {
    pending.current = { key: 'cart_cleared' };
    setCart([]);
    setOrderId('');
  }, []);

  const addItem = useCallback(
    (item: CartItem) => {
      setCart((prev) => {
        pending.current = { key: 'cart_item_added', name: item.name };
        const existing = prev.find((i) => i.id === item.id);
        const max = item.maxQuantity;
        if (existing) {
          const desired = existing.quantity + item.quantity;
          const next = max !== undefined ? Math.min(desired, max) : desired;
          return prev.map((i) =>
            i.id === item.id ? { ...i, maxQuantity: max, quantity: Math.max(1, next) } : i,
          );
        }
        const qty = max !== undefined ? Math.min(item.quantity, max) : item.quantity;
        if (qty < 1) return prev;
        return [...prev, { ...item, quantity: qty }];
      });
      toast({ description: 'Item adicionado ao carrinho' });
    },
    [toast],
  );

  const createOrder = useCallback(() => {
    if (orderId) return orderId;
    const newId = generateOrderId();
    setOrderId(newId);
    return newId;
  }, [orderId]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  useEffect(() => {
    const action = pending.current;
    if (!action) return;
    pending.current = null;
    const message = translate(action.key, language)
      .replace('{name}', action.name ?? '')
      .replace('{count}', String(itemCount))
      .replace('{quantity}', String(action.quantity ?? ''));
    setAnnouncement(message);
  }, [cart, itemCount, language]);

  const value: CartContextValue = {
    cart,
    total,
    itemCount,
    orderId,
    isEmpty: cart.length === 0,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    createOrder,
    announcement,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
