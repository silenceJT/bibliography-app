import { Skeleton } from "./skeleton";

export function BibliographyTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Search and Sort Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Skeleton className="h-10 w-80" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-4 w-20 col-span-3" />
            <Skeleton className="h-4 w-16 col-span-2" />
            <Skeleton className="h-4 w-16 col-span-2" />
            <Skeleton className="h-4 w-20 col-span-2" />
            <Skeleton className="h-4 w-16 col-span-2" />
            <Skeleton className="h-4 w-12 col-span-1" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16 col-span-2" />
                <Skeleton className="h-4 w-20 col-span-2" />
                <Skeleton className="h-4 w-24 col-span-2" />
                <Skeleton className="h-4 w-16 col-span-2" />
                <div className="col-span-1 flex gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
