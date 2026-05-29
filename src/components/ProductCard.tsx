import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  quantity?: number;
  isUnique?: boolean;
}

const ProductCard = ({ id, name, price, image, description, quantity, isUnique }: ProductCardProps) => {
  const { addItem, cart } = useCart();

  // Check if this product is already in the cart
  const existingItem = cart.find(item => item.id === id);
  const inCart = !!existingItem;

  // Calculate remaining quantity
  const remainingQuantity = quantity !== undefined
    ? quantity - (existingItem?.quantity || 0)
    : isUnique && inCart ? 0 : 1;

  // Check if product is out of stock or if unique item is already in cart
  const isOutOfStock = remainingQuantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product details
    e.stopPropagation(); // Stop event propagation

    if (isOutOfStock) return;

    addItem({
      id,
      name,
      price,
      image,
      quantity: 1
    });
  };

  return (
    <div className={`group product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${isUnique ? 'border-2 border-amber-400' : ''}`}>
      <Link
        to={`/produto/${id}`}
        className="block"
      >
        <div className="aspect-square overflow-hidden relative">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isUnique && (
            <div className="absolute top-0 right-0 bg-amber-400 text-white px-2 py-1 text-xs font-bold">
              ÚNICO
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-forest-900 mb-1">{name}</h3>
          <p className="text-sm text-forest-600 mb-2 line-clamp-2">{description}</p>

          <div className="flex justify-between items-center">
            <p className="text-terra-600 font-semibold">
              R$ {price.toFixed(2)}
            </p>

            {!isUnique && quantity !== undefined && (
              <p className={`text-sm ${remainingQuantity <= 3 && remainingQuantity > 0 ? 'text-amber-600 font-medium' : 'text-forest-600'}`}>
                {remainingQuantity > 0
                  ? `${remainingQuantity} disponíveis`
                  : 'Esgotado'}
              </p>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          variant={isOutOfStock ? "outline" : "default"}
          className={`w-full ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''}`}
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock
            ? (isUnique && inCart ? 'Já no carrinho' : 'Esgotado')
            : 'Adicionar ao Carrinho'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;