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

    // Extract filters from search params
    const filters = {
      year: searchParams.get("year") || undefined,
      language_published: searchParams.get("language_published") || undefined,
      language_researched: searchParams.get("language_researched") || undefined,
      country_of_research: searchParams.get("country_of_research") || undefined,
      keywords: searchParams.get("keywords") || undefined,
      source: searchParams.get("source") || undefined,
      language_family: searchParams.get("language_family") || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const csvData = await BibliographyService.exportToCSV(filters);

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="bibliography_export.csv"',
      },
    });
  } catch (error) {
    console.error("Error exporting bibliographies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
