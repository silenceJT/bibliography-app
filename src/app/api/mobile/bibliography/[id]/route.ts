import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import {
  formatBibliographyForMobile,
  createMobileResponse,
} from "@/lib/mobile-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Find bibliography by ID
    const rawBibliography = await collection.findOne({ _id: id });

    if (!rawBibliography) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Bibliography not found"),
        { status: 404 }
      );
    }

    // Format bibliography for mobile with consistent date formatting
    const bibliography = formatBibliographyForMobile(rawBibliography);

    return NextResponse.json(createMobileResponse(true, bibliography));
  } catch (error) {
    console.error("Mobile bibliography detail error:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
