import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)}>
      {children}
    </div>
  );
}

// Specific skeleton components for common use cases
export function SkeletonText({
  className,
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 bg-white rounded-xl border border-gray-200",
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn("h-4", colIndex === 0 ? "w-32" : "w-24")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-6 bg-white rounded-xl border border-gray-200",
        className
      )}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({
  items = 6,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
