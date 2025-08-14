import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/users";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Create user with default "standard" role
    const user = await UserService.createUser({
      name,
      email,
      password,
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
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
