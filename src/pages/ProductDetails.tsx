import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/products";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const { getProduct, products, isLoading: productsLoading } = useProducts();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity
      });

      toast({
        title: "Produto adicionado ao carrinho!",
        description: `${quantity}x ${product.name}`,
      });
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
          <div className="aspect-square bg-sand-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-marcellus text-forest-900">
              {product.name}
            </h1>
            <p className="text-2xl text-terra-600 font-semibold">
              R$ {product.price.toFixed(2)}
            </p>
            <p className="text-forest-700">
              {product.longDescription || product.description}
            </p>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-forest-600 hover:text-forest-800 transition-colors"
                aria-label="Diminuir quantidade"
              >
                <MinusCircle className="w-6 h-6" />
              </button>
              <span className="text-xl font-semibold text-forest-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-forest-600 hover:text-forest-800 transition-colors"
                aria-label="Aumentar quantidade"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary w-full"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;