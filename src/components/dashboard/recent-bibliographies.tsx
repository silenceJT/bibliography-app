"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { BibliographyCard } from "@/components/ui/bibliography-card";
import { Bibliography } from "@/types/bibliography";

interface RecentBibliographiesProps {
  data: Bibliography[] | null | undefined;
}

export function RecentBibliographies({ data }: RecentBibliographiesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  const displayedItems = isExpanded ? data : data.slice(0, 5);
  const hasMoreItems = data.length > 5;

  return (
    <>
      {data.length === 0 ? (
        <div className="text-center py-8">
          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No recent entries
          </h3>
          <p className="text-sm text-gray-500">
            Add your first bibliography entry to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedItems.map((item) => (
            <BibliographyCard
              key={item._id}
              item={item}
              variant="search-result"
              className="hover:shadow-sm"
            />
          ))}

          {hasMoreItems && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View all {data.length} entries
                  </>
                )}
              </button>
            </div>
          )}

          {/* Always show link to bibliography page for full search */}
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/bibliography"
              className="text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              Go to Bibliography Search →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
