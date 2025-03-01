interface OrderSummaryProps {
  total: number;
  onCheckout: () => void;
  isLoading: boolean;
}

export const OrderSummary = ({ total, onCheckout, isLoading }: OrderSummaryProps) => {
  return (
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
          onClick={onCheckout}
          className="btn btn-primary w-full mt-6"
          disabled={isLoading}
        >
          {isLoading ? "Gerando QR Code..." : "Finalizar Compra"}
        </button>
      </div>
    </div>
  );
};