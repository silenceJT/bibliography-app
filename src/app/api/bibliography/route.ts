import { NextRequest, NextResponse } from "next/server";
import { BibliographyService } from "@/lib/bibliography";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "_id";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    const result = await BibliographyService.getAllBibliographies(
      page,
      limit,
      sortBy,
      sortOrder
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching bibliographies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const bibliography = await BibliographyService.createBibliography(body);

    return NextResponse.json(bibliography, { status: 201 });
  } catch (error) {
    console.error("Error creating bibliography:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
