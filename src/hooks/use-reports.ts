import { useState, useEffect, useCallback } from "react";
import { ReportData } from "@/types/reports";

interface UseReportsOptions {
  initialReportType?: string;
  initialDateRange?: { start: string; end: string };
}

export function useReports(options: UseReportsOptions = {}) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<string>(
    options.initialReportType || "temporal"
  );
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
    options.initialDateRange || {
      start: new Date(new Date().getFullYear() - 10, 0, 1)
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    }
  );

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateRange, reportType: activeReport }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const data = await response.json();

      // Validate that we have the expected data structure
      if (!data || typeof data !== "object") {
        throw new Error("Invalid report data received");
      }

      setReportData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, activeReport]);

  const exportReport = useCallback(
    async (format: "csv" | "pdf" | "json") => {
      if (!reportData) return;

      try {
        const { exportReport: exportReportUtil } = await import(
          "@/lib/report-export"
        );

        await exportReportUtil(reportData, {
          format,
          reportType: activeReport,
          dateRange,
          includeCharts: true,
          includeMetadata: true,
        });
      } catch (err) {
        console.error("Export failed:", err);
        throw err;
      }
    },
    [reportData, activeReport, dateRange]
  );

  const updateDateRange = useCallback(
    (newDateRange: { start: string; end: string }) => {
      setDateRange(newDateRange);
    },
    []
  );

  const updateReportType = useCallback((newReportType: string) => {
    setActiveReport(newReportType);
  }, []);

  const retry = useCallback(() => {
    generateReport();
  }, [generateReport]);

  // Auto-generate report when dependencies change
  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return {
    // State
    reportData,
    isLoading,
    error,
    activeReport,
    dateRange,

    // Actions
    generateReport,
    exportReport,
    updateDateRange,
    updateReportType,
    retry,

    // Computed
    hasData: reportData && Object.keys(reportData).length > 0,
    canExport: reportData && !isLoading,
  };
}
