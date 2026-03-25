export function BookCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton h-44 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-2/3" />
        <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function BookGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
