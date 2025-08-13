"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Filter, RefreshCw } from "lucide-react";
import { ResearchInsights } from "@/components/reports/research-insights";
import {
  ReportSection,
  MetricCard,
  RankingCard,
  InfoCard,
} from "@/components/reports/report-section";
import { useReports } from "@/hooks/use-reports";
import { REPORT_TYPES, EXPORT_FORMATS } from "@/constants/reports";

export default function ReportsPage() {
  const {
    reportData,
    isLoading,
    error,
    activeReport,
    dateRange,
    generateReport,
    exportReport,
    updateDateRange,
    updateReportType,
    retry,
    hasData,
    canExport,
  } = useReports();

  const handleExport = async (format: "csv" | "pdf" | "json") => {
    try {
      await exportReport(format);
    } catch (err) {
      console.error("Export failed:", err);
      // TODO: Add toast notification
    }
  };

  const renderReportContent = () => {
    if (!hasData) return null;

    switch (activeReport) {
      case "temporal":
        return renderTemporalReport();
      case "geographic":
        return renderGeographicReport();
      case "language":
        return renderLanguageReport();
      case "publication":
        return renderPublicationReport();
      case "author":
        return renderAuthorReport();
      case "gaps":
        return renderGapsReport();
      default:
        return null;
    }
  };

  const renderTemporalReport = () => {
    if (!reportData?.temporalAnalysis) return null;
    const { yearlyTrends, monthlyPatterns, decadeAnalysis } =
      reportData.temporalAnalysis;

    return (
      <ReportSection
        title="Temporal Analysis"
        description="Publication trends and patterns over time"
      >
        {/* Yearly Trends */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Yearly Publication Trends
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {yearlyTrends.slice(-4).map((trend) => (
              <MetricCard
                key={trend.year}
                title={trend.year}
                value={trend.count}
                subtitle={`${trend.percentage}% of total`}
              />
            ))}
          </div>
        </div>

        {/* Monthly Patterns */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Publication Patterns
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {monthlyPatterns.map((month) => (
              <div key={month.month} className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {month.month}
                </div>
                <div className="text-lg font-bold text-indigo-600">
                  {month.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decade Analysis */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Decade Analysis
          </h3>
          <div className="space-y-3">
            {decadeAnalysis.map((decade) => (
              <div
                key={decade.decade}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {decade.decade}
                  </div>
                  <div className="text-sm text-gray-600">
                    {decade.dominantTopics.join(", ")}
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {decade.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  const renderGeographicReport = () => {
    if (!reportData?.geographicAnalysis) return null;
    const { countries, researchGaps } = reportData.geographicAnalysis;

    return (
      <ReportSection
        title="Geographic Distribution"
        description="Research distribution by country and region"
      >
        {/* Top Countries */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Research Countries
          </h3>
          <div className="space-y-3">
            {countries.slice(0, 10).map((country, index) => (
              <RankingCard
                key={country.country}
                rank={index + 1}
                title={country.country}
                subtitle={country.languages.join(", ")}
                value={country.count}
                secondaryValue={`${country.percentage}%`}
              />
            ))}
          </div>
        </div>

        {/* Research Gaps */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Research Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researchGaps.map((gap, index) => (
              <InfoCard
                key={index}
                title={`${gap.country} - ${gap.language}`}
                value={gap.opportunity}
                variant="warning"
              />
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  const renderLanguageReport = () => {
    if (!reportData?.languageAnalysis) return null;
    const { published, familyDistribution } = reportData.languageAnalysis;

    return (
      <ReportSection
        title="Language Analysis"
        description="Language patterns, families, and research gaps"
      >
        {/* Published Languages */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Publication Languages
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {published.slice(0, 8).map((lang) => (
              <MetricCard
                key={lang.language}
                title={lang.language}
                value={lang.count}
                subtitle={`${lang.percentage}%`}
                className="text-xs text-gray-500 mt-1"
              />
            ))}
          </div>
        </div>

        {/* Language Families */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Language Family Distribution
          </h3>
          <div className="space-y-3">
            {familyDistribution.map((family) => (
              <RankingCard
                key={family.family}
                rank={0}
                title={family.family}
                subtitle={family.languages.join(", ")}
                value={family.count}
                secondaryValue={`${family.percentage}%`}
              />
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  const renderPublicationReport = () => {
    if (!reportData?.publicationAnalysis) return null;
    const { sources, publishers } = reportData.publicationAnalysis;

    return (
      <ReportSection
        title="Publication Sources"
        description="Journal quality, publisher distribution, and impact analysis"
      >
        {/* Top Sources */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Publication Sources
          </h3>
          <div className="space-y-3">
            {sources.slice(0, 10).map((source, index) => (
              <RankingCard
                key={source.source}
                rank={index + 1}
                title={source.source}
                subtitle={`Quality: ${source.quality}`}
                value={source.count}
                secondaryValue={`${source.percentage}%`}
              />
            ))}
          </div>
        </div>

        {/* Publisher Analysis */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Publisher Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishers.slice(0, 6).map((publisher) => (
              <MetricCard
                key={publisher.publisher}
                title={publisher.publisher}
                value={publisher.count}
                subtitle={`Impact: ${publisher.impact}`}
              />
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  const renderAuthorReport = () => {
    if (!reportData?.authorAnalysis) return null;
    const { prolificAuthors, collaborationPatterns } =
      reportData.authorAnalysis;

    return (
      <ReportSection
        title="Author Networks"
        description="Collaboration patterns and influence analysis"
      >
        {/* Prolific Authors */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Most Prolific Authors
          </h3>
          <div className="space-y-3">
            {prolificAuthors.slice(0, 10).map((author, index) => (
              <RankingCard
                key={author.author}
                rank={index + 1}
                title={author.author}
                subtitle={author.publications.slice(0, 2).join(", ")}
                value={author.count}
                secondaryValue={author.years.slice(0, 3).join(", ")}
              />
            ))}
          </div>
        </div>

        {/* Collaboration Patterns */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Collaboration Patterns
          </h3>
          <div className="space-y-3">
            {collaborationPatterns.slice(0, 5).map((collab, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">
                  {collab.authors.join(" + ")}
                </div>
                <div className="text-2xl font-bold text-indigo-600 mt-2">
                  {collab.count}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {collab.publications.slice(0, 3).join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  const renderGapsReport = () => {
    if (!reportData?.researchGaps) return null;
    const { underResearched, emergingTopics, overResearched } =
      reportData.researchGaps;

    return (
      <ReportSection
        title="Research Gaps & Opportunities"
        description="Identify under-researched areas and emerging topics"
      >
        {/* Under-researched Areas */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Under-Researched Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {underResearched.map((area, index) => (
              <InfoCard
                key={index}
                title={area.area}
                value={area.count}
                description={area.opportunity}
                variant="success"
              />
            ))}
          </div>
        </div>

        {/* Emerging Topics */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Emerging Research Topics
          </h3>
          <div className="space-y-3">
            {emergingTopics.map((topic, index) => (
              <InfoCard
                key={index}
                title={topic.topic}
                value={`Growth: ${topic.growth}`}
                description={`Potential: ${topic.potential}`}
                variant="info"
              />
            ))}
          </div>
        </div>

        {/* Over-researched Areas */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Saturated Research Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overResearched.map((area, index) => (
              <InfoCard
                key={index}
                title={area.area}
                value={area.count}
                description={area.saturation}
                variant="danger"
              />
            ))}
          </div>
        </div>
      </ReportSection>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Research Reports
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive analysis of your bibliography database
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Generating..." : "Generate Report"}
            </button>
            <select
              value={activeReport}
              onChange={(e) => updateReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                updateDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                updateDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Report Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {REPORT_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = activeReport === type.id;
            return (
              <button
                key={type.id}
                onClick={() => updateReportType(type.id)}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`h-6 w-6 mb-2 mx-auto ${isActive ? "text-indigo-600" : "text-gray-500"}`}
                />
                <div className="text-sm font-medium">{type.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {type.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Export Controls */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Export Options
            </h3>
            <div className="flex gap-2">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={!canExport}
                  className={`px-4 py-2 bg-${format.color}-600 text-white rounded-lg hover:bg-${format.color}-700 disabled:opacity-50 transition-colors flex items-center gap-2`}
                >
                  {format.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating comprehensive report...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={retry}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : hasData ? (
          <div className="space-y-6">
            {/* Research Intelligence */}
            <ResearchInsights data={reportData!} />

            {/* Dynamic Report Content */}
            {renderReportContent()}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <div className="text-gray-400 mx-auto mb-4">📊</div>
            <p className="text-gray-600">
              Select a report type and generate your analysis
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
