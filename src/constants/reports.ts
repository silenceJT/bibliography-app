import {
  Calendar,
  Globe,
  Languages,
  Users,
  TrendingUp,
  FileText,
} from "lucide-react";

export const REPORT_TYPES = [
  {
    id: "temporal",
    name: "Temporal Analysis",
    icon: Calendar,
    description: "Publication trends over time",
    color: "blue",
  },
  {
    id: "geographic",
    name: "Geographic Distribution",
    icon: Globe,
    description: "Research by country and region",
    color: "green",
  },
  {
    id: "language",
    name: "Language Analysis",
    icon: Languages,
    description: "Language patterns and gaps",
    color: "purple",
  },
  {
    id: "publication",
    name: "Publication Sources",
    icon: FileText,
    description: "Journal and publisher analysis",
    color: "indigo",
  },
  {
    id: "author",
    name: "Author Networks",
    icon: Users,
    description: "Collaboration and influence patterns",
    color: "orange",
  },
  {
    id: "gaps",
    name: "Research Gaps",
    icon: TrendingUp,
    description: "Opportunities and saturation analysis",
    color: "red",
  },
] as const;

export const EXPORT_FORMATS = [
  {
    id: "csv",
    name: "CSV",
    color: "green",
    description: "Data analysis and custom visualizations",
  },
  {
    id: "pdf",
    name: "PDF",
    color: "red",
    description: "Grant proposals and tenure packets",
  },
  {
    id: "json",
    name: "JSON",
    color: "blue",
    description: "API integration and custom tools",
  },
] as const;

export const DEFAULT_DATE_RANGE = {
  start: new Date(new Date().getFullYear() - 10, 0, 1)
    .toISOString()
    .split("T")[0],
  end: new Date().toISOString().split("T")[0],
};

export const INSIGHT_CATEGORIES = [
  "all",
  "temporal",
  "geographic",
  "language",
  "publication",
  "author",
  "gaps",
] as const;

export const SORT_OPTIONS = [
  { value: "impact", label: "Impact" },
  { value: "confidence", label: "Confidence" },
  { value: "type", label: "Type" },
] as const;
