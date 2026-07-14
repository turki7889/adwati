export default function CategoryLoading() {
  return (
    <div className="min-h-screen">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-bg-card">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="h-9 w-28 bg-bg-surface rounded-lg animate-pulse" />
            <div className="flex gap-6">
              <div className="h-5 w-20 bg-bg-surface rounded animate-pulse" />
              <div className="h-5 w-24 bg-bg-surface rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-bg-surface rounded animate-pulse" />
          <div className="h-4 w-4" />
          <div className="h-4 w-14 bg-bg-surface rounded animate-pulse" />
          <div className="h-4 w-4" />
          <div className="h-4 w-24 bg-bg-surface rounded animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-bg-surface rounded-2xl animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-bg-surface rounded animate-pulse mb-2" />
            <div className="h-4 w-72 bg-bg-surface rounded animate-pulse" />
          </div>
        </div>

        <div className="h-4 w-28 bg-bg-surface rounded animate-pulse mt-6 mb-8" />

        {/* Tool Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-border bg-bg-card p-5"
            >
              <div className="w-10 h-10 bg-bg-surface rounded-lg animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-bg-surface rounded animate-pulse mb-2" />
                <div className="h-4 w-full bg-bg-surface rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
