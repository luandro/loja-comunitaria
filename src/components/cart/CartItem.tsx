import { useEffect, useMemo } from "react";
import { Trash2, MinusCircle, PlusCircle, AlertCircle } from "lucide-react";
import { CartItem as CartItemType } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const { products } = useProducts();

  const product = useMemo(
    () => products.find((p) => p.id === item.id),
    [products, item.id],
  );

  const maxQuantity = product?.quantity;
  const isUnique = product?.isUnique ?? false;
  const overStock = maxQuantity !== undefined && item.quantity > maxQuantity;

  // Auto-clamp to available stock if a product's quantity shrank below what's in the cart.
  useEffect(() => {
    if (overStock && maxQuantity !== undefined) {
      onUpdateQuantity(item.id, maxQuantity);
    }
  }, [overStock, maxQuantity, item.id, onUpdateQuantity]);

  const canIncrease = maxQuantity === undefined || item.quantity < maxQuantity;

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm flex flex-col ${isUnique ? 'border-l-4 border-amber-400' : ''}`}>
      {overStock && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Quantidade ajustada para o máximo disponível</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-4">
        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
        <div className="flex-grow">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-forest-900">{item.name}</h3>
            {isUnique && (
              <span className="ml-2 bg-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                ÚNICO
              </span>
            )}
          </div>
          <p className="text-terra-600">R$ {item.price.toFixed(2)}</p>

          {maxQuantity !== undefined && !isUnique && (
            <p className="text-sm text-forest-600">Disponível: {maxQuantity}</p>
          )}
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
                  className={`text-forest-600 hover:text-forest-800 transition-colors ${!canIncrease ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Aumentar quantidade"
                  disabled={!canIncrease}
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              {!canIncrease && maxQuantity !== undefined && (
                <TooltipContent>
                  <p>Quantidade máxima disponível</p>
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
