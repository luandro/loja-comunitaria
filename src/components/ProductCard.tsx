import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { InventoryBadge } from "@/components/InventoryBadge";
import { getInventoryStatus, type InventoryType } from "@/lib/inventory";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  inventoryType: InventoryType;
  stockQuantity?: number;
  productionTime?: string;
  peopleOrCommunity?: string;
  originLocation?: string;
  communitySlug?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  image,
  description,
  inventoryType,
  stockQuantity,
  productionTime,
  peopleOrCommunity,
  originLocation,
}: ProductCardProps) => {
  const { addItem, cart } = useCart();
  const store = useStore();
  const status = getInventoryStatus({ inventoryType, stockQuantity, productionTime });

  const existingItem = cart.find((item) => item.id === id);
  const inCart = !!existingItem;
  const inCartQty = existingItem?.quantity ?? 0;

  const reachedLimit =
    status.maxQuantity !== undefined && inCartQty >= status.maxQuantity;
  const disabled = status.isSoldOut || reachedLimit;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    addItem({
      id,
      name,
      price,
      image,
      quantity: 1,
      maxQuantity: status.maxQuantity,
    });
  };

  return (
    <div
      className={`group product-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
        status.type === "unique" && !status.isSoldOut ? "border-2 border-amber-400" : ""
      }`}
    >
      <Link to={`/produto/${id}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <InventoryBadge status={status} className="absolute top-2 right-2" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-forest-900 mb-1">{name}</h3>
          {(peopleOrCommunity || originLocation) && (
            <p className="text-xs text-forest-600 mb-2">
              {peopleOrCommunity}
              {peopleOrCommunity && originLocation ? " · " : ""}
              {originLocation}
            </p>
          )}
          <p className="text-sm text-forest-600 mb-2 line-clamp-2">{description}</p>

          <div className="flex justify-between items-center gap-2">
            <p className="text-terra-600 font-semibold">{store.formatPrice(price)}</p>
            <p className="text-xs text-forest-600 text-right">{status.message}</p>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          variant={disabled ? "outline" : "default"}
          className={`w-full ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          disabled={disabled}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {status.isSoldOut
            ? store.t("sold_out_label")
            : reachedLimit
              ? inCart
                ? store.t("already_in_cart_label")
                : store.t("unavailable_label")
              : store.text("add_to_cart_label", "add_to_cart_label")}
        </Button>
        <p className="mt-2 text-[11px] text-forest-600">
          {store.text("inventory_notice", "availability_disclaimer")}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
