"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ResearchInsights } from "@/components/dashboard/research-insights-simplified";
import { LanguageDistribution } from "@/components/dashboard/language-distribution-simplified";
import { RecentBibliographies } from "@/components/dashboard/recent-bibliographies-simplified";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Search, Plus, RefreshCw, BarChart3, Users } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
            <p className="text-gray-600">Gathering your research insights...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 inline mr-2" />
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Simple Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your bibliography database</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Refresh
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/bibliography" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium text-blue-900">Add Entry</div>
          </a>
          <a href="/bibliography/search" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Search className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium text-green-900">Search</div>
          </a>
          <a href="/dashboard/reports" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-medium text-purple-900">Reports</div>
          </a>
          <a href="/dashboard/users" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Users className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-medium text-orange-900">Users</div>
          </a>
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
        <RecentBibliographies data={data?.recentItems} />
      </div>
    </DashboardLayout>
  );
}
