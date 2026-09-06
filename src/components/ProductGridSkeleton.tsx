/** Lightweight CSS-only placeholder shown while the catalog loads. */
export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    role="status"
    aria-busy="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="aspect-square skeleton-block" />
        <div className="p-4 space-y-3">
          <div className="h-5 w-2/3 skeleton-block rounded" />
          <div className="h-4 w-full skeleton-block rounded" />
          <div className="h-4 w-1/2 skeleton-block rounded" />
          <div className="h-11 w-full skeleton-block rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
