"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  BookOpen,
  User,
  Calendar,
  Globe,
  Building,
  ExternalLink,
  Hash,
  Tag,
  Database,
  BookMarked,
} from "lucide-react";
import { Bibliography } from "@/types/bibliography";

interface BibliographyFormProps {
  mode: "create" | "edit";
  initialData?: Bibliography;
  bibliographyId?: string;
}

interface FormData {
  author: string;
  year: string;
  title: string;
  publication: string;
  publisher: string;
  biblio_name: string;
  language_published: string;
  language_researched: string;
  country_of_research: string;
  keywords: string;
  isbn: string;
  issn: string;
  url: string;
  date_of_entry: string;
  language_family: string;
  source: string;
}

const yearOptions = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);
const commonLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Urdu",
  "Turkish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
];
const languageFamilies = [
  "Indo-European",
  "Sino-Tibetan",
  "Afro-Asiatic",
  "Niger-Congo",
  "Austronesian",
  "Uralic",
  "Altaic",
  "Dravidian",
  "Austroasiatic",
  "Tai-Kadai",
  "Japonic",
  "Koreanic",
  "Other",
];

export default function BibliographyForm({
  mode,
  initialData,
  bibliographyId,
}: BibliographyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    author: "",
    year: "",
    title: "",
    publication: "",
    publisher: "",
    biblio_name: "",
    language_published: "",
    language_researched: "",
    country_of_research: "",
    keywords: "",
    isbn: "",
    issn: "",
    url: "",
    date_of_entry: "",
    language_family: "",
    source: "",
  });

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        author: initialData.author || "",
        year: initialData.year || "",
        title: initialData.title || "",
        publication: initialData.publication || "",
        publisher: initialData.publisher || "",
        biblio_name: initialData.biblio_name || "",
        language_published: initialData.language_published || "",
        language_researched: initialData.language_researched || "",
        country_of_research: initialData.country_of_research || "",
        keywords: initialData.keywords || "",
        isbn: initialData.isbn || "",
        issn: initialData.issn || "",
        url: initialData.url || "",
        date_of_entry: initialData.date_of_entry || "",
        language_family: initialData.language_family || "",
        source: initialData.source || "",
      });
    }
  }, [mode, initialData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url =
        mode === "create"
          ? "/api/bibliography"
          : `/api/bibliography/${bibliographyId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (mode === "create") {
          router.push(`/bibliography/${result._id}`);
        } else {
          router.push(`/bibliography/${bibliographyId}`);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to save bibliography"}`);
      }
    } catch (error) {
      console.error("Error saving bibliography:", error);
      alert("An error occurred while saving the bibliography");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      const submitButton = document.querySelector(
        'button[type="submit"]'
      ) as HTMLButtonElement;
      if (submitButton) submitButton.click();
    }
  };

  const isFormValid =
    formData.title.trim() && formData.author.trim() && formData.year;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* BRUTAL: Clear navigation and context */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === "create" ? "Add New Entry" : "Edit Entry"}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === "create"
              ? "Create a new bibliography entry with precision"
              : "Update your bibliography entry"}
          </p>
        </div>
      </div>

      {/* BRUTAL: Main form with visual hierarchy */}
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Entry Details</h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Core Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Core Information
            </h3>
            <div className="space-y-6">
              {/* Title - Most important field */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="h-4 w-4 text-indigo-600" /> Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter the full title of the work"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                  required
                />
              </div>

              {/* Author and Year row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 text-indigo-600" /> Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      handleInputChange("author", e.target.value)
                    }
                    placeholder="Author name(s)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 text-indigo-600" /> Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select year</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Publication Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Publication Details
            </h3>
            <div className="space-y-6">
              {/* Publication Source - Full row */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4 text-indigo-600" /> Publication
                  Source
                </label>
                <input
                  type="text"
                  value={formData.publication}
                  onChange={(e) =>
                    handleInputChange("publication", e.target.value)
                  }
                  placeholder="Journal name, conference, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Publisher - Full row */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building className="h-4 w-4 text-indigo-600" /> Publisher
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) =>
                    handleInputChange("publisher", e.target.value)
                  }
                  placeholder="Publisher name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Bibliography Name - Full row */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookMarked className="h-4 w-4 text-indigo-600" />{" "}
                  Bibliography Name
                </label>
                <input
                  type="text"
                  value={formData.biblio_name}
                  onChange={(e) =>
                    handleInputChange("biblio_name", e.target.value)
                  }
                  placeholder="Name of bibliography collection"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Source - Multi-line textarea */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Database className="h-4 w-4 text-indigo-600" /> Source
                </label>
                <textarea
                  value={formData.source}
                  onChange={(e) => handleInputChange("source", e.target.value)}
                  placeholder="Data source (database, library, etc.)"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Language Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Language Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-indigo-600" /> Language
                    Published
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.language_published}
                      onChange={(e) =>
                        handleInputChange("language_published", e.target.value)
                      }
                      placeholder="Language of publication"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      list="languages"
                    />
                    <datalist id="languages">
                      {commonLanguages.map((lang) => (
                        <option key={lang} value={lang} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-indigo-600" /> Language
                    Researched
                  </label>
                  <input
                    type="text"
                    value={formData.language_researched}
                    onChange={(e) =>
                      handleInputChange("language_researched", e.target.value)
                    }
                    placeholder="Language being researched"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-indigo-600" /> Language
                    Family
                  </label>
                  <select
                    value={formData.language_family}
                    onChange={(e) =>
                      handleInputChange("language_family", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select language family</option>
                    {languageFamilies.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Geographic Information
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Globe className="h-4 w-4 text-indigo-600" /> Country of
                    Research
                  </label>
                  <input
                    type="text"
                    value={formData.country_of_research}
                    onChange={(e) =>
                      handleInputChange("country_of_research", e.target.value)
                    }
                    placeholder="Country where research was conducted"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 text-indigo-600" /> Date of
                    Entry
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_entry}
                    onChange={(e) =>
                      handleInputChange("date_of_entry", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Identifiers and Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Identifiers & Links
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4 text-indigo-600" /> ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange("isbn", e.target.value)}
                    placeholder="International Standard Book Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Hash className="h-4 w-4 text-indigo-600" /> ISSN
                  </label>
                  <input
                    type="text"
                    value={formData.issn}
                    onChange={(e) => handleInputChange("issn", e.target.value)}
                    placeholder="International Standard Serial Number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ExternalLink className="h-4 w-4 text-indigo-600" /> URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Keywords & Tags
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4 text-indigo-600" /> Keywords
              </label>
              <textarea
                value={formData.keywords}
                onChange={(e) => handleInputChange("keywords", e.target.value)}
                placeholder="Enter keywords separated by commas"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* BRUTAL: Clear action buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {mode === "create" ? "Create Entry" : "Update Entry"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* BRUTAL: Helpful tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Include the full title for better searchability</li>
          <li>
            • Specify the language even if it&apos;s English for consistency
          </li>
          <li>
            • Add country of research if it differs from publication location
          </li>
          <li>
            • Press Ctrl+Enter (Cmd+Enter on Mac) to quickly submit the form
          </li>
          <li>• Use keywords to make your entries more discoverable</li>
          <li>
            • Include ISBN/ISSN for better identification of books and journals
          </li>
        </ul>
      </div>
    </div>
  );
}
