import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { type Product } from '@/lib/products';
import {
  loadCatalogSnapshot,
  readCachedCatalog,
  type CatalogSnapshot,
  type CatalogSource,
} from '@/lib/catalog-loader';
import type { RowIssue } from '@/lib/catalog-validation';

interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  /** Where the currently displayed catalog came from. */
  source: CatalogSource;
  /** Rows skipped or flagged during validation. */
  issues: RowIssue[];
  totalRows: number;
  updatedAt: string | null;
  spreadsheetError: string | null;
  spreadsheetConfigured: boolean;
  getProduct: (id: number) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const emptySnapshot: CatalogSnapshot = {
  products: [],
  source: 'none',
  updatedAt: null,
  issues: [],
  totalRows: 0,
  spreadsheetError: null,
  spreadsheetConfigured: false,
};

/** Show the last known good catalog immediately, then refresh from the sheet. */
const initialSnapshot = (): CatalogSnapshot => {
  const cached = readCachedCatalog();
  if (!cached) return emptySnapshot;
  return {
    ...emptySnapshot,
    products: cached.products,
    source: 'cache',
    updatedAt: cached.updatedAt,
    totalRows: cached.products.length,
  };
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<CatalogSnapshot>(initialSnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { products } = snapshot;
  const flagged = products.filter((p) => p.featured);
  const featuredProducts = flagged.length > 0 ? flagged : products.slice(0, 3);

  const fetchProducts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const next = await loadCatalogSnapshot();
      setSnapshot(next);
      setError(
        next.products.length === 0
          ? 'Não foi possível carregar os produtos. Tente novamente mais tarde.'
          : null,
      );
    } catch (err) {
      console.error('[ProductContext] Error fetching products:', err);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getProduct = async (id: number): Promise<Product | undefined> => {
    const known = products.find((p) => p.id === id);
    if (known) return known;
    const next = await loadCatalogSnapshot();
    setSnapshot(next);
    return next.products.find((p) => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        isLoading,
        isRefreshing,
        error,
        source: snapshot.source,
        issues: snapshot.issues,
        totalRows: snapshot.totalRows,
        updatedAt: snapshot.updatedAt,
        spreadsheetError: snapshot.spreadsheetError,
        spreadsheetConfigured: snapshot.spreadsheetConfigured,
        getProduct,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
