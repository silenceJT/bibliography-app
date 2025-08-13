"use client";

import { BookOpen, Globe, Target, TrendingUp } from "lucide-react";

interface ResearchInsightsProps {
  data: {
    stats: {
      totalRecords: number;
      thisYear: number;
      languages: number;
      countries: number;
    };
    languages: Array<{
      language: string;
      count: number;
      percentage: number;
    }>;
  } | null;
}

export function ResearchInsights({ data }: ResearchInsightsProps) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
            <p className="text-sm text-gray-500">
              Essential statistics from your database
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="p-3 rounded-xl bg-blue-500">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                Total Records
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {data.stats.totalRecords.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Total bibliography entries
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="p-3 rounded-xl bg-green-500">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                Primary Language
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {data.languages?.[0]?.language || "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                {data.languages?.[0]
                  ? `${data.languages[0].count} publications`
                  : "No data"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="p-3 rounded-xl bg-purple-500">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                Research Diversity
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {data.stats.languages} languages
              </p>
              <p className="text-sm text-gray-500">
                {data.stats.countries} countries
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
            <div className="p-3 rounded-xl bg-orange-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                This Year&apos;s Activity
              </h4>
              <p className="text-lg font-bold text-gray-900">
                {data.stats.thisYear}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(
                  (data.stats.thisYear / data.stats.totalRecords) * 100
                )}
                % of total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
