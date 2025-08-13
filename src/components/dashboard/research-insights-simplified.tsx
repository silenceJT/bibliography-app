"use client";

import { BookOpen, Globe, Target, TrendingUp } from "lucide-react";

interface ResearchInsightsProps {
  data?: {
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
  };
}

interface MetricItem {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function ResearchInsights({ data }: ResearchInsightsProps) {
  if (!data) return null;

  // SIMPLIFIED: Just 4 key metrics, no trends, no complex logic
  const metrics: MetricItem[] = [
    {
      title: "Total Records",
      value: data.stats.totalRecords.toLocaleString(),
      description: "Total bibliography entries",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Primary Language",
      value: data.languages?.[0]?.language || "N/A",
      description: data.languages?.[0]
        ? `${data.languages[0].count} publications`
        : "No data",
      icon: Globe,
      color: "bg-green-500",
    },
    {
      title: "Research Diversity",
      value: `${data.stats.languages} languages`,
      description: `${data.stats.countries} countries`,
      icon: Target,
      color: "bg-purple-500",
    },
    {
      title: "This Year's Activity",
      value: data.stats.thisYear.toString(),
      description: `${Math.round((data.stats.thisYear / data.stats.totalRecords) * 100)}% of total`,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

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
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className={`p-3 rounded-xl ${metric.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {metric.title}
                  </h4>
                  <p className="text-lg font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-600">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
