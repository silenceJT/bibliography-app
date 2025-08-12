"use client";

import { useState, useEffect } from "react";
import { Globe, Download, PieChart, BarChart3, Eye, EyeOff } from "lucide-react";

type LanguageDistributionProps = Record<string, never>;

interface LanguageData {
  language: string;
  count: number;
  percentage: number;
  code?: string;
}

export function LanguageDistribution({}: LanguageDistributionProps) {
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showPercentages, setShowPercentages] = useState(true);
  const [maxDisplayed, setMaxDisplayed] = useState(6);
  const [sortBy, setSortBy] = useState<'count' | 'alphabetical'>('count');

  useEffect(() => {
    fetchLanguageDistribution();
  }, []);

  const fetchLanguageDistribution = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboard/languages");
      if (response.ok) {
        const data = await response.json();
        const processedData = processLanguageData(data.languages || []);
        setLanguages(processedData);
      }
    } catch (error) {
      console.error("Error fetching language distribution:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processLanguageData = (rawData: Array<{ language: string; count: number }>): LanguageData[] => {
    if (rawData.length === 0) return [];
    
    const total = rawData.reduce((sum, item) => sum + item.count, 0);
    
    return rawData.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      code: getLanguageCode(item.language)
    }));
  };

  const getLanguageCode = (language: string): string => {
    const codes: { [key: string]: string } = {
      'English': 'EN',
      'Spanish': 'ES',
      'French': 'FR',
      'German': 'DE',
      'Italian': 'IT',
      'Portuguese': 'PT',
      'Russian': 'RU',
      'Chinese': 'ZH',
      'Japanese': 'JA',
      'Korean': 'KO',
      'Arabic': 'AR',
      'Hindi': 'HI'
    };
    return codes[language] || language.substring(0, 2).toUpperCase();
  };

  const getSortedLanguages = () => {
    const sorted = [...languages];
    if (sortBy === 'count') {
      return sorted.sort((a, b) => b.count - a.count);
    } else {
      return sorted.sort((a, b) => a.language.localeCompare(b.language));
    }
  };

  const getDisplayedLanguages = () => {
    return getSortedLanguages().slice(0, maxDisplayed);
  };

  const getOtherLanguages = () => {
    const sorted = getSortedLanguages();
    if (sorted.length <= maxDisplayed) return null;
    
    const other = sorted.slice(maxDisplayed);
    const totalCount = other.reduce((sum, item) => sum + item.count, 0);
    const totalPercentage = other.reduce((sum, item) => sum + item.percentage, 0);
    
    return {
      language: `Other (${other.length})`,
      count: totalCount,
      percentage: totalPercentage,
      code: 'OT'
    };
  };

  const exportLanguages = () => {
    const csvContent = [
      'Language,Code,Publications,Percentage',
      ...languages.map(l => `${l.language},${l.code || ''},${l.count},${l.percentage}%`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'language-distribution.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const colorPalette = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#06B6D4", // cyan
    "#F97316", // orange
    "#84CC16", // lime
    "#EC4899", // pink
    "#6366F1", // indigo
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const displayedLanguages = getDisplayedLanguages();
  const otherLanguages = getOtherLanguages();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header with controls */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Language Distribution
              </h3>
              <p className="text-sm text-gray-500">
                Publications by language ({languages.length} languages)
              </p>
            </div>
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls and export */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy('count')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'count' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Count
            </button>
            <button
              onClick={() => setSortBy('alphabetical')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === 'alphabetical' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              A-Z
            </button>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showPercentages}
              onChange={(e) => setShowPercentages(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Show %
          </label>
        </div>

        <button
          onClick={exportLanguages}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Chart/Table View */}
      {viewMode === 'chart' ? (
        <div className="space-y-4">
          {displayedLanguages.map((item, index) => (
            <div key={`${item.language}-${index}`} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.language}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-mono">
                        {item.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                    {showPercentages && (
                      <span className="text-sm text-gray-500">({item.percentage}%)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500 ease-out group-hover:opacity-80"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: colorPalette[index % colorPalette.length],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Other languages summary */}
          {otherLanguages && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-400 shadow-sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {otherLanguages.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-700">{otherLanguages.count.toLocaleString()}</span>
                    {showPercentages && (
                      <span className="text-sm text-gray-500">({otherLanguages.percentage}%)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gray-400 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${otherLanguages.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publications
                </th>
                {showPercentages && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedLanguages.map((item, index) => (
                <tr key={`${item.language}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                      />
                      {item.language}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.count.toLocaleString()}
                  </td>
                  {showPercentages && (
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.percentage}%
                    </td>
                  )}
                </tr>
              ))}
              {otherLanguages && (
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      {otherLanguages.language}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {otherLanguages.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {otherLanguages.count.toLocaleString()}
                  </td>
                  {showPercentages && (
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {otherLanguages.percentage}%
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Show more/less toggle */}
      {languages.length > 6 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setMaxDisplayed(maxDisplayed === 6 ? languages.length : 6)}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            {maxDisplayed === 6 ? (
              <>
                <Eye className="h-4 w-4 inline mr-2" />
                Show All Languages
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 inline mr-2" />
                Show Less
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {languages.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No language data available</h3>
          <p className="text-sm text-gray-500">Add some bibliography entries to see language distribution.</p>
        </div>
      )}
    </div>
  );
}
