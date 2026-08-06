import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/hooks/use-store";

const Products = () => {
  const { products, isLoading, error } = useProducts();
  const store = useStore();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.description].filter(Boolean).join(" ").toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-8">
          {store.text("products_page_title", "products_page_title")}
        </h1>

        {products.length > 0 && (
          <div className="max-w-md mx-auto mb-10">
            <label htmlFor="product-search" className="sr-only">
              {store.t("search_label")}
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={store.text("search_placeholder", "search_placeholder")}
              className="w-full px-4 py-2 border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-terra-500"
            />
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700" />
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
              {store.text("empty_catalog_message", "empty_catalog_message")}
            </p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-forest-700">{store.t("empty_search_message")}</p>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
