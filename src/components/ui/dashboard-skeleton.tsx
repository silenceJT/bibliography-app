import { Skeleton } from "./skeleton";
import { ResearchInsightsSkeleton } from "./research-insights-skeleton";
import { LanguageDistributionSkeleton } from "./language-distribution-skeleton";

interface DashboardSkeletonProps {
  loadingStage?: "critical" | "detailed" | "idle";
}

export function DashboardSkeleton({
  loadingStage = "idle",
}: DashboardSkeletonProps) {
  const getLoadingMessage = () => {
    switch (loadingStage) {
      case "critical":
        return "Loading essential data...";
      case "detailed":
        return "Loading detailed insights...";
      default:
        return "Loading dashboard...";
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Stage Indicator */}
      {loadingStage !== "idle" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-blue-800 font-medium">{getLoadingMessage()}</p>
          </div>
        </div>
      )}

      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <Skeleton className="h-6 w-6 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ResearchInsightsSkeleton />
        </div>
        <div>
          <LanguageDistributionSkeleton />
        </div>
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
