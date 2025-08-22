import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  formatBibliographyForMobile,
  createMobileResponse,
} from "@/lib/mobile-utils";
import { authenticateMobileRequest } from "@/lib/mobile-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Find bibliography by ID and ensure it's not deleted
    const rawBibliography = await collection.findOne({
      _id: new ObjectId(id),
      $and: [
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
      ],
    });

    if (!rawBibliography) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "Bibliography not found or has been deleted"
        ),
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
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
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

    // Check if bibliography exists and is not deleted
    const existingBibliography = await collection.findOne({
      _id: new ObjectId(id),
      $and: [
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
      ],
    });
    if (!existingBibliography) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "Bibliography not found or has been deleted"
        ),
        { status: 404 }
      );
    }

    // Update the bibliography
    const updateData = {
      ...body,
      updated_at: new Date(),
      updated_by: authResult.userId,
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to update bibliography"),
        { status: 500 }
      );
    }

    // Fetch the updated bibliography (ensure it's not deleted)
    const updatedBibliography = await collection.findOne({
      _id: new ObjectId(id),
      $and: [
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
      ],
    });
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
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("biblio_200419");

    // Check if bibliography exists and is not already deleted
    const existingBibliography = await collection.findOne({
      _id: new ObjectId(id),
      $and: [
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
      ],
    });
    if (!existingBibliography) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "Bibliography not found or has already been deleted"
        ),
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive instead of removing
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          is_active: false,
          deleted_at: new Date(),
          deleted_by: authResult.userId,
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
