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

    // Get publication trends by year
    const trends = await collection
      .aggregate([
        {
          $match: {
            year: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            year: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ trends });
  } catch (error) {
    console.error("Error fetching publication trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
