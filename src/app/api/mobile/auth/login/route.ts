import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { compare } from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("Mobile login attempt for email:", email);

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

    console.log(
      "User found:",
      user ? "Yes" : "No",
      "User data:",
      user
        ? { _id: user._id, email: user.email, name: user.name, role: user.role }
        : "None"
    );

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

    // Return clean JSON for mobile with token
    const responseData = {
      success: true,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences || {},
        statistics: user.statistics || {},
      },
      token: user._id.toString(), // Simple token for mobile (you might want to use JWT here)
      message: "Login successful",
    };

    console.log("Sending response:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
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
