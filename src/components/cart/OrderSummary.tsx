import { MessageSquare } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  reference: string;
  canSubmit: boolean;
  whatsappLink: string;
  onRequest: () => void;
  onClearCart: () => void;
}

export const OrderSummary = ({
  subtotal,
  reference,
  canSubmit,
  whatsappLink,
  onRequest,
  onClearCart,
}: OrderSummaryProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
      <h2 className="text-xl font-semibold text-forest-900 mb-4">Resumo da solicitação</h2>

      <div className="border-t border-sand-200 pt-4">
        <div className="flex justify-between text-lg font-semibold text-forest-900">
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-forest-600 mt-1">
          Frete e valor final serão informados pela loja no WhatsApp.
        </p>

        {reference && (
          <p className="text-sm text-forest-700 mt-3">
            Código de referência: <strong>{reference}</strong>
          </p>
        )}

        <p className="mt-4 rounded bg-sand-100 p-3 text-sm text-forest-800">
          Seu carrinho não reserva os produtos. A loja confirmará disponibilidade, prazo e frete
          pelo WhatsApp.
        </p>

        <a
          href={canSubmit ? whatsappLink : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!canSubmit}
          onClick={(e) => {
            if (!canSubmit) {
              e.preventDefault();
              return;
            }
            onRequest();
          }}
          className={`btn mt-4 flex w-full items-center justify-center ${
            canSubmit ? 'btn-primary' : 'pointer-events-none bg-sand-200 text-forest-600'
          }`}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Solicitar pedido pelo WhatsApp
        </a>

        {!canSubmit && (
          <p className="mt-2 text-xs text-forest-600">
            Preencha nome, cidade, estado e marque a confirmação para liberar o envio.
          </p>
        )}

        <button
          onClick={onClearCart}
          className="mt-3 w-full rounded border border-sand-200 px-6 py-2 text-forest-800 transition hover:bg-sand-100"
        >
          Limpar carrinho
        </button>
      </div>
    </div>
  );
};
