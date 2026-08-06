import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MinusCircle, PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InventoryBadge } from "@/components/InventoryBadge";
import { getInventoryStatus } from "@/lib/inventory";
import { useStore } from "@/hooks/use-store";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, cart } = useCart();
  const store = useStore();
  const { getProduct, products, isLoading: productsLoading } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if product is in cart
  const existingCartItem = cart.find(item => item.id === Number(id));

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
    const fetchProduct = async () => {
      if (!id) {
        setError("ID do produto não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productId = parseInt(id, 10);

        // First check if the product is already in the products list
        const foundProduct = products.find(p => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setLoading(false);
          return;
        }

        // If not in the list or if products are still loading, fetch individually
        if (products.length === 0 || !foundProduct) {
          const productData = await getProduct(productId);

          if (productData) {
            setProduct(productData);
          } else {
            setError("Produto não encontrado");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do produto:", err);
        setError("Erro ao carregar detalhes do produto");
      } finally {
        setLoading(false);
      }
    };

    // Wait for products to load if they're loading
    if (!productsLoading || products.length > 0) {
      fetchProduct();
    }
  }, [id, getProduct, products, productsLoading]);

  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    // Unique pieces can only appear once in the cart
    const quantityToAdd = isUnique ? 1 : quantity;

    if (status?.maxQuantity !== undefined && inCartQty + quantityToAdd > status.maxQuantity) {
      toast({
        title: "Quantidade indisponível",
        description: `A loja reportou apenas ${Math.max(0, status.maxQuantity - inCartQty)} unidade(s).`,
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
      <div className="bg-white py-16 animate-fadeIn">
        <div className="container mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl text-forest-900 mb-4">
          {error || "Produto não encontrado"}
        </h1>
        <button
          onClick={() => navigate("/produtos")}
          className="btn btn-secondary"
        >
          Voltar para Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 animate-fadeIn">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-sand-100 rounded-lg overflow-hidden relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {status && <InventoryBadge status={status} className="absolute top-4 right-4" />}
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-marcellus text-forest-900">
              {product.name}
            </h1>
            <p className="text-2xl text-terra-600 font-semibold">
              {store.formatPrice(product.price)}
            </p>

            {status && (
              <div className="space-y-1">
                <p className="text-sm text-forest-700">{status.message}</p>
                <p className="text-sm text-forest-600">{store.text("inventory_notice", "availability_disclaimer")}</p>
              </div>
            )}

            <p className="text-forest-700">
              {product.longDescription || product.description}
            </p>

            {isOutOfStock && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {isSoldOut
                    ? 'Este produto está indisponível no momento.'
                    : isUnique
                      ? 'Esta peça única já está no seu carrinho.'
                      : 'Você já adicionou todas as unidades reportadas.'}
                </AlertDescription>
              </Alert>
            )}

            {showQuantityPicker && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-forest-600 hover:text-forest-800 transition-colors disabled:opacity-50"
                  aria-label="Diminuir quantidade"
                  disabled={isOutOfStock}
                >
                  <MinusCircle className="w-6 h-6" />
                </button>
                <span className="text-xl font-semibold text-forest-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                  className="text-forest-600 hover:text-forest-800 transition-colors disabled:opacity-50"
                  aria-label="Aumentar quantidade"
                  disabled={isOutOfStock || quantity >= availableQuantity}
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </div>
            )}

            <Button
              onClick={handleAddToCart}
              className="w-full"
              disabled={isOutOfStock}
              variant={isOutOfStock ? "outline" : "default"}
            >
              {isOutOfStock
                ? (isUnique && existingCartItem ? store.t('already_in_cart_label') : store.t('sold_out_label'))
                : store.text('add_to_cart_label', 'add_to_cart_label')}
            </Button>

            {status?.type === "unique" && !isSoldOut && (
              <p className="text-sm text-amber-600 italic">
                Peça única — feita artesanalmente, com uma só unidade reportada pela loja.
              </p>
            )}

            {status?.type === "made_to_order" && (
              <p className="text-sm text-forest-700 italic">{status.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;