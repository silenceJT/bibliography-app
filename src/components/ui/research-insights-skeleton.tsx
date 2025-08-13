import { Skeleton } from "./skeleton";

export function ResearchInsightsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Records Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Primary Language Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>

          {/* Research Diversity Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>

          {/* Trending Card */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
