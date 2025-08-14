"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { usePermissions } from "@/hooks/use-permissions";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Globe,
  Building,
  FileText,
  BookOpen,
  Plus,
  ExternalLink,
  Hash,
  Tag,
  Database,
  BookMarked,
} from "lucide-react";
import Link from "next/link";
import { Bibliography } from "@/types/bibliography";

export default function BibliographyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = usePermissions();
  const [bibliography, setBibliography] = useState<Bibliography | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBibliography = async () => {
      try {
        const response = await fetch(`/api/bibliography/${id}`);
        if (!response.ok) {
          throw new Error("Bibliography not found");
        }
        const data = await response.json();
        setBibliography(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load bibliography"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBibliography();
  }, [id]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bibliography/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bibliography");
      }

      router.push("/bibliography");
    } catch (error) {
      console.error("Error deleting bibliography:", error);
      alert("Failed to delete bibliography. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString?: string | Date) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bibliography entry...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !bibliography) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Entry Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              {error ||
                "The bibliography entry you're looking for doesn't exist."}
            </p>
            <Link
              href="/bibliography"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Back to Bibliography
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* BRUTAL: Clear navigation and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/bibliography"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bibliography Entry
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage entry details
              </p>
            </div>
          </div>

          {/* Only show edit/delete buttons if user has permissions */}
          {(can.update || can.delete) && (
            <div className="flex gap-3">
              {can.update && (
                <Link
                  href={`/bibliography/${id}/edit`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              )}
              {can.delete && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* BRUTAL: Main content with visual hierarchy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with type badge */}
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeBadge(bibliography.publication).color}`}
                  >
                    {getTypeBadge(bibliography.publication).text}
                  </span>
                  {bibliography.created_at && (
                    <span className="text-sm text-gray-500">
                      Added {formatDate(bibliography.created_at)}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {bibliography.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Details grid - Core Information */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Core Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Author */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-indigo-600" />
                  Author
                </label>
                <p className="text-lg text-gray-900">{bibliography.author}</p>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Year
                </label>
                <p className="text-lg text-gray-900">{bibliography.year}</p>
              </div>

              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Title
                </label>
                <p className="text-lg text-gray-900">{bibliography.title}</p>
              </div>
            </div>

            {/* Publication Details */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Publication Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Publication */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4 text-indigo-600" />
                  Publication Source
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.publication || "Not specified"}
                </p>
              </div>

              {/* Publisher */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4 text-indigo-600" />
                  Publisher
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.publisher || "Not specified"}
                </p>
              </div>

              {/* Biblio Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookMarked className="h-4 w-4 text-indigo-600" />
                  Bibliography Name
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.biblio_name || "Not specified"}
                </p>
              </div>

              {/* Source */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Database className="h-4 w-4 text-indigo-600" />
                  Source
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.source || "Not specified"}
                </p>
              </div>
            </div>

            {/* Language Information */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Language Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Language Published */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  Language Published
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.language_published || "Not specified"}
                </p>
              </div>

              {/* Language Researched */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  Language Researched
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.language_researched || "Not specified"}
                </p>
              </div>

              {/* Language Family */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  Language Family
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.language_family || "Not specified"}
                </p>
              </div>
            </div>

            {/* Geographic Information */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Geographic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Country of Research */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  Country of Research
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.country_of_research || "Not specified"}
                </p>
              </div>

              {/* Date of Entry */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Date of Entry
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.date_of_entry || "Not specified"}
                </p>
              </div>
            </div>

            {/* Identifiers and Links */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Identifiers & Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* ISBN */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Hash className="h-4 w-4 text-indigo-600" />
                  ISBN
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.isbn || "Not specified"}
                </p>
              </div>

              {/* ISSN */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Hash className="h-4 w-4 text-indigo-600" />
                  ISSN
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.issn || "Not specified"}
                </p>
              </div>

              {/* URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ExternalLink className="h-4 w-4 text-indigo-600" />
                  URL
                </label>
                {bibliography.url ? (
                  <a
                    href={bibliography.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-indigo-600 hover:text-indigo-800 break-all"
                  >
                    {bibliography.url}
                  </a>
                ) : (
                  <p className="text-lg text-gray-900">Not specified</p>
                )}
              </div>
            </div>

            {/* Keywords */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Keywords & Tags
            </h3>
            <div className="mb-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="h-4 w-4 text-indigo-600" />
                  Keywords
                </label>
                <p className="text-lg text-gray-900">
                  {bibliography.keywords || "Not specified"}
                </p>
              </div>
            </div>

            {/* Metadata - System Fields */}
            {(bibliography.created_at || bibliography.updated_at) && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  {bibliography.created_at && (
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDateTime(bibliography.created_at)}
                    </div>
                  )}
                  {bibliography.updated_at && (
                    <div>
                      <span className="font-medium">Last updated:</span>{" "}
                      {formatDateTime(bibliography.updated_at)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BRUTAL: Quick actions - Only show if user has permissions */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            {can.create && (
              <Link
                href="/bibliography/new"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Entry
              </Link>
            )}
            <Link
              href="/bibliography"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View All Entries
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
