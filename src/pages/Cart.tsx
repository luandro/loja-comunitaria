
import { useState } from "react";
import { Trash2, MinusCircle, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock do carrinho para demonstração
const initialCart = [
  {
    id: 1,
    name: "Colar Guarani",
    price: 89.90,
    image: "/placeholder.svg",
    quantity: 1
  }
];

const Cart = () => {
  const [cart, setCart] = useState(initialCart);
  const navigate = useNavigate();
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    toast({
      title: "Pedido realizado com sucesso!",
      description: "Você receberá um e-mail com os detalhes do pedido.",
    });
    setCart([]);
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center animate-fadeIn">
        <h1 className="text-2xl text-forest-900 mb-4">Seu carrinho está vazio</h1>
        <button
          onClick={() => navigate("/produtos")}
          className="btn btn-primary"
        >
          Continuar Comprando
        </button>
      </div>
    );
  }

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-3xl font-marcellus text-forest-900 mb-8">
          Seu Carrinho
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name

Se há conhecimento, contexto ou instruções personalizadas que você deseja incluir em cada edição deste projeto, configure-o abaixo.

<lov-actions>
<lov-knowledge>
</lov-actions>

Se seu projeto requer funcionalidade de backend para gerenciar produtos e carrinho de compras, você pode usar o menu do Supabase na parte superior direita para conectar seu projeto ao Supabase.
<lov-actions>
<lov-message-prompt message="Conte-me mais sobre o Supabase">Saiba mais sobre o Supabase</lov-message-prompt>
</lov-actions>