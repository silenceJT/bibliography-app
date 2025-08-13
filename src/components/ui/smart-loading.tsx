"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonTable, SkeletonChart, SkeletonGrid } from "./skeleton";

interface SmartLoadingProps {
  isLoading: boolean;
  error: string | null;
  data: unknown;
  onRefetch: () => Promise<void>;
  children: React.ReactNode;
  skeletonType?: "grid" | "table" | "chart";
  skeletonProps?: Record<string, unknown>;
  customSkeleton?: React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  showRetryOnError?: boolean;
  className?: string;
}

export function SmartLoading({
  isLoading,
  error,
  data,
  onRefetch,
  children,
  skeletonType = "grid",
  skeletonProps = {},
  customSkeleton,
  emptyMessage = "No data available",
  emptyIcon,
  showRetryOnError = true,
  className = "",
}: SmartLoadingProps) {
  const [isRefetching, setIsRefetching] = useState(false);
  const [showError, setShowError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Show error after a delay to prevent flashing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setShowError(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [error]);

  // Simplified skeleton logic - only show when actually loading
  const shouldShowSkeleton = isLoading && !data;

  const handleRefetch = async () => {
    if (retryCount >= maxRetries) {
      setRetryCount(0);
    }

    setIsRefetching(true);
    try {
      await onRefetch();
      setRetryCount(0);
    } catch {
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsRefetching(false);
    }
  };

  // Render skeleton if needed
  if (shouldShowSkeleton) {
    if (customSkeleton) {
      return <div className={className}>{customSkeleton}</div>;
    }

    const SkeletonComponent =
      {
        table: SkeletonTable,
        chart: SkeletonChart,
        grid: SkeletonGrid,
      }[skeletonType] || SkeletonGrid;

    return (
      <div className={className}>
        <SkeletonComponent {...skeletonProps} />
      </div>
    );
  }

  // Refetching overlay
  if (isRefetching) {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Refreshing data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && showError) {
    const isMaxRetriesReached = retryCount >= maxRetries;

    return (
      <div
        className={`min-h-[400px] flex items-center justify-center ${className}`}
      >
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {isMaxRetriesReached ? "Connection Failed" : "Unable to Load Data"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isMaxRetriesReached
              ? "Please check your internet connection and try again later."
              : error}
          </p>
          {showRetryOnError && !isMaxRetriesReached && (
            <button
              onClick={handleRefetch}
              disabled={isRefetching}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefetching && "animate-spin")}
              />
              {isRefetching
                ? "Retrying..."
                : `Try Again (${maxRetries - retryCount} attempts left)`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (
    !isLoading &&
    !error &&
    data !== null &&
    data !== undefined &&
    Array.isArray(data) &&
    data.length === 0
  ) {
    return (
      <div
        className={`min-h-[400px] flex items-center justify-center ${className}`}
      >
        <div className="text-center max-w-md">
          {emptyIcon && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
              {emptyIcon}
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Success state
  return <div className={className}>{children}</div>;
}
