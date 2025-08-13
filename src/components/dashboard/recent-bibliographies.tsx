"use client";

import { BookOpen, User, Clock, FileText } from "lucide-react";
import Link from "next/link";
// No imports needed for timestamp handling

interface RecentBibliographiesProps {
  data:
    | Array<{
        _id: string;
        title: string;
        author: string;
        year: string;
        publication: string;
        language_published: string;
        created_at?: Date;
      }>
    | null
    | undefined;
}

export function RecentBibliographies({ data }: RecentBibliographiesProps) {
  if (!data) return null;

  const getDisplayDate = (item: { created_at?: Date | string; _id?: string }) => {
    if (item.created_at) {
      const date = new Date(item.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    }
    
    // BRUTAL: Fallback to ObjectId timestamp if created_at is missing
    if (item._id && item._id.length >= 8) {
      try {
        const timestampHex = item._id.substring(0, 8);
        const timestamp = parseInt(timestampHex, 16);
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
      } catch (error) {
        // Fall through to "Unknown date"
      }
    }
    
    return "Unknown date";
  };

  const getTypeBadge = (publication?: string) => {
    if (!publication)
      return { text: "Other", color: "bg-gray-100 text-gray-800" };
    const lower = publication.toLowerCase();
    if (lower.includes("journal") || lower.includes("j."))
      return { text: "Journal", color: "bg-blue-100 text-blue-800" };
    if (lower.includes("book") || lower.includes("b."))
      return { text: "Book", color: "bg-green-100 text-green-800" };
    if (lower.includes("conference") || lower.includes("proc."))
      return { text: "Conference", color: "bg-purple-100 text-purple-800" };
    if (lower.includes("thesis") || lower.includes("dissertation"))
      return { text: "Thesis", color: "bg-orange-100 text-orange-800" };
    return { text: "Other", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
              <p className="text-sm text-gray-500">
                Latest bibliography entries
              </p>
            </div>
          </div>
          <Link
            href="/bibliography"
            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No recent entries
            </h3>
            <p className="text-sm text-gray-500">
              Add your first bibliography entry to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.slice(0, 5).map((item) => (
              <Link
                key={item._id}
                href={`/bibliography/${item._id}`}
                className="block"
              >
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group cursor-pointer">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getDisplayDate(item)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(item.publication).color}`}
                        >
                          {getTypeBadge(item.publication).text}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>{item.year}</span>
                      <span>{item.language_published}</span>
                      <span className="truncate">{item.publication}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {data.length > 5 && (
              <div className="pt-2 border-t border-gray-100">
                <Link
                  href="/bibliography"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View all {data.length} entries →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
