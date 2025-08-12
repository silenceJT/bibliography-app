"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

type PublicationTrendsProps = Record<string, never>;

export function PublicationTrends({}: PublicationTrendsProps) {
  const [trends, setTrends] = useState<Array<{ year: string; count: number }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPublicationTrends();
  }, []);

  const fetchPublicationTrends = async () => {
    try {
      const response = await fetch("/api/dashboard/trends");
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error("Error fetching publication trends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for now - replace with real API call
  const mockTrends = [
    { year: "2020", count: 45 },
    { year: "2021", count: 52 },
    { year: "2022", count: 48 },
    { year: "2023", count: 67 },
    { year: "2024", count: 23 },
  ];

  const data = trends.length > 0 ? trends : mockTrends;
  const maxCount = Math.max(...data.map((d) => d.count));

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Publication Trends
          </h3>
          <p className="text-sm text-gray-500">Publications by year</p>
        </div>
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">+15%</span>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`${item.year}-${index}`} className="flex items-center">
            <div className="w-16 text-sm text-gray-500">{item.year}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right text-sm font-medium text-gray-900">
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
