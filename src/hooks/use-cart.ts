import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateOrderId } from '@/lib/whatsapp';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

// Get cart from localStorage if available
const getInitialCartItems = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
  }
  return [];
};

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>(getInitialCartItems());
  const [orderId, setOrderId] = useState<string>('');
  const { toast } = useToast();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
  }, [cart]);

  const updateQuantity = (id: number, newQuantity: number) => {
    // Don't allow quantities less than 1
    if (newQuantity < 1) return;

    // Apply the update
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
    // Clear localStorage cart
    localStorage.removeItem('cart');
    // Generate a new order ID when the cart is cleared
    setOrderId('');
  };

  const addItem = (item: CartItem) => {
    const existingItem = cart.find(i => i.id === item.id);

    if (existingItem) {
      // Add to existing quantity
      updateQuantity(item.id, existingItem.quantity + item.quantity);
    } else {
      // Add new item
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