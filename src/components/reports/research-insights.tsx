"use client";

import { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
} from "lucide-react";
import { ReportData } from "@/types/reports";
import { INSIGHT_CATEGORIES, SORT_OPTIONS } from "@/constants/reports";

interface ResearchInsight {
  type: "trend" | "gap" | "opportunity" | "warning";
  title: string;
  description: string;
  confidence: number;
  dataPoints: string[];
  recommendations: string[];
  impact: "high" | "medium" | "low";
  category: string;
}

interface ResearchInsightsProps {
  data: ReportData;
}

export function ResearchInsights({ data }: ResearchInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"impact" | "confidence" | "type">(
    "impact"
  );

  // Don't render if data is not available
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Research Intelligence
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered insights and recommendations
          </p>
        </div>
        <div className="p-6 text-center text-gray-500">
          No data available. Please generate a report first.
        </div>
      </div>
    );
  }

  // Generate insights from the data
  const insights = generateInsights(data);

  // Ensure we have valid insights before proceeding
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">
            Research Intelligence
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered insights and recommendations
          </p>
        </div>
        <div className="p-6 text-center text-gray-500">
          No insights available for the current data. Try generating a different
          report type.
        </div>
      </div>
    );
  }

  const categories = INSIGHT_CATEGORIES;

  const filteredInsights =
    selectedCategory === "all"
      ? insights
      : insights.filter((insight) => insight.category === selectedCategory);

  const sortedInsights = [...filteredInsights].sort((a, b) => {
    switch (sortBy) {
      case "impact":
        return getImpactScore(b.impact) - getImpactScore(a.impact);
      case "confidence":
        return b.confidence - a.confidence;
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  function getImpactScore(impact: "high" | "medium" | "low"): number {
    switch (impact) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }

  function getInsightIcon(type: string) {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "gap":
        return <Target className="h-5 w-5 text-green-600" />;
      case "opportunity":
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  }

  function getInsightColor(type: string) {
    switch (type) {
      case "trend":
        return "border-blue-200 bg-blue-50";
      case "gap":
        return "border-green-200 bg-green-50";
      case "opportunity":
        return "border-yellow-200 bg-yellow-50";
      case "warning":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Research Intelligence
        </h2>
        <p className="text-gray-600 mt-1">
          AI-powered insights and recommendations
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all"
                    ? "All Categories"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "impact" | "confidence" | "type")
              }
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="impact">Impact</option>
              <option value="confidence">Confidence</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}
                      >
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === "high"
                            ? "bg-red-100 text-red-800"
                            : insight.impact === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {insight.impact} impact
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{insight.description}</p>

              {/* Data Points */}
              {insight.dataPoints.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Supporting Data:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {insight.dataPoints.map((point, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-white border border-gray-200 text-gray-700"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insight.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Recommendations:
                  </h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {insights.length}
              </div>
              <div className="text-sm text-gray-600">Total Insights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {insights.filter((i) => i.type === "opportunity").length}
              </div>
              <div className="text-sm text-gray-600">Opportunities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {insights.filter((i) => i.type === "gap").length}
              </div>
              <div className="text-sm text-gray-600">Research Gaps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {insights.filter((i) => i.impact === "high").length}
              </div>
              <div className="text-sm text-gray-600">High Impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateInsights(data: ReportData): ResearchInsight[] {
  const insights: ResearchInsight[] = [];

  // Temporal insights
  if (data.temporalAnalysis?.yearlyTrends?.length > 0) {
    const recentTrends = data.temporalAnalysis.yearlyTrends.slice(-3);
    const isGrowing = recentTrends.every(
      (trend, i) => i === 0 || trend.count >= recentTrends[i - 1].count
    );

    insights.push({
      type: isGrowing ? "trend" : "warning",
      title: isGrowing
        ? "Growing Research Interest"
        : "Declining Publication Trend",
      description: isGrowing
        ? "Your research area shows consistent growth in publications over the last 3 years, indicating strong academic interest and funding opportunities."
        : "Publication numbers are declining, suggesting potential saturation or shifting research priorities in your field.",
      confidence: 0.85,
      dataPoints: recentTrends.map((t) => `${t.year}: ${t.count} publications`),
      recommendations: isGrowing
        ? [
            "Consider expanding research scope",
            "Explore collaboration opportunities",
            "Apply for larger grants",
          ]
        : [
            "Diversify research topics",
            "Explore emerging subfields",
            "Consider interdisciplinary approaches",
          ],
      impact: "high",
      category: "temporal",
    });
  }

  // Geographic insights
  if (data.geographicAnalysis?.countries?.length > 0) {
    const topCountry = data.geographicAnalysis.countries[0];
    const researchGaps = data.geographicAnalysis.researchGaps || [];

    insights.push({
      type: "opportunity",
      title: "Geographic Research Opportunities",
      description: `Research is concentrated in ${topCountry.country} (${topCountry.percentage}%), but there are ${researchGaps.length} identified research gaps in other regions.`,
      confidence: 0.78,
      dataPoints: [
        `Top country: ${topCountry.country} (${topCountry.count} publications)`,
        `${researchGaps.length} research gaps identified`,
        "Opportunities in underrepresented regions",
      ],
      recommendations: [
        "Explore research opportunities in identified gap regions",
        "Consider international collaboration partnerships",
        "Apply for region-specific funding programs",
      ],
      impact: "medium",
      category: "geographic",
    });
  }

  // Language insights
  if (data.languageAnalysis?.published?.length > 0) {
    const dominantLanguage = data.languageAnalysis.published[0];
    const languageFamilies = data.languageAnalysis.familyDistribution || [];

    insights.push({
      type: "trend",
      title: "Language Distribution Analysis",
      description: `${dominantLanguage.language} dominates publications (${dominantLanguage.percentage}%), but there are opportunities in ${languageFamilies.length} language families.`,
      confidence: 0.82,
      dataPoints: [
        `Dominant language: ${dominantLanguage.language}`,
        `${languageFamilies.length} language families represented`,
        "Cross-linguistic research opportunities",
      ],
      recommendations: [
        "Consider research in underrepresented language families",
        "Explore cross-linguistic comparative studies",
        "Collaborate with speakers of minority languages",
      ],
      impact: "medium",
      category: "language",
    });
  }

  // Publication insights
  if (data.publicationAnalysis?.sources?.length > 0) {
    const highImpactSources = data.publicationAnalysis.sources.filter(
      (s) => s.quality === "High Impact"
    );
    const publishers = data.publicationAnalysis.publishers || [];

    insights.push({
      type: "opportunity",
      title: "Publication Strategy Insights",
      description: `${highImpactSources.length} high-impact sources identified, with ${publishers.length} major publishers. Focus on quality over quantity for maximum academic impact.`,
      confidence: 0.75,
      dataPoints: [
        `${highImpactSources.length} high-impact sources`,
        `${publishers.length} major publishers`,
        "Quality-focused publication strategy",
      ],
      recommendations: [
        "Prioritize high-impact journals for key findings",
        "Build relationships with major publishers",
        "Consider open-access options for broader reach",
      ],
      impact: "high",
      category: "publication",
    });
  }

  // Author insights
  if (data.authorAnalysis?.prolificAuthors?.length > 0) {
    const topAuthor = data.authorAnalysis.prolificAuthors[0];
    const collaborations = data.authorAnalysis.collaborationPatterns || [];

    insights.push({
      type: "trend",
      title: "Collaboration Network Analysis",
      description: `${topAuthor.author} leads with ${topAuthor.count} publications. ${collaborations.length} collaboration patterns identified, suggesting strong networking opportunities.`,
      confidence: 0.8,
      dataPoints: [
        `Top author: ${topAuthor.author} (${topAuthor.count} publications)`,
        `${collaborations.length} collaboration patterns`,
        "Strong author networks",
      ],
      recommendations: [
        "Reach out to prolific authors for collaboration",
        "Join existing research networks",
        "Attend conferences where top authors present",
      ],
      impact: "medium",
      category: "author",
    });
  }

  // Research gaps insights
  if (data.researchGaps?.underResearched?.length > 0) {
    const underResearched = data.researchGaps.underResearched;
    const emerging = data.researchGaps.emergingTopics || [];

    insights.push({
      type: "gap",
      title: "Research Gap Opportunities",
      description: `${underResearched.length} under-researched areas identified, plus ${emerging.length} emerging topics. These represent prime opportunities for groundbreaking research.`,
      confidence: 0.88,
      dataPoints: [
        `${underResearched.length} under-researched areas`,
        `${emerging.length} emerging topics`,
        "High potential for original contributions",
      ],
      recommendations: [
        "Focus research on identified gaps",
        "Develop expertise in emerging topics",
        "Apply for innovation grants",
        "Consider interdisciplinary approaches",
      ],
      impact: "high",
      category: "gaps",
    });
  }

  return insights;
}
