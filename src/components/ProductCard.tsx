import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useStore } from "@/hooks/use-store";
import { InventoryBadge } from "@/components/InventoryBadge";
import { StoreImage } from "@/components/StoreImage";
import { getInventoryStatus, type InventoryType } from "@/lib/inventory";
import { productPath } from "@/lib/product-url";

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
  slug?: string;
}

/**
 * Compact card: image, name, origin, price and availability. The general
 * "availability is confirmed by the store" notice is shown once above the
 * catalog, not repeated on every card.
 */
const ProductCard = ({
  id,
  name,
  price,
  image,
  inventoryType,
  stockQuantity,
  productionTime,
  peopleOrCommunity,
  originLocation,
  slug,
}: ProductCardProps) => {
  const { addItem, cart } = useCart();
  const store = useStore();
  const status = getInventoryStatus({ inventoryType, stockQuantity, productionTime });

  const inCartQty = cart.find((item) => item.id === id)?.quantity ?? 0;
  const inCart = inCartQty > 0;
  const reachedLimit = status.maxQuantity !== undefined && inCartQty >= status.maxQuantity;
  const disabled = status.isSoldOut || reachedLimit;

  const handleAddToCart = () => {
    if (disabled) return;
    addItem({ id, name, price, image, quantity: 1, maxQuantity: status.maxQuantity });
  };

  const label = status.isSoldOut
    ? store.t("sold_out_label")
    : reachedLimit
      ? inCart
        ? store.t("already_in_cart_label")
        : store.t("unavailable_label")
      : store.text("add_to_cart_label", "add_to_cart_label");

  const origin = [peopleOrCommunity, originLocation].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-sand-200 bg-white">
      <Link to={productPath({ id, slug, name })} className="group block rounded-none">
        <div className="relative aspect-square overflow-hidden bg-sand-100">
          <StoreImage
            src={image}
            alt={name}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className={`h-full w-full object-cover ${status.isSoldOut ? "opacity-60" : ""}`}
          />
          <InventoryBadge status={status} className="absolute left-2 top-2" />
        </div>
        <div className="space-y-1 p-3">
          <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug text-forest-900 group-hover:underline sm:text-base">
            {name}
          </h3>
          {origin && <p className="line-clamp-1 text-xs text-forest-600">{origin}</p>}
          <p className="pt-1 text-base font-bold text-terra-700">{store.formatPrice(price)}</p>
        </div>
      </Link>

      <div className="mt-auto px-3 pb-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled}
          className={`inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-md px-2 text-sm font-semibold transition-colors ${
            disabled
              ? "cursor-not-allowed border border-sand-200 bg-sand-50 text-forest-600"
              : "bg-forest-800 text-white hover:bg-forest-900"
          }`}
        >
          {inCart && !status.isSoldOut ? (
            <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            !disabled && <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="sr-only">{name}: </span>
          <span className="leading-tight">{label}</span>
          {inCart && !reachedLimit && (
            <span className="text-xs font-normal opacity-90">({inCartQty})</span>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
