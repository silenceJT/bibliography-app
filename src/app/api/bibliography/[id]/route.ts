import { NextRequest, NextResponse } from "next/server";
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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
