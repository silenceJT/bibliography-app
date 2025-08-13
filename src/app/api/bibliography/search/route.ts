import { NextRequest, NextResponse } from "next/server";
import { BibliographyService } from "@/lib/bibliography";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Extract and clean filters - only include non-empty values
    const filters: Record<string, string> = {};
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

    const result = await BibliographyService.searchBibliographies(
      query,
      filters,
      page,
      limit
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching bibliographies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
