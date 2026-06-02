/** Squelettes de chargement — évitent le flash de produits par défaut. */
export default function ProductGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="aspect-[4/3] bg-surface animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 rounded bg-surface animate-pulse" />
            <div className="h-3 w-full rounded bg-surface animate-pulse" />
            <div className="h-3 w-2/3 rounded bg-surface animate-pulse" />
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="h-5 w-20 rounded bg-surface animate-pulse" />
              <div className="h-8 w-24 rounded-full bg-surface animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
