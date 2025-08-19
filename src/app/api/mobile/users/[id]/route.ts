import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { createMobileResponse } from "@/lib/mobile-utils";

export async function GET(
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

    // Get user by ID
    const user = await usersCollection.findOne({ _id: id });

    if (!user) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "User not found"),
        { status: 404 }
      );
    }

    // Remove sensitive information
    const safeUser = {
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
    };

    return NextResponse.json(createMobileResponse(true, safeUser));
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Check if user has permission to update users
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

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: id });
    if (!existingUser) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "User not found"),
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date(),
      updated_by: session.user.id,
    };

    // Only allow updating specific fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // If role is being changed, track the change
    if (body.role && body.role !== existingUser.role) {
      updateData.roleChangedBy = session.user.id;
      updateData.roleChangedAt = new Date();
    }

    // Update the user
    const result = await usersCollection.updateOne(
      { _id: id },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "Failed to update user"),
        { status: 500 }
      );
    }

    // Fetch the updated user
    const updatedUser = await usersCollection.findOne({ _id: id });
    const safeUser = {
      _id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      is_active: updatedUser.is_active,
      statistics: updatedUser.statistics || {},
      roleChangedBy: updatedUser.roleChangedBy,
      roleChangedAt: updatedUser.roleChangedAt,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };

    return NextResponse.json(createMobileResponse(true, safeUser, undefined));
  } catch (error) {
    console.error("Error updating user:", error);
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

    // Check if user has permission to delete users
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

    // Check if user exists
    const existingUser = await usersCollection.findOne({ _id: id });
    if (!existingUser) {
      return NextResponse.json(
        createMobileResponse(false, undefined, "User not found"),
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        createMobileResponse(
          false,
          undefined,
          "Cannot delete your own account"
        ),
        { status: 400 }
      );
    }

    // Soft delete - mark as inactive
    const result = await usersCollection.updateOne(
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
        createMobileResponse(false, undefined, "Failed to delete user"),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createMobileResponse(
        true,
        { message: "User deactivated successfully" },
        undefined
      )
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      createMobileResponse(false, undefined, "Internal server error"),
      { status: 500 }
    );
  }
}
