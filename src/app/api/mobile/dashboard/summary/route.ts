import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import {
  formatBibliographyForMobile,
  createMobileResponse,
} from "@/lib/mobile-utils";

export async function GET() {
  try {
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

    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Fetch dashboard data
    const pipeline = [
      {
        $facet: {
          // Total records
          totalRecords: [{ $count: "count" }],

          // This year records
          thisYear: [
            { $match: { year: new Date().getFullYear().toString() } },
            { $count: "count" },
          ],

          // Language distribution (top 10)
          languages: [
            { $match: { language_published: { $exists: true, $ne: "" } } },
            { $group: { _id: "$language_published", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { language: "$_id", count: 1, _id: 0 } },
          ],

          // Unique counts
          uniqueLanguages: [
            { $group: { _id: "$language_published" } },
            { $match: { _id: { $exists: true, $ne: "" } } },
            { $count: "count" },
          ],

          uniqueCountries: [
            { $group: { _id: "$country_of_research" } },
            { $match: { _id: { $exists: true, $ne: "" } } },
            { $count: "count" },
          ],

          // Recent items
          recentItems: [{ $sort: { _id: -1 } }, { $limit: 10 }],
        },
      },
    ];

    const [result] = await collection.aggregate(pipeline).toArray();

    // Process results
    const totalRecords = result.totalRecords[0]?.count || 0;
    const thisYear = result.thisYear[0]?.count || 0;
    const languages = result.languages || [];
    const uniqueLanguages = result.uniqueLanguages[0]?.count || 0;
    const uniqueCountries = result.uniqueCountries[0]?.count || 0;
    const recentItems = result.recentItems || [];

    // Calculate language percentages
    const totalLangCount = languages.reduce(
      (sum: number, lang: { count: number }) => sum + lang.count,
      0
    );
    const languagesWithPercentage = languages.map(
      (lang: { language: string; count: number }) => ({
        ...lang,
        percentage:
          totalLangCount > 0
            ? Math.round((lang.count / totalLangCount) * 100)
            : 0,
      })
    );

    // Format recent items for mobile with consistent date formatting
    const formattedRecentItems = recentItems.map(formatBibliographyForMobile);

    return NextResponse.json(
      createMobileResponse(true, {
        stats: {
          totalRecords,
          thisYear,
          languages: uniqueLanguages,
          countries: uniqueCountries,
        },
        languages: languagesWithPercentage,
        recentItems: formattedRecentItems,
      })
    );
  } catch (error) {
    console.error("Mobile dashboard summary error:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
