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
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all"; // all, suggestions, autocomplete
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query.trim()) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Search query is required"),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    let results: any[] = [];

    switch (type) {
      case "suggestions":
        // Get search suggestions based on query
        results = await getSearchSuggestions(collection, query, limit);
        break;

      case "autocomplete":
        // Get autocomplete suggestions
        results = await getAutocompleteSuggestions(collection, query, limit);
        break;

      case "all":
      default:
        // Get comprehensive search results
        results = await getComprehensiveSearch(collection, query, limit);
        break;
    }

    return NextResponse.json(
      createMobileResponse(true, {
        query,
        type,
        results,
        count: results.length,
        suggestions: await getFieldSuggestions(collection, query),
      })
    );
  } catch (error) {
    console.error("Error in mobile search:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}

async function getSearchSuggestions(
  collection: any,
  query: string,
  limit: number
) {
  const pipeline = [
    {
      $search: {
        index: "default",
        autocomplete: {
          query,
          path: "title",
          fuzzy: {
            maxEdits: 1,
            prefixLength: 1,
          },
        },
      },
    },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
        author: 1,
        year: 1,
        publication: 1,
        relevance: { $meta: "searchScore" },
      },
    },
  ];

  try {
    return await collection.aggregate(pipeline).toArray();
  } catch (error) {
    // Fallback to regex search if search index is not available
    return await collection
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
        ],
      })
      .limit(limit)
      .toArray();
  }
}

async function getAutocompleteSuggestions(
  collection: any,
  query: string,
  limit: number
) {
  const suggestions = new Set<string>();

  // Get title suggestions
  const titleResults = await collection
    .find({ title: { $regex: `^${query}`, $options: "i" } })
    .limit(Math.ceil(limit / 3))
    .toArray();

  titleResults.forEach((item: any) => {
    if (item.title) {
      suggestions.add(item.title.substring(0, 50));
    }
  });

  // Get author suggestions
  const authorResults = await collection
    .find({ author: { $regex: `^${query}`, $options: "i" } })
    .limit(Math.ceil(limit / 3))
    .toArray();

  authorResults.forEach((item: any) => {
    if (item.author) {
      suggestions.add(item.author.substring(0, 50));
    }
  });

  // Get publication suggestions
  const publicationResults = await collection
    .find({ publication: { $regex: `^${query}`, $options: "i" } })
    .limit(Math.ceil(limit / 3))
    .toArray();

  publicationResults.forEach((item: any) => {
    if (item.publication) {
      suggestions.add(item.publication.substring(0, 50));
    }
  });

  return Array.from(suggestions).slice(0, limit);
}

async function getComprehensiveSearch(
  collection: any,
  query: string,
  limit: number
) {
  const pipeline = [
    {
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          { keywords: { $regex: query, $options: "i" } },
          { publication: { $regex: query, $options: "i" } },
          { biblio_name: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $addFields: {
        relevance: {
          $add: [
            {
              $cond: [
                {
                  $regexMatch: { input: "$title", regex: query, options: "i" },
                },
                10,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: { input: "$author", regex: query, options: "i" },
                },
                8,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$keywords",
                    regex: query,
                    options: "i",
                  },
                },
                6,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$publication",
                    regex: query,
                    options: "i",
                  },
                },
                4,
                0,
              ],
            },
          ],
        },
      },
    },
    { $sort: { relevance: -1, _id: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
        author: 1,
        year: 1,
        publication: 1,
        publisher: 1,
        language_published: 1,
        country_of_research: 1,
        relevance: 1,
      },
    },
  ];

  return await collection.aggregate(pipeline).toArray();
}

async function getFieldSuggestions(collection: any, query: string) {
  const suggestions: Record<string, string[]> = {
    languages: [],
    countries: [],
    publications: [],
    years: [],
  };

  try {
    // Language suggestions
    const languageResults = await collection
      .find({ language_published: { $regex: query, $options: "i" } })
      .limit(5)
      .toArray();
    suggestions.languages = [
      ...new Set(
        languageResults
          .map((item: any) => item.language_published)
          .filter(Boolean)
      ),
    ];

    // Country suggestions
    const countryResults = await collection
      .find({ country_of_research: { $regex: query, $options: "i" } })
      .limit(5)
      .toArray();
    suggestions.countries = [
      ...new Set(
        countryResults
          .map((item: any) => item.country_of_research)
          .filter(Boolean)
      ),
    ];

    // Publication suggestions
    const publicationResults = await collection
      .find({ publication: { $regex: query, $options: "i" } })
      .limit(5)
      .toArray();
    suggestions.publications = [
      ...new Set(
        publicationResults.map((item: any) => item.publication).filter(Boolean)
      ),
    ];

    // Year suggestions
    const yearResults = await collection
      .find({ year: { $regex: query, $options: "i" } })
      .limit(5)
      .toArray();
    suggestions.years = [
      ...new Set(yearResults.map((item: any) => item.year).filter(Boolean)),
    ];
  } catch (error) {
    console.error("Error getting field suggestions:", error);
  }

  return suggestions;
}
