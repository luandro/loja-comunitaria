import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { loadProducts, getProductById, type Product } from '@/lib/products';

// Cache time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  error: string | null;
  getProduct: (id: number) => Promise<Product | undefined>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Initialize with cached values from sessionStorage if available
const getInitialState = () => {
  try {
    const cachedData = sessionStorage.getItem('productCache');
    if (cachedData) {
      const { products, timestamp } = JSON.parse(cachedData);
      const now = new Date().getTime();

      // Check if cache is still valid
      if (now - timestamp < CACHE_EXPIRY) {
        console.log('[ProductContext] Using cached product data');
        return {
          products,
          isLoading: false,
          error: null,
        };
      }
    }
  } catch (err) {
    console.error('[ProductContext] Error reading from cache:', err);
  }

  // Return default state if no valid cache
  return {
    products: [],
    isLoading: true,
    error: null,
  };
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(() => getInitialState());
  const { products, isLoading, error } = state;

  // Featured = products flagged in the sheet; fall back to first 3 if none flagged
  const flagged = products.filter((p) => p.featured);
  const featuredProducts = flagged.length > 0 ? flagged : products.slice(0, 3);

  // Product lookup cache
  const [productCache, setProductCache] = useState<Record<number, Product>>({});

  const fetchProducts = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await loadProducts();

      // Update state with fetched products
      setState({
        products: data,
        isLoading: false,
        error: null,
      });

      // Update product cache lookup
      const newCache: Record<number, Product> = {};
      for (const product of data) {
        newCache[product.id] = product;
      }
      setProductCache(newCache);

      // Save to sessionStorage cache
      try {
        sessionStorage.setItem('productCache', JSON.stringify({
          products: data,
          timestamp: new Date().getTime(),
        }));
      } catch (err) {
        console.error('[ProductContext] Error saving to cache:', err);
      }
    } catch (err) {
      console.error('[ProductContext] Error fetching products:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Não foi possível carregar os produtos. Por favor, tente novamente mais tarde.',
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    // Only fetch if we didn't restore from cache
    if (isLoading && products.length === 0) {
      fetchProducts();
    }
  }, [isLoading, products.length, fetchProducts]);

  // Function to get a single product - first checks cache, then fetches if needed
  const getProduct = async (id: number): Promise<Product | undefined> => {
    // First check our local context cache
    if (productCache[id]) {
      return productCache[id];
    }

    // Then check if the product is in our products list
    const product = products.find(p => p.id === id);
    if (product) {
      return product;
    }

    // Finally fetch from the source if not found
    try {
      const product = await getProductById(id);
      if (product) {
        // Update our cache
        setProductCache(prev => ({
          ...prev,
          [id]: product
        }));
      }
      return product;
    } catch (error) {
      console.error(`[ProductContext] Error fetching product ${id}:`, error);
      return undefined;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        featuredProducts,
        isLoading,
        error,
        getProduct,
        refreshProducts: fetchProducts
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