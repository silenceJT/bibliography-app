"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

type LanguageDistributionProps = Record<string, never>;

export function LanguageDistribution({}: LanguageDistributionProps) {
  const [languages, setLanguages] = useState<
    Array<{ language: string; count: number; percentage: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLanguageDistribution();
  }, []);

  const fetchLanguageDistribution = async () => {
    try {
      const response = await fetch("/api/dashboard/languages");
      if (response.ok) {
        const data = await response.json();
        setLanguages(data.languages || []);
      }
    } catch (error) {
      console.error("Error fetching language distribution:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for now - replace with real API call
  const mockLanguages = [
    { language: "English", count: 156, percentage: 45 },
    { language: "Spanish", count: 89, percentage: 26 },
    { language: "French", count: 67, percentage: 19 },
    { language: "German", count: 34, percentage: 10 },
  ];

  const data = languages.length > 0 ? languages : mockLanguages;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
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
            Language Distribution
          </h3>
          <p className="text-sm text-gray-500">Publications by language</p>
        </div>
        <Globe className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={`${item.language}-${index}`} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-3"
              style={{
                backgroundColor: [
                  "#3B82F6", // blue
                  "#10B981", // green
                  "#F59E0B", // yellow
                  "#EF4444", // red
                  "#8B5CF6", // purple
                  "#06B6D4", // cyan
                ][index % 6],
              }}
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {item.language}
                </span>
                <span className="text-sm text-gray-500">{item.count}</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: [
                      "#3B82F6", // blue
                      "#10B981", // green
                      "#F59E0B", // yellow
                      "#EF4444", // red
                      "#8B5CF6", // purple
                      "#06B6D4", // cyan
                    ][index % 6],
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
