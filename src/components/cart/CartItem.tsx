import { Trash2, MinusCircle, PlusCircle } from "lucide-react";
import { CartItem as CartItemType } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
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
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="text-forest-600 hover:text-forest-800 transition-colors"
          aria-label="Diminuir quantidade"
        >
          <MinusCircle className="w-5 h-5" />
        </button>
        <span className="text-forest-900 font-medium w-8 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="text-forest-600 hover:text-forest-800 transition-colors"
          aria-label="Aumentar quantidade"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-600 transition-colors ml-4"
          aria-label="Remover item"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};