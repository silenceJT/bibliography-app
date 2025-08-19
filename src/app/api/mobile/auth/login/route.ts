import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { UserService } from "@/lib/user";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB and authenticate user
    const client = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Get additional user data
    const dbUser = await UserService.getUserByEmail(user.email);

    // Return clean JSON for mobile
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: dbUser?.preferences,
        statistics: dbUser?.statistics,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
