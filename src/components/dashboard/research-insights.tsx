"use client";

import { useState, useEffect } from "react";
import { TrendingUp, BookOpen, Globe, Calendar, Award, Target, Lightbulb, BarChart3 } from "lucide-react";

type ResearchInsightsProps = Record<string, never>;

interface ResearchInsight {
  type: 'publication' | 'language' | 'country' | 'trend';
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: string;
  };
}

export function ResearchInsights({}: ResearchInsightsProps) {
  const [insights, setInsights] = useState<ResearchInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResearchInsights();
  }, []);

  const fetchResearchInsights = async () => {
    try {
      setIsLoading(true);
      // Fetch multiple data points in parallel for better performance
      const [trendsResponse, languagesResponse, countriesResponse] = await Promise.all([
        fetch("/api/dashboard/trends?range=5y"),
        fetch("/api/dashboard/languages"),
        fetch("/api/dashboard/stats")
      ]);

      const trendsData = trendsResponse.ok ? await trendsResponse.json() : { trends: [] };
      const languagesData = languagesResponse.ok ? await languagesResponse.json() : { languages: [] };
      const statsData = countriesResponse.ok ? await countriesResponse.json() : {};

      const processedInsights = processInsights(trendsData, languagesData, statsData);
      setInsights(processedInsights);
    } catch (error) {
      console.error("Error fetching research insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processInsights = (trends: { trends?: Array<{ year: string; count: number }> }, languages: { languages?: Array<{ language: string; count: number }> }, stats: { totalRecords?: number; languages?: number; countries?: number; thisYear?: number }): ResearchInsight[] => {
    const insights: ResearchInsight[] = [];

    // Most active research year
    if (trends.trends && trends.trends.length > 0) {
      const sortedTrends = trends.trends.sort((a, b) => b.count - a.count);
      const mostActiveYear = sortedTrends[0];
      insights.push({
        type: 'trend',
        title: 'Most Active Year',
        value: mostActiveYear.year,
        description: `${mostActiveYear.count} publications`,
        icon: Calendar,
        color: 'bg-blue-500',
        trend: {
          direction: 'up',
          value: `${mostActiveYear.count} publications`
        }
      });
    }

    // Top language
    if (languages.languages && languages.languages.length > 0) {
      const topLanguage = languages.languages[0];
      insights.push({
        type: 'language',
        title: 'Primary Language',
        value: topLanguage.language,
        description: `${topLanguage.count} publications`,
        icon: Globe,
        color: 'bg-green-500',
        trend: {
          direction: 'stable',
          value: `${Math.round((topLanguage.count / (stats.totalRecords || 1)) * 100)}% of total`
        }
      });
    }

    // Research diversity
    if (stats.languages && stats.countries) {
      insights.push({
        type: 'trend',
        title: 'Research Diversity',
        value: `${stats.languages} languages`,
        description: `${stats.countries} countries`,
        icon: Target,
        color: 'bg-purple-500',
        trend: {
          direction: 'up',
          value: 'High diversity'
        }
      });
    }

    // Recent activity
    if (stats.thisYear && stats.totalRecords) {
      const thisYearPercentage = Math.round((stats.thisYear / stats.totalRecords) * 100);
      insights.push({
        type: 'trend',
        title: 'This Year\'s Activity',
        value: `${stats.thisYear} entries`,
        description: `${thisYearPercentage}% of total database`,
        icon: TrendingUp,
        color: 'bg-orange-500',
        trend: {
          direction: thisYearPercentage > 10 ? 'up' : 'stable',
          value: `${thisYearPercentage}% of total`
        }
      });
    }

    return insights;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'stable':
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Lightbulb className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Research Insights
          </h3>
          <p className="text-sm text-gray-500">
            Key patterns and highlights from your database
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={`${insight.type}-${index}`}
              className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${insight.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {insight.trend && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(insight.trend.direction)}`}>
                    {getTrendIcon(insight.trend.direction)}
                    <span className="text-xs">{insight.trend.value}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {insight.title}
                </h4>
                <p className="text-lg font-bold text-gray-900">
                  {insight.value}
                </p>
                <p className="text-xs text-gray-600">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Database Health
            </h4>
            <p className="text-xs text-gray-600">
              Your bibliography database shows strong research coverage across multiple languages and countries
            </p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {insights.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No insights available</h3>
          <p className="text-sm text-gray-500">Add more bibliography entries to generate research insights.</p>
        </div>
      )}
    </div>
  );
}
