import { useEffect, useMemo } from "react";
import { Trash2, MinusCircle, PlusCircle, AlertCircle } from "lucide-react";
import { CartItem as CartItemType } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryBadge } from "@/components/InventoryBadge";
import { getInventoryStatus } from "@/lib/inventory";
import { useStore } from "@/hooks/use-store";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const { products } = useProducts();
  const store = useStore();

  const product = useMemo(
    () => products.find((p) => p.id === item.id),
    [products, item.id],
  );

  const status = product
    ? getInventoryStatus({
        inventoryType: product.inventoryType,
        stockQuantity: product.stockQuantity,
        productionTime: product.productionTime,
      })
    : undefined;

  const maxQuantity = status ? status.maxQuantity : item.maxQuantity;
  const overStock = maxQuantity !== undefined && item.quantity > maxQuantity;

  // Auto-clamp when the store reduced the reported stock below what's in the cart.
  useEffect(() => {
    if (overStock && maxQuantity !== undefined && maxQuantity >= 1) {
      onUpdateQuantity(item.id, maxQuantity);
    }
  }, [overStock, maxQuantity, item.id, onUpdateQuantity]);

  const canIncrease = maxQuantity === undefined || item.quantity < maxQuantity;
  const isSoldOut = status?.isSoldOut ?? false;

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-sm flex flex-col ${
        status?.type === "unique" && !isSoldOut ? "border-l-4 border-amber-400" : ""
      }`}
    >
      {isSoldOut && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este item foi marcado como esgotado pela loja. Remova-o ou confirme pelo WhatsApp.
          </AlertDescription>
        </Alert>
      )}

      {!isSoldOut && overStock && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quantidade ajustada para o máximo reportado</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
        <div className="flex-grow">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-forest-900">{item.name}</h3>
            {status && <InventoryBadge status={status} />}
          </div>
          <p className="text-terra-600">{store.formatPrice(item.price)}</p>

          {status && <p className="text-sm text-forest-600">{status.message}</p>}
          <p className="text-xs text-forest-600">
            {store.text("inventory_notice", "availability_disclaimer")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="text-forest-600 hover:text-forest-800 transition-colors disabled:opacity-50"
            aria-label="Diminuir quantidade"
            disabled={item.quantity <= 1}
          >
            <MinusCircle className="w-5 h-5" />
          </button>
          <span className="text-forest-900 font-medium w-8 text-center">{item.quantity}</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => canIncrease && onUpdateQuantity(item.id, item.quantity + 1)}
                  className={`text-forest-600 hover:text-forest-800 transition-colors ${!canIncrease ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label="Aumentar quantidade"
                  disabled={!canIncrease}
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              {!canIncrease && maxQuantity !== undefined && (
                <TooltipContent>
                  <p>
                    {status?.type === "unique"
                      ? "Peça única — apenas uma unidade"
                      : "Quantidade máxima reportada"}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-600 transition-colors ml-4"
            aria-label="Remover item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
