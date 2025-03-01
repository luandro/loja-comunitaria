
import { useState, useRef } from "react";
import { Trash2, MinusCircle, PlusCircle, Copy, Check } from "lucide-react";
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

// Recipient information - normally these would come from environment variables
const PIX_RECIPIENT_NAME = "Artes Indígenas";
const PIX_RECIPIENT_CITY = "São Paulo";
const PIX_RECIPIENT_KEY = "example@email.com";

const Cart = () => {
  const [cart, setCart] = useState(initialCart);
  const [isLoading, setIsLoading] = useState(false);
  const [pixQrCode, setPixQrCode] = useState<string | null>(null);
  const [pixCopyCode, setPixCopyCode] = useState<string | null>(null);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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

  const generatePixPaymentInfo = async () => {
    setIsLoading(true);
    try {
      // Mock data for testing purposes
      const mockQrCodeUrl = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126330014BR.GOV.BCB.PIX0111example.com52040000530398654040.005802BR5913Artes+Indigenas6008Sao+Paulo62070503***6304E2CA";
      const mockBrCode = "00020126330014BR.GOV.BCB.PIX0111example.com52040000530398654040.005802BR5913Artes+Indigenas6008Sao+Paulo62070503***6304E2CA";
      
      // Common parameters for both API calls
      const baseParams = {
        nome: PIX_RECIPIENT_NAME,
        cidade: PIX_RECIPIENT_CITY,
        chave: PIX_RECIPIENT_KEY,
        valor: total.toFixed(2),
        txid: `TX${Date.now()}` // Generate a simple unique transaction ID
      };
      
      try {
        // Make two parallel API calls - one for QR code and one for BR code
        const qrParams = new URLSearchParams({
          ...baseParams,
          saida: "qr"
        });
        
        const brParams = new URLSearchParams({
          ...baseParams,
          saida: "br"
        });
        
        console.log("Calling Pix API for QR code at:", `https://gerarqrcodepix.com.br/api/v1?${qrParams.toString()}`);
        console.log("Calling Pix API for BR code at:", `https://gerarqrcodepix.com.br/api/v1?${brParams.toString()}`);
        
        // Execute both requests in parallel
        const [qrResponse, brResponse] = await Promise.all([
          fetch(`https://gerarqrcodepix.com.br/api/v1?${qrParams.toString()}`),
          fetch(`https://gerarqrcodepix.com.br/api/v1?${brParams.toString()}`)
        ]);
        
        if (!qrResponse.ok || !brResponse.ok) {
          throw new Error(`API responded with error status`);
        }
        
        const qrData = await qrResponse.json();
        const brData = await brResponse.json();
        
        if (qrData && qrData.qr_code && brData && brData.br_code) {
          setPixQrCode(qrData.qr_code);
          setPixCopyCode(brData.br_code);
          setCheckoutComplete(true);
          toast({
            title: "Pedido realizado com sucesso!",
            description: "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento.",
          });
        } else {
          throw new Error("Dados de pagamento não encontrados na resposta");
        }
      } catch (apiError) {
        // If the real API fails, use the mock data for demonstration
        console.error("Error calling real Pix API:", apiError);
        console.log("Using mock payment data instead");
        
        setPixQrCode(mockQrCodeUrl);
        setPixCopyCode(mockBrCode);
        setCheckoutComplete(true);
        toast({
          title: "Pedido realizado com sucesso!",
          description: "Escaneie o QR Code ou copie o código Pix para finalizar o pagamento. (Modo demonstração)",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar dados de pagamento Pix:", error);
      toast({
        title: "Erro ao gerar dados de pagamento",
        description: "Não foi possível gerar os dados para pagamento Pix. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = () => {
    generatePixPaymentInfo();
  };

  const copyToClipboard = async () => {
    if (pixCopyCode) {
      try {
        await navigator.clipboard.writeText(pixCopyCode);
        setIsCopied(true);
        toast({
          description: "Código Pix copiado para a área de transferência!",
        });
        
        // Reset the copied state after 3 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 3000);
      } catch (err) {
        console.error("Erro ao copiar código:", err);
        toast({
          variant: "destructive",
          description: "Não foi possível copiar o código. Tente selecionar e copiar manualmente.",
        });
      }
    }
  };

  const handleNewPurchase = () => {
    setPixQrCode(null);
    setPixCopyCode(null);
    setCheckoutComplete(false);
    setIsCopied(false);
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
              Escaneie o QR Code abaixo ou copie o código Pix para finalizar o pagamento.
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
            
            {pixCopyCode && (
              <div className="mb-6">
                <div className="text-left font-semibold mb-2">Código Pix:</div>
                <div className="flex">
                  <div className="bg-sand-100 p-3 text-xs text-forest-800 rounded-l overflow-x-auto max-h-24 flex-grow">
                    <code className="whitespace-pre-wrap break-all">{pixCopyCode}</code>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="bg-forest-600 hover:bg-forest-700 text-white p-2 rounded-r transition flex items-center"
                    aria-label="Copiar código Pix"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-5 h-5 mr-1" />
                        <span className="text-sm">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-1" />
                        <span className="text-sm">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
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
