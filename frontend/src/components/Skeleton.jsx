export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-ink/10 bg-white animate-pulse">
      <div className="aspect-[4/5] bg-ink/5" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-ink/10 rounded-full" />
        <div className="h-5 w-3/4 bg-ink/10 rounded-full" />
        <div className="h-3 w-1/2 bg-ink/10 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}