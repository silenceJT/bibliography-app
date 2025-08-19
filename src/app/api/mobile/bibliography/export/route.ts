import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { createMobileResponse } from "@/lib/mobile-utils";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json or csv
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Extract filters from search params
    const filters: Record<string, any> = {};
    const filterKeys = [
      "year",
      "publication",
      "publisher",
      "language_published",
      "language_researched",
      "country_of_research",
      "keywords",
      "biblio_name",
      "source",
      "language_family",
    ];

    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value && value.trim()) {
        filters[key] = value.trim();
      }
    });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Build query
    let query: Record<string, any> = {};

    // Add specific field filters
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        query[key] = { $regex: filters[key], $options: "i" };
      }
    });

    // Get bibliographies
    const bibliographies = await collection.find(query).limit(limit).toArray();

    if (format === "csv") {
      // Generate CSV
      const csvHeaders = [
        "Title",
        "Author",
        "Year",
        "Publication",
        "Publisher",
        "Language Published",
        "Language Researched",
        "Country of Research",
        "Keywords",
        "Source",
        "Language Family",
        "Created At",
      ];

      const csvRows = bibliographies.map((bib) => [
        bib.title || "",
        bib.author || "",
        bib.year || "",
        bib.publication || "",
        bib.publisher || "",
        bib.language_published || "",
        bib.language_researched || "",
        bib.country_of_research || "",
        bib.keywords || "",
        bib.source || "",
        bib.language_family || "",
        bib.created_at ? new Date(bib.created_at).toISOString() : "",
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition":
            'attachment; filename="bibliography_export.csv"',
        },
      });
    } else {
      // Return JSON
      return NextResponse.json(
        createMobileResponse(true, {
          count: bibliographies.length,
          filters,
          format: "json",
          data: bibliographies,
        })
      );
    }
  } catch (error) {
    console.error("Error exporting bibliographies:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
