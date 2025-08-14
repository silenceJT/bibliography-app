"use client";

import { BookOpen, Calendar, Globe, Languages, Building } from "lucide-react";
import Link from "next/link";
import { Bibliography } from "@/types/bibliography";

interface BibliographyCardProps {
  item: Bibliography;
  variant?: "detailed" | "search-result";
  className?: string;
}

export function BibliographyCard({
  item,
  variant = "detailed",
  className = "",
}: BibliographyCardProps) {
  // BRUTAL: Extract only the essential data we need with type safety
  const {
    _id,
    title,
    author,
    year,
    publication,
    language_published,
    language_researched,
    publisher,
  } = item;

  // BRUTAL: Handle type mismatches gracefully
  const safePublication = publication || "";

  // BRUTAL: Smart publication type detection with clear visual hierarchy
  const getPublicationType = (pub: string) => {
    if (!pub)
      return {
        text: "Unknown",
        color: "bg-gray-100 text-gray-700",
        icon: "📄",
      };

    const lower = pub.toLowerCase();
    if (
      lower.includes("journal") ||
      lower.includes("j.") ||
      lower.includes("journal of")
    )
      return {
        text: "Journal",
        color: "bg-blue-100 text-blue-800",
        icon: "📰",
      };
    if (
      lower.includes("book") ||
      lower.includes("b.") ||
      lower.includes("handbook")
    )
      return { text: "Book", color: "bg-green-100 text-green-800", icon: "📚" };
    if (
      lower.includes("conference") ||
      lower.includes("proc.") ||
      lower.includes("proceedings")
    )
      return {
        text: "Conference",
        color: "bg-purple-100 text-purple-800",
        icon: "🎤",
      };
    if (
      lower.includes("thesis") ||
      lower.includes("dissertation") ||
      lower.includes("phd")
    )
      return {
        text: "Thesis",
        color: "bg-orange-100 text-orange-800",
        icon: "🎓",
      };
    if (lower.includes("report") || lower.includes("working paper"))
      return { text: "Report", color: "bg-red-100 text-red-800", icon: "📋" };

    return { text: "Other", color: "bg-gray-100 text-gray-700", icon: "📄" };
  };

  const pubType = getPublicationType(safePublication);

  // BRUTAL: Search result variant - optimized for scanning multiple results
  if (variant === "search-result") {
    return (
      <div
        onClick={() => (window.location.href = `/bibliography/${_id}`)}
        className={`group bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-5 cursor-pointer ${className}`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Publication Type */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-tight">
                {title}
              </h3>
              <span
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${pubType.color}`}
              >
                <span>{pubType.icon}</span>
                {pubType.text}
              </span>
            </div>

            {/* Author and Year - BRUTAL: Prominent placement */}
            <p className="text-sm text-gray-700 mb-3">
              by <span className="font-medium">{author}</span> •{" "}
              <span className="font-medium">{year}</span>
            </p>

            {/* Key Details Grid - BRUTAL: Organized for quick scanning */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {publication && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{publication}</span>
                </div>
              )}
              {publisher && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{publisher}</span>
                </div>
              )}
              {language_published && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>Published in {language_published}</span>
                </div>
              )}
              {language_researched && (
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-gray-400" />
                  <span>Research: {language_researched}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BRUTAL: Detailed variant - full information display
  return (
    <Link href={`/bibliography/${_id}`} className="block">
      <div
        className={`group bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-200 p-6 ${className}`}
      >
        <div className="flex items-start gap-5">
          {/* Icon with publication type */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-200 transition-all duration-200">
              <BookOpen className="h-7 w-7 text-indigo-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with title and publication type */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-tight">
                {title}
              </h3>
              <span
                className={`flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full ${pubType.color}`}
              >
                <span>{pubType.icon}</span>
                {pubType.text}
              </span>
            </div>

            {/* Author and Year - BRUTAL: Large, prominent display */}
            <div className="mb-4">
              <p className="text-lg text-gray-700">
                by <span className="font-semibold text-gray-900">{author}</span>
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-lg font-medium text-gray-700">
                  {year}
                </span>
              </div>
            </div>

            {/* Detailed Information Grid - BRUTAL: Organized in logical groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Publication Details */}
              {publication && (
                <div className="flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Publication</span>
                    <p className="text-gray-900 font-medium">{publication}</p>
                  </div>
                </div>
              )}

              {publisher && (
                <div className="flex items-start gap-3">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Publisher</span>
                    <p className="text-gray-900 font-medium">{publisher}</p>
                  </div>
                </div>
              )}

              {/* Language Information */}
              {language_published && (
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Language Published</span>
                    <p className="text-gray-900 font-medium">
                      {language_published}
                    </p>
                  </div>
                </div>
              )}

              {language_researched && (
                <div className="flex items-start gap-3">
                  <Languages className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Language Researched</span>
                    <p className="text-gray-900 font-medium">
                      {language_researched}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action indicator */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Click to view details
                </span>
                <div className="w-2 h-2 bg-indigo-400 rounded-full group-hover:bg-indigo-600 transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
