export default function PublicSiteLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-16 border-b bg-muted" />
      <div className="h-96 bg-muted/50" />
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <div className="h-8 w-1/2 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}