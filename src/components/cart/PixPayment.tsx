import { useEffect, useState } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';
import type { CartItem } from '@/context/CartContext';

interface PixPaymentProps {
  pixQrCode: string | null;
  pixCopyCode: string | null;
  isCopied: boolean;
  total: number;
  cart: CartItem[];
  orderId: string;
  whatsappLink: string;
  onCopyToClipboard: () => void;
  onNewPurchase: () => void;
}

export const PixPayment = ({
  pixQrCode,
  pixCopyCode,
  isCopied,
  total,
  orderId,
  whatsappLink,
  onCopyToClipboard,
  onNewPurchase,
}: PixPaymentProps) => {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWhatsApp(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-marcellus text-forest-900 mb-4">Pagamento via Pix</h1>

          <div className="text-forest-800 mb-6">
            <p className="mb-2">
              Escaneie o QR Code abaixo ou copie o código Pix para finalizar o pagamento.
            </p>
            {orderId && (
              <p className="text-sm text-forest-600">
                Número do pedido: <strong>{orderId}</strong>
              </p>
            )}
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

            {showWhatsApp && whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full mb-4 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded transition"
                aria-label="Enviar detalhes para o WhatsApp"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                <span>Enviar comprovante via WhatsApp</span>
              </a>
            )}

            <button onClick={onNewPurchase} className="btn btn-primary w-full">
              Fazer Nova Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
