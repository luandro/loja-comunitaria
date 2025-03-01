
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
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
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

  const generatePixQrCode = async () => {
    setIsLoading(true);
    try {
      // Build API URL with parameters
      const params = new URLSearchParams({
        nome: "Artes Indígenas",
        cidade: "São Paulo",
        chave: "example@email.com", // Replace with actual Pix key
        valor: total.toFixed(2),
        saida: "qr"
      });

      const response = await fetch(`https://gerarqrcodepix.com.br/api/v1?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Falha ao gerar o QR Code Pix");
      }

      const data = await response.json();
      
      if (data && data.qr_code) {
        setPixQrCode(data.qr_code);
        setCheckoutComplete(true);
        toast({
          title: "Pedido realizado com sucesso!",
          description: "Escaneie o QR Code para finalizar o pagamento.",
        });
      } else {
        throw new Error("QR Code não encontrado na resposta");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code Pix:", error);
      toast({
        title: "Erro ao gerar QR Code",
        description: "Não foi possível gerar o QR Code para pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    generatePixQrCode();
  };

  const handleNewPurchase = () => {
    setPixQrCode(null);
    setCheckoutComplete(false);
    setCart([]);
    navigate("/produtos");
  };

  if (cart.length === 0 && !checkoutComplete) {
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

  if (checkoutComplete) {
    return (
      <div className="bg-sand-50 py-16 animate-fadeIn">
        <div className="container mx-auto max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h1 className="text-2xl font-marcellus text-forest-900 mb-4">
              Pagamento via Pix
            </h1>
            <p className="text-forest-800 mb-6">
              Escaneie o QR Code abaixo com o aplicativo do seu banco para finalizar o pagamento.
            </p>
            
            {pixQrCode && (
              <div className="mb-6 flex justify-center">
                <img 
                  id="qrcode-img" 
                  src={pixQrCode} 
                  alt="QR Code Pix" 
                  className="w-64 h-64 border border-sand-200 rounded"
                />
              </div>
            )}
            
            <div className="border-t border-sand-200 pt-6 mt-6">
              <p className="text-lg font-semibold text-forest-900 mb-4">
                Total: R$ {total.toFixed(2)}
              </p>
              <button
                onClick={handleNewPurchase}
                className="btn btn-primary w-full"
              >
                Fazer Nova Compra
              </button>
            </div>
          </div>
        </div>
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
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-forest-900">
                    {item.name}
                  </h3>
                  <p className="text-terra-600">
                    R$ {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="text-forest-600 hover:text-forest-800 transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </button>
                  <span className="text-forest-900 font-medium w-8 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="text-forest-600 hover:text-forest-800 transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-600 transition-colors ml-4"
                    aria-label="Remover item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold text-forest-900 mb-4">
              Resumo do Pedido
            </h2>
            <div className="border-t border-sand-200 pt-4">
              <div className="flex justify-between text-lg font-semibold text-forest-900">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="btn btn-primary w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Gerando QR Code..." : "Finalizar Compra"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
