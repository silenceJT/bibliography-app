import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserService } from "@/lib/users";
import { ROLE_PERMISSIONS } from "@/types/user";

export async function GET(request: NextRequest) {
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

    const users = await UserService.getActiveUsers();

    // Remove sensitive information
    const safeUsers = users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      statistics: user.statistics,
      roleChangedBy: user.roleChangedBy,
      roleChangedAt: user.roleChangedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create users
    const user = await UserService.getUserById(session.user.id);
    if (!user || !ROLE_PERMISSIONS[user.role].canManageUsers) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !["standard", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only super admins can create admin or super admin users
    if (
      role &&
      ["admin", "super_admin"].includes(role) &&
      user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Only super admins can create admin or super admin users" },
        { status: 403 }
      );
    }

    const newUser = await UserService.createUser(
      {
        name,
        email,
        password,
        role: role || "standard",
        preferences: {
          language: "en",
          timezone: "UTC",
          notifications: {
            email: true,
            browser: false,
          },
        },
        statistics: {
          totalBibliographies: 0,
          lastLogin: new Date(),
          createdAt: new Date(),
        },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session.user.id
    );

    // Remove password from response
    const { password: _, ...safeUser } = newUser;

    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
