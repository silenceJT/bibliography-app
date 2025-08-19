import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { createMobileResponse } from "@/lib/mobile-utils";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    // Check if user has permission to view users
    const client = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({ _id: session.user.id });
    if (!currentUser || !["admin", "super_admin"].includes(currentUser.role)) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const isActive = searchParams.get("is_active");

    // Build query
    const query: Record<string, any> = {};

    if (role) {
      query.role = role;
    }

    if (isActive !== null) {
      query.is_active = isActive === "true";
    }

    // Get total count
    const totalCount = await usersCollection.countDocuments(query);

    // Get paginated results
    const skip = (page - 1) * limit;
    const users = await usersCollection
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 })
      .toArray();

    // Remove sensitive information
    const safeUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      statistics: user.statistics || {},
      roleChangedBy: user.roleChangedBy,
      roleChangedAt: user.roleChangedAt,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    return NextResponse.json(
      createMobileResponse(true, {
        users: safeUsers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Not authenticated"),
        { status: 401 }
      );
    }

    // Check if user has permission to create users
    const client = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    const currentUser = await usersCollection.findOne({ _id: session.user.id });
    if (!currentUser || currentUser.role !== "super_admin") {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Insufficient permissions"),
        { status: 403 }
      );
    }

    const body = await request.json();

    // Basic validation
    if (!body.email || !body.name || !body.role) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "Email, name, and role are required"
        ),
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "User with this email already exists"
        ),
        { status: 409 }
      );
    }

    // Create user data
    const userData = {
      ...body,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: session.user.id,
      statistics: {
        bibliographies_created: 0,
        last_login: null,
      },
    };

    // Insert the user
    const result = await usersCollection.insertOne(userData);

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to create user"),
        { status: 500 }
      );
    }

    // Fetch the created user
    const createdUser = await usersCollection.findOne({
      _id: result.insertedId,
    });
    const safeUser = {
      _id: createdUser._id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
      is_active: createdUser.is_active,
      statistics: createdUser.statistics,
      created_at: createdUser.created_at,
      updated_at: createdUser.updated_at,
    };

    return NextResponse.json(createMobileResponse(true, safeUser, undefined), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
