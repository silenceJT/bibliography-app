import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { BibliographyService } from "@/lib/bibliography";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bibliography = await BibliographyService.getBibliographyById(
      params.id
    );

    if (!bibliography) {
      return NextResponse.json(
        { error: "Bibliography not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bibliography);
  } catch (error) {
    console.error("Error fetching bibliography:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Logged in is not enough: standard users may only read
    const denied = await requirePermission("canUpdate");
    if (denied) return denied;

    const body = await request.json();

    // Basic validation
    if (!body.title || !body.author) {
      return NextResponse.json(
        { error: "Title and author are required" },
        { status: 400 }
      );
    }

    const bibliography = await BibliographyService.updateBibliography(
      params.id,
      body
    );

    if (!bibliography) {
      return NextResponse.json(
        { error: "Bibliography not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bibliography);
  } catch (error) {
    console.error("Error updating bibliography:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Logged in is not enough: standard users may only read
    const denied = await requirePermission("canDelete");
    if (denied) return denied;

    const success = await BibliographyService.deleteBibliography(params.id);

    if (!success) {
      return NextResponse.json(
        { error: "Bibliography not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Bibliography deleted successfully" });
  } catch (error) {
    console.error("Error deleting bibliography:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
