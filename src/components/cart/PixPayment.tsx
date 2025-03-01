import { useEffect, useState } from "react";
import { Copy, Check, AlertTriangle, MessageSquare } from "lucide-react";

interface PixPaymentProps {
  pixQrCode: string | null;
  pixCopyCode: string | null;
  isCopied: boolean;
  isLocallyGenerated?: boolean;
  total: number;
  cart: any[];
  orderId: string;
  onCopyToClipboard: () => void;
  onNewPurchase: () => void;
  whatsappLink: string;
}

export const PixPayment = ({
  pixQrCode,
  pixCopyCode,
  isCopied,
  isLocallyGenerated = false,
  total,
  cart,
  orderId,
  onCopyToClipboard,
  onNewPurchase,
  whatsappLink
}: PixPaymentProps) => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  // Show WhatsApp button after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsApp(true);
      console.log("[PixPayment] Showing WhatsApp button after 5s");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-marcellus text-forest-900 mb-4">
            Pagamento via Pix
          </h1>

          {isLocallyGenerated ? (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-6 text-left flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="mb-1">
                  Este código Pix foi gerado localmente e é um exemplo para demonstração.
                </p>
                <p>
                  Para confirmar seu pedido, por favor use o botão WhatsApp abaixo após a transferência.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md mb-6 text-left flex items-start">
              <Check className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-emerald-800">
                <p>
                  Este código Pix foi gerado pela API oficial e está pronto para uso.
                </p>
              </div>
            </div>
          )}

          <div className="text-forest-800 mb-6">
            <p className="mb-2">
              Escaneie o QR Code abaixo ou copie o código Pix para finalizar o pagamento.
            </p>
            <p className="text-sm text-forest-600">
              Número do pedido: <strong>{orderId}</strong>
            </p>
          </div>

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
                  onClick={onCopyToClipboard}
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

            {/* WhatsApp Button - Shows after 15 seconds */}
            {showWhatsApp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full mb-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded transition"
                aria-label="Enviar detalhes para o WhatsApp"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                <span>Enviar detalhes para o WhatsApp</span>
              </a>
            )}

            <button
              onClick={onNewPurchase}
              className="btn btn-primary w-full"
            >
              Fazer Nova Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};