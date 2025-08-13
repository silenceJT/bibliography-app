export interface ReportData {
  temporalAnalysis: TemporalAnalysis;
  geographicAnalysis: GeographicAnalysis;
  languageAnalysis: LanguageAnalysis;
  publicationAnalysis: PublicationAnalysis;
  authorAnalysis: AuthorAnalysis;
  researchGaps: ResearchGaps;
}

export interface TemporalAnalysis {
  yearlyTrends: YearlyTrend[];
  monthlyPatterns: MonthlyPattern[];
  decadeAnalysis: DecadeAnalysis[];
}

export interface YearlyTrend {
  year: string;
  count: number;
  percentage: number;
}

export interface MonthlyPattern {
  month: string;
  count: number;
}

export interface DecadeAnalysis {
  decade: string;
  count: number;
  dominantTopics: string[];
}

export interface GeographicAnalysis {
  countries: CountryData[];
  regions: RegionData[];
  researchGaps: ResearchOpportunity[];
}

export interface CountryData {
  country: string;
  count: number;
  percentage: number;
  languages: string[];
}

export interface RegionData {
  region: string;
  count: number;
  percentage: number;
}

export interface ResearchOpportunity {
  country: string;
  language: string;
  opportunity: string;
}

export interface LanguageAnalysis {
  published: PublishedLanguage[];
  researched: ResearchedLanguage[];
  familyDistribution: LanguageFamily[];
}

export interface PublishedLanguage {
  language: string;
  count: number;
  percentage: number;
  countries: string[];
}

export interface ResearchedLanguage {
  language: string;
  count: number;
  percentage: number;
  publications: string[];
}

export interface LanguageFamily {
  family: string;
  count: number;
  percentage: number;
  languages: string[];
}

export interface PublicationAnalysis {
  sources: PublicationSource[];
  publishers: PublisherData[];
  journals: JournalData[];
}

export interface PublicationSource {
  source: string;
  count: number;
  percentage: number;
  quality: string;
}

export interface PublisherData {
  publisher: string;
  count: number;
  percentage: number;
  impact: string;
}

export interface JournalData {
  journal: string;
  count: number;
  impact: string;
  language: string;
}

export interface AuthorAnalysis {
  prolificAuthors: ProlificAuthor[];
  collaborationPatterns: CollaborationPattern[];
  authorNetworks: AuthorNetwork[];
}

export interface ProlificAuthor {
  author: string;
  count: number;
  publications: string[];
  years: string[];
}

export interface CollaborationPattern {
  authors: string[];
  count: number;
  publications: string[];
}

export interface AuthorNetwork {
  author: string;
  connections: number;
  influence: string;
}

export interface ResearchGaps {
  underResearched: UnderResearchedArea[];
  overResearched: OverResearchedArea[];
  emergingTopics: EmergingTopic[];
}

export interface UnderResearchedArea {
  area: string;
  count: number;
  opportunity: string;
  relatedWorks: string[];
}

export interface OverResearchedArea {
  area: string;
  count: number;
  saturation: string;
  alternatives: string[];
}

export interface EmergingTopic {
  topic: string;
  growth: string;
  publications: string[];
  potential: string;
}

// Report generation request
export interface ReportRequest {
  reportType: keyof ReportData;
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    languages?: string[];
    countries?: string[];
    authors?: string[];
    sources?: string[];
  };
  includeCharts?: boolean;
  includeMetadata?: boolean;
}

// Report metadata
export interface ReportMetadata {
  id: string;
  type: keyof ReportData;
  generatedAt: Date;
  dateRange: {
    start: string;
    end: string;
  };
  filters: Record<string, any>;
  totalRecords: number;
  version: string;
}

// Export options
export interface ExportOptions {
  format: "csv" | "pdf" | "json";
  includeCharts: boolean;
  includeMetadata: boolean;
  includeRawData: boolean;
  customStyling?: boolean;
}

// Report summary for dashboard
export interface ReportSummary {
  totalReports: number;
  lastGenerated: Date;
  mostPopularType: keyof ReportData;
  recentReports: Array<{
    type: keyof ReportData;
    generatedAt: Date;
    recordCount: number;
  }>;
}

// Research insights derived from reports
export interface ResearchInsight {
  type: "trend" | "gap" | "opportunity" | "warning";
  title: string;
  description: string;
  confidence: number; // 0-1
  dataPoints: string[];
  recommendations: string[];
  impact: "high" | "medium" | "low";
}

// Comparative analysis between time periods
export interface ComparativeAnalysis {
  period1: {
    start: string;
    end: string;
    data: Partial<ReportData>;
  };
  period2: {
    start: string;
    end: string;
    data: Partial<ReportData>;
  };
  changes: {
    metric: string;
    period1Value: number;
    period2Value: number;
    change: number;
    percentageChange: number;
    significance: "high" | "medium" | "low";
  }[];
}
