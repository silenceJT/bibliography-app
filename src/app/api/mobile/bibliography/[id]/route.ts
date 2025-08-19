import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
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
    const rawBibliography = await collection.findOne({ _id: new ObjectId(id) });

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Basic validation
    if (!body.title || !body.author) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Title and author are required"),
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Check if bibliography exists
    const existingBibliography = await collection.findOne({ _id: id });
    if (!existingBibliography) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Bibliography not found"),
        { status: 404 }
      );
    }

    // Update the bibliography
    const updateData = {
      ...body,
      updated_at: new Date(),
      updated_by: session.user.id,
    };

    const result = await collection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to update bibliography"),
        { status: 500 }
      );
    }

    // Fetch the updated bibliography
    const updatedBibliography = await collection.findOne({ _id: id });
    const formattedBibliography =
      formatBibliographyForMobile(updatedBibliography);

    return NextResponse.json(
      createMobileResponse(true, formattedBibliography, undefined)
    );
  } catch (error) {
    console.error("Error updating bibliography:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    const { id } = params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Check if bibliography exists
    const existingBibliography = await collection.findOne({ _id: id });
    if (!existingBibliography) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Bibliography not found"),
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive instead of removing
    const result = await collection.updateOne(
      { _id: id },
      {
        $set: {
          is_active: false,
          deleted_at: new Date(),
          deleted_by: session.user.id,
        },
      }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to delete bibliography"),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createMobileResponse(
        true,
        { message: "Bibliography deleted successfully" },
        undefined
      )
    );
  } catch (error) {
    console.error("Error deleting bibliography:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
