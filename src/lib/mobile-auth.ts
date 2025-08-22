import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import clientPromise from "./mongodb";
import { ObjectId } from "mongodb";

export interface MobileAuthResult {
  isAuthenticated: boolean;
  userId?: string;
  userRole?: string;
  error?: string;
}

export async function authenticateMobileRequest(
  request: NextRequest
): Promise<MobileAuthResult> {
  try {
    // First, try NextAuth session (for web app compatibility)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return {
        isAuthenticated: true,
        userId: session.user.id,
        userRole: session.user.role as string,
      };
    }

    // If no NextAuth session, try mobile token authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        isAuthenticated: false,
        error: "No valid authorization header",
      };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Connect to MongoDB and validate token (token is user ID)
    const client = await clientPromise;
    const db = client.db("test");
    const usersCollection = db.collection("users");

    // Convert string token to ObjectId for MongoDB query
    let objectId;
    try {
      objectId = new ObjectId(token);
    } catch (error) {
      return {
        isAuthenticated: false,
        error: "Invalid token format",
      };
    }

    const user = await usersCollection.findOne({ _id: objectId });

    if (!user || !user.is_active) {
      return {
        isAuthenticated: false,
        error: "Invalid or inactive token",
      };
    }

    return {
      isAuthenticated: true,
      userId: user._id.toString(),
      userRole: user.role,
    };
  } catch (error) {
    console.error("Mobile authentication error:", error);
    return {
      isAuthenticated: false,
      error: "Authentication failed",
    };
  }
}
