import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { createMobileResponse } from "@/lib/mobile-utils";

interface ReportRequest {
  dateRange: { start: string; end: string };
  reportType:
    | "temporal"
    | "geographic"
    | "language"
    | "publication"
    | "author"
    | "gaps";
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    const { dateRange, reportType }: ReportRequest = await request.json();
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Parse date range
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Build aggregation pipeline based on report type
    const pipeline: Array<Record<string, any>> = [
      {
        $match: {
          year: {
            $gte: startDate.getFullYear().toString(),
            $lte: endDate.getFullYear().toString(),
          },
        },
      },
    ];

    let reportData: Record<string, any> = {};

    switch (reportType) {
      case "temporal":
        reportData = await generateTemporalReport(db, pipeline);
        break;
      case "geographic":
        reportData = await generateGeographicReport(db, pipeline);
        break;
      case "language":
        reportData = await generateLanguageReport(db, pipeline);
        break;
      case "publication":
        reportData = await generatePublicationReport(db, pipeline);
        break;
      case "author":
        reportData = await generateAuthorReport(db, pipeline);
        break;
      case "gaps":
        reportData = await generateResearchGapsReport(db, pipeline);
        break;
      default:
        return NextResponse.json(
          createMobileResponse(false, undefined, "Invalid report type"),
          { status: 400 }
        );
    }

    return NextResponse.json(
      createMobileResponse(true, {
        reportType,
        dateRange,
        data: reportData,
        generatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Failed to generate report"),
      { status: 500 }
    );
  }
}

async function generateTemporalReport(db: any, basePipeline: any[]) {
  const yearlyPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$year",
        count: { $sum: 1 },
        publications: { $addToSet: "$publication" },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const result = await db
    .collection("biblio_200419")
    .aggregate(yearlyPipeline)
    .toArray();

  return {
    yearlyTrends: result.map((item: any) => ({
      year: item._id,
      count: item.count,
      uniquePublications: item.publications.length,
    })),
  };
}

async function generateGeographicReport(db: any, basePipeline: any[]) {
  const countryPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$country_of_research",
        count: { $sum: 1 },
        languages: { $addToSet: "$language_researched" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  const result = await db
    .collection("biblio_200419")
    .aggregate(countryPipeline)
    .toArray();

  return {
    countries: result.map((item: any) => ({
      country: item._id || "Unknown",
      count: item.count,
      languages: item.languages.filter((lang: string) => lang),
    })),
  };
}

async function generateLanguageReport(db: any, basePipeline: any[]) {
  const languagePipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$language_published",
        count: { $sum: 1 },
        countries: { $addToSet: "$country_of_research" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ];

  const result = await db
    .collection("biblio_200419")
    .aggregate(languagePipeline)
    .toArray();

  return {
    languages: result.map((item: any) => ({
      language: item._id || "Unknown",
      count: item.count,
      countries: item.countries.filter((country: string) => country),
    })),
  };
}

async function generatePublicationReport(db: any, basePipeline: any[]) {
  const publicationPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$publication",
        count: { $sum: 1 },
        years: { $addToSet: "$year" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ];

  const result = await db
    .collection("biblio_200419")
    .aggregate(publicationPipeline)
    .toArray();

  return {
    publications: result.map((item: any) => ({
      publication: item._id || "Unknown",
      count: item.count,
      years: item.years.filter((year: string) => year),
    })),
  };
}

async function generateAuthorReport(db: any, basePipeline: any[]) {
  const authorPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$author",
        count: { $sum: 1 },
        publications: { $addToSet: "$publication" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 25 },
  ];

  const result = await db
    .collection("biblio_200419")
    .aggregate(authorPipeline)
    .toArray();

  return {
    authors: result.map((item: any) => ({
      author: item._id || "Unknown",
      count: item.count,
      publications: item.publications.filter((pub: string) => pub),
    })),
  };
}

async function generateResearchGapsReport(db: any, basePipeline: any[]) {
  // Find years with low research activity
  const yearActivityPipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$year",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const yearResult = await db
    .collection("biblio_200419")
    .aggregate(yearActivityPipeline)
    .toArray();

  // Find underrepresented languages
  const languagePipeline = [
    ...basePipeline,
    {
      $group: {
        _id: "$language_published",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: 1 } },
    { $limit: 10 },
  ];

  const languageResult = await db
    .collection("biblio_200419")
    .aggregate(languagePipeline)
    .toArray();

  return {
    lowActivityYears: yearResult
      .filter((item: any) => item.count < 5)
      .map((item: any) => ({
        year: item._id,
        count: item.count,
      })),
    underrepresentedLanguages: languageResult.map((item: any) => ({
      language: item._id || "Unknown",
      count: item.count,
    })),
  };
}
