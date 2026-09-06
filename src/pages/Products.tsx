import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import ProductCard from "../components/ProductCard";
import CatalogFilters from "../components/CatalogFilters";
import CatalogStatusNotice from "../components/CatalogStatusNotice";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useStore } from "@/hooks/use-store";

import {
  DEFAULT_FILTERS,
  INVENTORY_FILTERS,
  SORT_OPTIONS,
  buildSearchIndex,
  facetValues,
  filterProducts,
  inventoryOptions,
  type CatalogFilterState,
  type InventoryFilter,
  type SortOption,
} from "@/lib/catalog";

const Products = () => {
  const { products, isLoading, error } = useProducts();
  const store = useStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: CatalogFilterState = useMemo(() => {
    const inventory = searchParams.get("estoque") as InventoryFilter | null;
    const sort = searchParams.get("ordem") as SortOption | null;
    return {
      query: searchParams.get("q") ?? "",
      category: searchParams.get("categoria") ?? "",
      community: searchParams.get("comunidade") ?? "",
      inventory: inventory && INVENTORY_FILTERS.includes(inventory) ? inventory : "all",
      sort: sort && SORT_OPTIONS.includes(sort) ? sort : "featured",
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (patch: Partial<CatalogFilterState>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.category) params.set("categoria", next.category);
      if (next.community) params.set("comunidade", next.community);
      if (next.inventory !== DEFAULT_FILTERS.inventory) params.set("estoque", next.inventory);
      if (next.sort !== DEFAULT_FILTERS.sort) params.set("ordem", next.sort);
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const searchIndex = useMemo(() => buildSearchIndex(products), [products]);
  const categories = useMemo(() => facetValues(products, "category"), [products]);
  const communities = useMemo(() => facetValues(products, "peopleOrCommunity"), [products]);
  const inventoryChoices = useMemo(() => inventoryOptions(products), [products]);

  const filtered = useMemo(
    () => filterProducts(products, filters, searchIndex),
    [products, filters, searchIndex],
  );

  return (
    <div className="bg-sand-50 py-16 animate-fadeIn">
      <div className="container mx-auto">
        <h1 className="text-4xl font-marcellus text-forest-900 text-center mb-8">
          {store.text("products_page_title", "products_page_title")}
        </h1>

        <CatalogStatusNotice />

        {products.length > 0 && (
          <CatalogFilters
            store={store}
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
            categories={categories}
            communities={communities}
            inventoryChoices={inventoryChoices}
            resultCount={filtered.length}
          />
        )}

        {isLoading && products.length === 0 && (
          <>
            <p className="sr-only">{store.t("catalog_loading")}</p>
            <ProductGridSkeleton />
          </>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-700 mb-4">{error}</p>
            <Button variant="outline" onClick={() => refreshProducts()} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? store.t("catalog_refreshing") : store.t("catalog_retry")}
            </Button>
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
