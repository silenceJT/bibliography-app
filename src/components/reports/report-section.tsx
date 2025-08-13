"use client";

import { ReactNode } from "react";

interface ReportSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

export function ReportSection({
  title,
  description,
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
    >
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  className = "",
}: MetricCardProps) {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
      <div className="text-2xl font-bold text-indigo-600">{value}</div>
      <div className="font-medium text-gray-900">{title}</div>
      {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    </div>
  );
}

interface RankingCardProps {
  rank: number;
  title: string;
  subtitle?: string;
  value: string | number;
  secondaryValue?: string;
}

export function RankingCard({
  rank,
  title,
  subtitle,
  value,
  secondaryValue,
}: RankingCardProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
          {rank}
        </div>
        <div>
          <div className="font-medium text-gray-900">{title}</div>
          {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-indigo-600">{value}</div>
        {secondaryValue && (
          <div className="text-sm text-gray-500">{secondaryValue}</div>
        )}
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  variant?: "success" | "warning" | "info" | "danger";
  className?: string;
}

export function InfoCard({
  title,
  value,
  description,
  variant = "info",
  className = "",
}: InfoCardProps) {
  const variantStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    danger: "bg-orange-50 border-orange-200 text-orange-800",
  };

  const variantColors = {
    success: "text-green-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
    danger: "text-orange-600",
  };

  return (
    <div
      className={`p-4 border rounded-lg ${variantStyles[variant]} ${className}`}
    >
      <div className="font-medium">{title}</div>
      <div className={`text-2xl font-bold mt-2 ${variantColors[variant]}`}>
        {value}
      </div>
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  );
}
