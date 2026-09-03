import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/use-products';
import { useStore } from '@/hooks/use-store';

/**
 * Honest data-source notice: shown only when the catalog on screen does not
 * come live from the spreadsheet (cached or bundled fallback).
 */
export const CatalogStatusNotice = () => {
  const { source, isRefreshing, refreshProducts, isLoading } = useProducts();
  const { t } = useStore();

  if (isLoading || source === 'spreadsheet' || source === 'none') return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-border bg-muted/50 text-muted-foreground px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <p className="text-sm flex-1">
        {t('catalog_stale_notice')}{' '}
        <Link to="/verificar-loja" className="underline underline-offset-2">
          {t('store_check_link')}
        </Link>
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => refreshProducts()}
        disabled={isRefreshing}
        className="shrink-0"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? t('catalog_refreshing') : t('catalog_refresh')}
      </Button>
    </div>
  );
};

export default CatalogStatusNotice;
