import ProductCard from "../components/ProductCard";
import { useProducts } from "@/hooks/use-products";

const Products = () => {
  const { products, isLoading, error } = useProducts();

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-12">
          Nossos Produtos
        </h1>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700"></div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-forest-700">
              Nenhum produto disponível no momento. Volte mais tarde!
            </p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;