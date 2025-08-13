"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ResearchInsights } from "@/components/dashboard/research-insights";
import { LanguageDistribution } from "@/components/dashboard/language-distribution";
import { RecentBibliographies } from "@/components/dashboard/recent-bibliographies";
import { useDashboardData } from "@/hooks/use-simple-cache";
import { SmartLoading } from "@/components/ui/smart-loading";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { Search, Plus, RefreshCw, BarChart3, Users, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data, isLoading, error, refetch, loadingStage } = useDashboardData();

  return (
    <DashboardLayout>
      <SmartLoading
        isLoading={isLoading}
        error={error}
        data={data}
        onRefetch={refetch}
        skeletonType="grid"
        customSkeleton={<DashboardSkeleton loadingStage={loadingStage} />}
        emptyMessage="No research data available yet. Start by adding your first bibliography entry!"
        emptyIcon={<BookOpen className="h-8 w-8 text-gray-400" />}
        className="space-y-6"
      >
        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your bibliography database</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Reports feature in development</span>
            </div>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/bibliography/new" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-blue-900">Add Entry</div>
          </Link>
          <Link href="/bibliography/search" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Search className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-green-900">Search</div>
          </Link>
          
          {/* Reports Feature - Currently in Development */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed opacity-60 relative">
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              DEV
            </div>
            <BarChart3 className="h-6 w-6 text-gray-400 mb-2" />
            <div className="font-medium text-gray-500">Reports</div>
            <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
          </div>
          <Link href="/dashboard/users" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Users className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-medium text-orange-900">Users</div>
          </Link>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ResearchInsights data={data} />
          </div>
          <div>
            <LanguageDistribution data={data?.languages} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <RecentBibliographies data={data?.recentItems} />
          </div>
        </div>
      </SmartLoading>
    </DashboardLayout>
  );
}
