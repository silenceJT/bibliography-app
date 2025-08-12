"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, User, ExternalLink, Plus, Clock, FileText } from "lucide-react";
import { Bibliography } from "@/types/bibliography";
import Link from "next/link";
import { getRelativeTimeFromObjectId } from "@/utils/objectid";

type RecentBibliographiesProps = Record<string, never>;

export function RecentBibliographies({}: RecentBibliographiesProps) {
  const [recentItems, setRecentItems] = useState<Bibliography[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchRecentBibliographies();
  }, []);

  const fetchRecentBibliographies = async () => {
    try {
      // Sort by ObjectId (which contains timestamp) in descending order to get most recent first
      const response = await fetch(
        "/api/bibliography?page=1&limit=10&sortBy=_id&sortOrder=desc"
      );
      if (response.ok) {
        const data = await response.json();
        setRecentItems(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching recent bibliographies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDisplayedItems = () => {
    return showAll ? recentItems : recentItems.slice(0, 5);
  };

  const getDisplayDate = (item: Bibliography) => {
    // Always use ObjectId extraction - it's more reliable and consistent
    return item._id ? getRelativeTimeFromObjectId(item._id) : 'Unknown date';
  };



  const getPublicationType = (publication?: string) => {
    if (!publication) return 'Unknown';
    const lower = publication.toLowerCase();
    if (lower.includes('journal') || lower.includes('j.')) return 'Journal';
    if (lower.includes('book') || lower.includes('b.')) return 'Book';
    if (lower.includes('conference') || lower.includes('proc.')) return 'Conference';
    if (lower.includes('thesis') || lower.includes('dissertation')) return 'Thesis';
    return 'Other';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                Latest bibliography entries and updates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/bibliography"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View All
            </Link>
            <Link
              href="/bibliography/new"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New
            </Link>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {getDisplayedItems().length > 0 ? (
          getDisplayedItems().map((item, index) => (
            <div key={`${item._id}-${index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-indigo-200 group-hover:to-blue-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/bibliography/${item._id}`}
                        className="text-base font-semibold text-gray-900 hover:text-indigo-600 truncate block group-hover:underline"
                      >
                        {item.title}
                      </Link>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{item.author}</span>
                        </div>
                        {item.year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{item.year}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{getDisplayDate(item)}</span>
                        </div>
                      </div>
                      
                      {item.publication && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getPublicationType(item.publication)}
                          </span>
                          <p className="text-sm text-gray-500 truncate">
                            {item.publication}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <Link
                        href={`/bibliography/${item._id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No bibliographies yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Get started by adding your first bibliography entry to begin building your research database.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/bibliography/new"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Bibliography
              </Link>
              <Link
                href="/bibliography/search"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Browse Examples
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Show more/less toggle */}
      {recentItems.length > 5 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {showAll ? 'Show Less' : `Show ${recentItems.length - 5} More`}
          </button>
        </div>
      )}
    </div>
  );
}
