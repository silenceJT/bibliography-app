import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  formatBibliographyForMobile,
  createMobileResponse,
} from "@/lib/mobile-utils";
import { authenticateMobileRequest } from "@/lib/mobile-auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication using mobile auth utility
    const authResult = await authenticateMobileRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          authResult.error || "Not authenticated"
        ),
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
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
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
    const query: Record<string, any> = {};

    // CRITICAL: Filter out soft-deleted items by default
    // Only show active items (not deleted)
    query.$and = [
      {
        $or: [
          { is_active: { $ne: false } }, // is_active is not false
          { is_active: { $exists: false } }, // is_active field doesn't exist (legacy items)
        ],
      },
      {
        $or: [
          { deleted_at: { $exists: false } }, // deleted_at field doesn't exist
          { deleted_at: null }, // deleted_at is null
        ],
      },
    ];

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
      // Convert year to integer for exact match
      const yearInt = parseInt(year);
      if (!isNaN(yearInt)) {
        query.year = yearInt;
      }
    } else if (yearFrom || yearTo) {
      // Handle year range queries
      const yearRange: Record<string, number> = {};

      if (yearFrom) {
        const yearFromInt = parseInt(yearFrom);
        if (!isNaN(yearFromInt)) {
          yearRange.$gte = yearFromInt;
        }
      }

      if (yearTo) {
        const yearToInt = parseInt(yearTo);
        if (!isNaN(yearToInt)) {
          yearRange.$lte = yearToInt;
        }
      }

      if (Object.keys(yearRange).length > 0) {
        query.year = yearRange;
      }
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
        yearFrom: yearFrom || null,
        yearTo: yearTo || null,
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication using mobile auth utility
    const authResult = await authenticateMobileRequest(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          authResult.error || "Not authenticated"
        ),
        { status: 401 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.author) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Title and author are required"),
        { status: 400 }
      );
    }

    // Convert year to integer if provided
    if (body.year && typeof body.year === "string") {
      const yearInt = parseInt(body.year);
      if (!isNaN(yearInt)) {
        body.year = yearInt;
      } else {
        return NextResponse.json(
          createMobileResponse(false, undefined, "Year must be a valid number"),
          { status: 400 }
        );
      }
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Add metadata
    const bibliographyData = {
      ...body,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: authResult.userId,
    };

    // Insert the bibliography
    const result = await collection.insertOne(bibliographyData);

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to create bibliography"),
        { status: 500 }
      );
    }

    // Fetch the created bibliography
    const createdBibliography = await collection.findOne({
      _id: result.insertedId,
    });
    const formattedBibliography =
      formatBibliographyForMobile(createdBibliography);

    return NextResponse.json(
      createMobileResponse(true, formattedBibliography, undefined),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bibliography:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
