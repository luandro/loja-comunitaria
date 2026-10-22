import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Minus, Plus, AlertCircle, ChevronDown, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InventoryBadge } from "@/components/InventoryBadge";
import { StoreImage } from "@/components/StoreImage";
import { getInventoryStatus } from "@/lib/inventory";
import { useStore } from "@/hooks/use-store";
import { MetaRow } from "@/components/ProductMeta";
import type { ReactNode } from "react";
import { useCommunities } from "@/hooks/use-communities";
import { slugify } from "@/lib/communities";
import { findProductByParam, productSlug } from "@/lib/product-url";
import { Seo } from "@/components/Seo";
import { absoluteUrl, clampDescription, pageTitle } from "@/lib/seo";

/** Native <details> section; hidden entirely when it has no filled rows. */
const DetailsSection = ({ title, open, children }: { title: string; open?: boolean; children: ReactNode[] }) => {
  const hasContent = children.some(
    (c) => c && typeof c === "object" && "props" in c && (c.props as { value?: string }).value?.trim(),
  );
  if (!hasContent) return null;
  return (
    <details className="group px-4" open={open}>
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="pb-3">{children}</dl>
    </details>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, cart } = useCart();
  const store = useStore();
  const { products, isLoading: productsLoading } = useProducts();

  const { communities } = useCommunities();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if product is in cart
  const existingCartItem = cart.find((item) => item.id === product?.id);

  const status = product
    ? getInventoryStatus({
        inventoryType: product.inventoryType,
        stockQuantity: product.stockQuantity,
        productionTime: product.productionTime,
      })
    : undefined;

  const isUnique = status?.type === "unique";
  const inCartQty = existingCartItem?.quantity || 0;

  // Units the customer can still add (undefined limit = no precise tracking)
  const availableQuantity =
    status?.maxQuantity !== undefined ? status.maxQuantity - inCartQty : Number.POSITIVE_INFINITY;

  const isSoldOut = status?.isSoldOut ?? false;
  const isOutOfStock = isSoldOut || availableQuantity <= 0;
  const showQuantityPicker = !isUnique && !isSoldOut;

  useEffect(() => {
    // URLs accept a slug (preferred) or the legacy numeric id.
    const found = findProductByParam(products, id);
    if (found) {
      setProduct(found);
      setError(null);
      setLoading(false);
      return;
    }
    if (!productsLoading) {
      setProduct(null);
      setError(store.t("product_not_found"));
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [id, products, productsLoading, store]);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setActiveImage(0);
  }, [id]);

  const gallery = useMemo(() => {
    if (!product) return [] as string[];
    return Array.from(new Set([product.image, ...(product.galleryImages ?? [])].filter(Boolean)));
  }, [product]);

  const seoTitle = product
    ? pageTitle([product.seoTitle || product.name, store.storeName])
    : store.t("product_not_found");
  const seoDescription = product
    ? clampDescription(
        product.seoDescription || product.longDescription || product.description || "",
      )
    : "";
  const seoPath = product ? `/produto/${productSlug(product)}` : undefined;

  const productJsonLd = useMemo(() => {
    if (!product || !status) return undefined;
    const availability = status.isSoldOut
      ? "https://schema.org/OutOfStock"
      : status.type === "made_to_order"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(seoDescription ? { description: seoDescription } : {}),
      ...(product.image ? { image: [product.image, ...(product.galleryImages ?? [])] } : {}),
      ...(product.category ? { category: product.category } : {}),
      ...(product.materials ? { material: product.materials } : {}),
      ...(product.makerName || product.peopleOrCommunity
        ? { brand: { "@type": "Organization", name: product.makerName || product.peopleOrCommunity } }
        : {}),
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: store.currency,
        availability,
        url: absoluteUrl(`/produto/${productSlug(product)}`),
      },
    };
  }, [product, status, seoDescription, store.currency]);

  const communitySlug = product?.communitySlug
    ? slugify(product.communitySlug)
    : product?.peopleOrCommunity
      ? slugify(product.peopleOrCommunity)
      : undefined;
  const hasCommunityPage =
    !!communitySlug && communities.some((c) => c.slug === communitySlug);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    // Unique pieces can only appear once in the cart
    const quantityToAdd = isUnique ? 1 : quantity;

    if (status?.maxQuantity !== undefined && inCartQty + quantityToAdd > status.maxQuantity) {
      toast({
        title: store.t("quantity_unavailable_title"),
        description: `${Math.max(0, status.maxQuantity - inCartQty)} / ${status.maxQuantity}`,
        variant: "destructive"
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantityToAdd,
      maxQuantity: status?.maxQuantity,
    });

    // Navigate to cart if unique item
    if (isUnique) {
      navigate('/carrinho');
    }
  };

  if (loading) {
    return (
      <div className="container py-4 md:py-10" role="status" aria-busy="true">
        <p className="sr-only">{store.t("catalog_loading")}</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="aspect-square rounded-lg skeleton-block" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded skeleton-block" />
            <div className="h-4 w-1/2 rounded skeleton-block" />
            <div className="h-7 w-1/3 rounded skeleton-block" />
            <div className="h-12 w-full rounded-md skeleton-block" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <Seo title={pageTitle([store.t("product_not_found"), store.storeName])} noindex />
        <h1 className="text-2xl text-forest-900 mb-4">
          {error || store.t("product_not_found")}
        </h1>
        <Link to="/produtos" className="btn btn-secondary">
          {store.t("back_to_products")}
        </Link>
      </div>
    );
  }

  return (
    <>
    <Seo
      title={seoTitle}
      description={seoDescription}
      image={product.image || undefined}
      path={seoPath}
      jsonLd={productJsonLd}
    />
    <div className="bg-white pb-8 pt-3 md:py-10">
      <div className="container">
        <Link
          to="/produtos"
          className="mb-3 inline-flex min-h-[44px] items-center gap-1 text-sm text-forest-700 hover:text-terra-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {store.t("back_to_products")}
        </Link>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div>
            <div className="aspect-[4/3] sm:aspect-square bg-sand-100 rounded-lg overflow-hidden relative">
              <StoreImage
                src={gallery[activeImage] ?? product.image}
                alt={product.name}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="w-full h-full object-cover"
              />
              {status && <InventoryBadge status={status} className="absolute left-3 top-3" />}
            </div>
            {gallery.length > 1 && (
              <ul
                className="mt-3 flex gap-3 overflow-x-auto"
                aria-label={store.t("product_gallery_label")}
              >
                {gallery.map((src, i) => (
                  <li key={src}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-current={i === activeImage}
                      className={`h-16 w-16 rounded-md overflow-hidden border transition-colors ${
                        i === activeImage ? "border-terra-600" : "border-sand-200"
                      }`}
                    >
                      <StoreImage
                        src={src}
                        alt={`${product.name} ${i + 1}`}
                        sizes="64px"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-marcellus text-forest-900">{product.name}</h1>
              {(product.peopleOrCommunity || product.originLocation) && (
                <p className="text-sm text-forest-700">
                  {hasCommunityPage && product.peopleOrCommunity ? (
                    <Link to={`/comunidade/${communitySlug}`} className="text-terra-700 underline">
                      {product.peopleOrCommunity}
                    </Link>
                  ) : (
                    product.peopleOrCommunity
                  )}
                  {product.peopleOrCommunity && product.originLocation ? " · " : ""}
                  {product.originLocation}
                </p>
              )}
            </div>

            <p className="text-2xl font-bold text-terra-700">{store.formatPrice(product.price)}</p>

            {status && (
              <p className="text-sm text-forest-800">
                <span className="font-medium">{status.message}</span>{" "}
                <span className="text-forest-600">
                  {store.text("inventory_notice", "availability_disclaimer")}
                </span>
              </p>
            )}

            {isOutOfStock && (
              <Alert variant={isSoldOut ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isSoldOut
                    ? store.t("product_unavailable_alert")
                    : isUnique
                      ? store.t("product_unique_in_cart_alert")
                      : store.t("product_all_units_in_cart_alert")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-stretch gap-3">
              {showQuantityPicker && !isOutOfStock && (
                <div
                  className="inline-flex items-center rounded-md border border-sand-300"
                  role="group"
                  aria-label={store.t("quantity_label")}
                >
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="inline-flex h-12 w-11 items-center justify-center text-forest-800 disabled:opacity-40"
                    aria-label={store.t("quantity_decrease")}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-lg font-semibold text-forest-900" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                    className="inline-flex h-12 w-11 items-center justify-center text-forest-800 disabled:opacity-40"
                    aria-label={store.t("quantity_increase")}
                    disabled={quantity >= availableQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Button
                onClick={handleAddToCart}
                className={`h-12 flex-1 text-base font-semibold ${isOutOfStock ? "border-sand-300 bg-sand-50 text-forest-700 disabled:opacity-100" : "bg-terra-600 text-white hover:bg-terra-700"}`}
                disabled={isOutOfStock}
                variant={isOutOfStock ? "outline" : "default"}
              >
                {isOutOfStock
                  ? !isSoldOut && existingCartItem
                    ? store.t("already_in_cart_label")
                    : store.t("sold_out_label")
                  : store.text("add_to_cart_label", "add_to_cart_label")}
              </Button>
            </div>
            {existingCartItem && (
              <Link to="/carrinho" className="inline-flex min-h-[44px] items-center text-sm font-medium text-terra-700 underline">
                {store.t("view_cart")} ({existingCartItem.quantity})
              </Link>
            )}

            {(product.longDescription || product.description) && (
              <p className="whitespace-pre-line text-forest-800">
                {product.longDescription || product.description}
              </p>
            )}

            <div className="divide-y divide-sand-200 rounded-lg border border-sand-200">
              <DetailsSection title={store.t("details_piece")} open>
                <MetaRow label={store.t("label_materials")} value={product.materials} />
                <MetaRow label={store.t("label_technique")} value={product.technique} />
                <MetaRow label={store.t("label_dimensions")} value={product.dimensions} />
                <MetaRow label={store.t("label_category")} value={product.category} />
              </DetailsSection>
              <DetailsSection title={store.t("details_origin")}>
                <MetaRow label={store.t("label_community")} value={product.peopleOrCommunity} />
                <MetaRow label={store.t("label_maker")} value={product.makerName} />
                <MetaRow label={store.t("label_origin")} value={product.originLocation} />
                <MetaRow label={store.t("label_revenue")} value={product.revenueInformation} />
              </DetailsSection>
              <DetailsSection title={store.t("details_care")}>
                <MetaRow label={store.t("label_production_time")} value={product.productionTime} />
                <MetaRow label={store.t("label_care")} value={product.careInstructions} />
                <MetaRow label={store.t("label_shipping")} value={product.shippingNotes} />
              </DetailsSection>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductDetails;