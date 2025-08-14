import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/users";
import { ROLE_PERMISSIONS } from "@/types/user";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to view users
    const user = await UserService.getUserById(session.user.id);
    if (!user || !ROLE_PERMISSIONS[user.role].canManageUsers) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const targetUser = await UserService.getUserById(params.id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information
    const { password: _, ...safeUser } = targetUser;

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to manage users
    const user = await UserService.getUserById(session.user.id);
    if (!user || !ROLE_PERMISSIONS[user.role].canManageUsers) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, name, email, is_active } = body;

    // Only allow updating specific fields
    const updates: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (is_active !== undefined) updates.is_active = is_active;

    // Handle role changes
    if (role !== undefined) {
      try {
        const updatedUser = await UserService.changeUserRole(
          params.id,
          role,
          session.user.id
        );
        return NextResponse.json({ user: updatedUser });
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(
          { error: "Failed to change user role" },
          { status: 500 }
        );
      }
    }

    // Update other fields
    const updatedUser = await UserService.updateUser(
      params.id,
      updates,
      session.user.id
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: _, ...safeUser } = updatedUser;

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete users
    const user = await UserService.getUserById(session.user.id);
    if (!user || !ROLE_PERMISSIONS[user.role].canDeleteUsers) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prevent deleting own account
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const success = await UserService.deactivateUser(
      params.id,
      session.user.id
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to deactivate user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
