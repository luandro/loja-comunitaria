import { Copy, Check } from "lucide-react";

interface PixPaymentProps {
  pixQrCode: string | null;
  pixCopyCode: string | null;
  isCopied: boolean;
  total: number;
  onCopyToClipboard: () => void;
  onNewPurchase: () => void;
}

export const PixPayment = ({
  pixQrCode,
  pixCopyCode,
  isCopied,
  total,
  onCopyToClipboard,
  onNewPurchase
}: PixPaymentProps) => {
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