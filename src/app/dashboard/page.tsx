"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { ResearchInsights } from "@/components/dashboard/research-insights";
import { LanguageDistribution } from "@/components/dashboard/language-distribution";
import { RecentBibliographies } from "@/components/dashboard/recent-bibliographies";
import { 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Globe, 
  MapPin, 
  Search, 
  Plus,
  RefreshCw,
  BarChart3,
  FileText,
  Users,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    thisYear: 0,
    languages: 0,
    countries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch stats"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      name: "Add Bibliography",
      description: "Create a new bibliography entry",
      icon: Plus,
      href: "/bibliography",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      name: "Search Database",
      description: "Find specific publications",
      icon: Search,
      href: "/bibliography/search",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      name: "View Reports",
      description: "Generate detailed analytics",
      icon: BarChart3,
      href: "/dashboard/reports",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      name: "Manage Users",
      description: "User administration",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-pulse"></div>
            </div>
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
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BookOpen className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Research Dashboard
                  </h1>
                  <p className="text-lg text-gray-600 mt-1">
                    Comprehensive overview of your bibliography database
                  </p>
                </div>
              </div>
              
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                  Last updated: {lastUpdated.toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.name}
                  href={action.href}
                  className="group block p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color} ${action.hoverColor} transition-colors`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {action.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ResearchInsights />
          <LanguageDistribution />
        </div>

        {/* Recent Bibliographies */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <RecentBibliographies />
        </div>
      </div>
    </DashboardLayout>
  );
}
