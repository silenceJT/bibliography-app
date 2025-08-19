import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import {
  formatBibliographyForMobile,
  createMobileResponse,
} from "@/lib/mobile-utils";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("q") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Advanced search parameters
    const year = searchParams.get("year");
    const languagePublished = searchParams.get("language_published");
    const languageResearched = searchParams.get("language_researched");
    const countryOfResearch = searchParams.get("country_of_research");
    const keywords = searchParams.get("keywords");
    const source = searchParams.get("source");
    const languageFamily = searchParams.get("language_family");
    const publication = searchParams.get("publication");
    const publisher = searchParams.get("publisher");
    const biblioName = searchParams.get("biblio_name");

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Build comprehensive search query
    let query: any = {};

    // Text search across multiple fields
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
        { publication: { $regex: search, $options: "i" } },
        { biblio_name: { $regex: search, $options: "i" } },
      ];
    }

    // Add specific field filters
    if (year) {
      query.year = year;
    }

    if (languagePublished) {
      query.language_published = { $regex: languagePublished, $options: "i" };
    }

    if (languageResearched) {
      query.language_researched = { $regex: languageResearched, $options: "i" };
    }

    if (countryOfResearch) {
      query.country_of_research = { $regex: countryOfResearch, $options: "i" };
    }

    if (keywords) {
      query.keywords = { $regex: keywords, $options: "i" };
    }

    if (source) {
      query.source = { $regex: source, $options: "i" };
    }

    if (languageFamily) {
      query.language_family = { $regex: languageFamily, $options: "i" };
    }

    if (publication) {
      query.publication = { $regex: publication, $options: "i" };
    }

    if (publisher) {
      query.publisher = { $regex: publisher, $options: "i" };
    }

    if (biblioName) {
      query.biblio_name = { $regex: biblioName, $options: "i" };
    }

    // Get total count
    const totalCount = await collection.countDocuments(query);

    // Build sort object
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get paginated results
    const skip = (page - 1) * limit;
    const rawBibliographies = await collection
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortObj)
      .toArray();

    // Format bibliographies for mobile with consistent date formatting
    const bibliographies = rawBibliographies.map(formatBibliographyForMobile);

    // Build search metadata
    const searchMetadata = {
      query: search || null,
      filters: {
        year: year || null,
        languagePublished: languagePublished || null,
        languageResearched: languageResearched || null,
        countryOfResearch: countryOfResearch || null,
        keywords: keywords || null,
        source: source || null,
        languageFamily: languageFamily || null,
        publication: publication || null,
        publisher: publisher || null,
        biblioName: biblioName || null,
      },
      sortBy,
      sortOrder,
    };

    return NextResponse.json(
      createMobileResponse(true, {
        bibliographies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1,
        },
        search: searchMetadata,
      })
    );
  } catch (error) {
    console.error("Mobile bibliography error:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
