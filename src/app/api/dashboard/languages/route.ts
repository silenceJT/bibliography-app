import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
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

    // Get language distribution
    const languages = await collection
      .aggregate([
        {
          $match: {
            language_published: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$language_published",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
        {
          $project: {
            language: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    // Calculate percentages
    const total = languages.reduce((sum, lang) => sum + lang.count, 0);
    const languagesWithPercentage = languages.map((lang) => ({
      ...lang,
      percentage: Math.round((lang.count / total) * 100),
    }));

    return NextResponse.json({ languages: languagesWithPercentage });
  } catch (error) {
    console.error("Error fetching language distribution:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
