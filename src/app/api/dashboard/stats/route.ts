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

    // Get total records
    const totalRecords = await collection.countDocuments();

    // Get records from this year
    const currentYear = new Date().getFullYear().toString();
    const thisYear = await collection.countDocuments({
      year: currentYear,
    });

    // Get unique languages
    const languages = await collection.distinct("language_published");
    const languageCount = languages.filter(
      (lang) => lang && typeof lang === "string" && lang.trim() !== ""
    ).length;

    // Get unique countries
    const countries = await collection.distinct("country_of_research");
    const countryCount = countries.filter(
      (country) =>
        country && typeof country === "string" && country.trim() !== ""
    ).length;

    return NextResponse.json({
      totalRecords,
      thisYear,
      languages: languageCount,
      countries: countryCount,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
