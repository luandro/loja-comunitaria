import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateOrderId } from '@/lib/whatsapp';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Mock data - in a real app, this would come from context or API
const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Colar Guarani",
    price: 89.90,
    image: "/placeholder.svg",
    quantity: 1
  }
];

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(initialCartItems);
  const [orderId, setOrderId] = useState<string>('');
  const { toast } = useToast();

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    toast({
      description: "Item removido do carrinho",
    });
  };

  const clearCart = () => {
    setCart([]);
    // Generate a new order ID when the cart is cleared
    setOrderId('');
  };

  const addItem = (item: CartItem) => {
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      updateQuantity(item.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, item]);
    }
    toast({
      description: "Item adicionado ao carrinho",
    });
  };

  const createOrder = () => {
    // Generate a new order ID if one doesn't exist
    if (!orderId) {
      const newOrderId = generateOrderId();
      setOrderId(newOrderId);
      console.log("[Cart] Created new order with ID:", newOrderId);
      return newOrderId;
    }
    return orderId;
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    cart,
    total,
    orderId,
    updateQuantity,
    removeItem,
    clearCart,
    addItem,
    createOrder,
    isEmpty: cart.length === 0
  };
};