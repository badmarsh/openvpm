import { CardSkeleton, PageLoading } from "@/components/common/loading";

export default function WebsiteLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <CardSkeleton count={1} />
          <PageLoading className="min-h-[200px] rounded-lg border" />
        </div>
        <div className="lg:col-span-2">
          <CardSkeleton count={1} />
        </div>
      </div>
    </div>
  );
}