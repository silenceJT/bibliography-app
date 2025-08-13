"use client";

import { Globe, Download } from "lucide-react";

interface LanguageDistributionProps {
  data:
    | Array<{
        language: string;
        count: number;
        percentage: number;
      }>
    | null
    | undefined;
}

export function LanguageDistribution({ data }: LanguageDistributionProps) {
  if (!data) return null;

  const exportLanguages = () => {
    const csvContent = [
      "Language,Publications,Percentage",
      ...data.map((l) => `${l.language},${l.count},${l.percentage}%`),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "language-distribution.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Language Distribution
              </h3>
              <p className="text-sm text-gray-500">
                Top 10 languages by publication count
              </p>
            </div>
          </div>

          <button
            onClick={exportLanguages}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {data.map((lang, index) => (
            <div key={lang.language} className="flex items-center gap-4">
              <div className="flex items-center gap-3 min-w-[120px]">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: colors[index % colors.length],
                  }}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {lang.language}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${(lang.count / Math.max(...data.map((l) => l.count))) * 100}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">
                    {lang.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({lang.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
