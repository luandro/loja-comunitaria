/** Lightweight CSS-only placeholder shown while the catalog loads. */
export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="product-grid" role="status" aria-busy="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-lg border border-sand-200 bg-white">
        <div className="aspect-square skeleton-block" />
        <div className="space-y-2 p-3">
          <div className="h-4 w-3/4 skeleton-block rounded" />
          <div className="h-3 w-1/2 skeleton-block rounded" />
          <div className="h-5 w-1/3 skeleton-block rounded" />
          <div className="h-11 w-full skeleton-block rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
