import { useEffect, useMemo } from "react";
import { Trash2, Minus, Plus, AlertCircle } from "lucide-react";
import { CartItem as CartItemType } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryBadge } from "@/components/InventoryBadge";
import { getInventoryStatus } from "@/lib/inventory";
import { useStore } from "@/hooks/use-store";
import { StoreImage } from "@/components/StoreImage";

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
      className="flex flex-col rounded-lg border border-sand-200 bg-white p-3 sm:p-4"
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

      <div className="flex gap-3">
        <StoreImage src={item.image} alt="" sizes="80px" className="h-20 w-20 shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-sans text-base font-semibold leading-snug text-forest-900">{item.name}</h3>
          <p className="font-bold text-terra-700">{store.formatPrice(item.price)}</p>
          {status && <InventoryBadge status={status} />}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center rounded-md border border-sand-300" role="group" aria-label={store.t("quantity_label")}>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="inline-flex h-11 w-11 items-center justify-center text-forest-800 disabled:opacity-40"
            aria-label={`${store.t("quantity_decrease")}: ${item.name}`}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-semibold text-forest-900">{item.quantity}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => canIncrease && onUpdateQuantity(item.id, item.quantity + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center text-forest-800 disabled:opacity-40"
                  aria-label={`${store.t("quantity_increase")}: ${item.name}`}
                  disabled={!canIncrease}
                >
                  <Plus className="h-4 w-4" />
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
        </div>
        {status && !canIncrease && (
          <p className="flex-1 text-right text-xs text-forest-600">{status.message}</p>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-red-700 hover:bg-red-50"
          aria-label={`Remover item: ${item.name}`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
