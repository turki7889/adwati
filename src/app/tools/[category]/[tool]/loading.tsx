export default function ToolLoading() {
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
          <div className="h-4 w-20 bg-bg-surface rounded animate-pulse" />
          <div className="h-4 w-4" />
          <div className="h-4 w-28 bg-bg-surface rounded animate-pulse" />
        </div>
      </div>

      {/* Tool Header Skeleton */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-bg-surface rounded-2xl mx-auto mb-4 animate-pulse" />
          <div className="h-8 w-64 bg-bg-surface rounded animate-pulse mx-auto mb-2" />
          <div className="h-5 w-96 bg-bg-surface rounded animate-pulse mx-auto mb-3" />
          <div className="h-6 w-28 bg-bg-surface rounded-full animate-pulse mx-auto" />
        </div>

        {/* Tool Workspace Skeleton */}
        <div className="rounded-2xl border-2 border-dashed border-border bg-bg-main p-12 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-3 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-lg text-text-muted">جاري تحميل الأداة...</p>
        </div>
      </main>
    </div>
  );
}
