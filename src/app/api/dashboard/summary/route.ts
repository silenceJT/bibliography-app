import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // BRUTAL: Fetch full Bibliography objects for consistent card display
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

          // Recent items - BRUTAL: Return full Bibliography objects
          recentItems: [
            { $sort: { _id: -1 } },
            { $limit: 10 },
            // No projection - return all fields for full Bibliography objects
          ],
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

    return NextResponse.json({
      stats: {
        totalRecords,
        thisYear,
        languages: uniqueLanguages,
        countries: uniqueCountries,
      },
      languages: languagesWithPercentage,
      recentItems,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
