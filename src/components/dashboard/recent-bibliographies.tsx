"use client";

import { useState, useEffect } from "react";
import { BookOpen, Calendar, User } from "lucide-react";
import { Bibliography } from "@/types/bibliography";
import Link from "next/link";

type RecentBibliographiesProps = Record<string, never>;

export function RecentBibliographies({}: RecentBibliographiesProps) {
  const [recentItems, setRecentItems] = useState<Bibliography[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentBibliographies();
  }, []);

  const fetchRecentBibliographies = async () => {
    try {
      const response = await fetch(
        "/api/bibliography?page=1&limit=5&sortBy=created_at&sortOrder=desc"
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Bibliographies
          </h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Bibliographies
          </h3>
          <Link
            href="/bibliography"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            View all
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {recentItems.length > 0 ? (
          recentItems.map((item, index) => (
            <div key={`${item._id}-${index}`} className="px-6 py-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/bibliography/${item._id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                  >
                    {item.title}
                  </Link>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {item.author}
                    </div>
                    {item.year && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {item.year}
                      </div>
                    )}
                  </div>
                  {item.publication && (
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {item.publication}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No bibliographies yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first bibliography entry.
            </p>
            <div className="mt-6">
              <Link
                href="/bibliography/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Bibliography
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
