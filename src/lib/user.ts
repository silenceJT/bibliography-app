import clientPromise from "./mongodb";
import { User, UserCreate, UserUpdate, UserProfile } from "@/types/user";
import { ObjectId } from "mongodb";

export class UserService {
  static async createUser(userData: UserCreate): Promise<User> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    const result = await collection.insertOne(userData);

    if (!result.acknowledged) {
      throw new Error("Failed to create user");
    }

    return { ...userData, _id: result.insertedId.toString() } as User;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    const user = await collection.findOne({ email });

    if (!user) return null;

    return { ...user, _id: user._id.toString() } as User;
  }

  static async getUserById(id: string): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      const user = await collection.findOne({ _id: new ObjectId(id) });

      if (!user) return null;

      return { ...user, _id: user._id.toString() } as User;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }

  static async updateUser(
    id: string,
    updateData: UserUpdate
  ): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result.value) return null;

      return { ...result.value, _id: result.value._id.toString() } as User;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  static async updateUserPreferences(
    id: string,
    preferences: Partial<User["preferences"]>
  ): Promise<User | null> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            preferences: preferences,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result.value) return null;

      return { ...result.value, _id: result.value._id.toString() } as User;
    } catch (error) {
      console.error("Error updating user preferences:", error);
      return null;
    }
  }

  static async updateLastLogin(id: string): Promise<void> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            "statistics.lastLogin": new Date(),
            updatedAt: new Date(),
          },
        }
      );
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  static async incrementBibliographyCount(id: string): Promise<void> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $inc: { "statistics.totalBibliographies": 1 },
          $set: { updatedAt: new Date() },
        }
      );
    } catch (error) {
      console.error("Error incrementing bibliography count:", error);
    }
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      const users = await collection.find({}).toArray();

      return users.map((user: any) => ({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
        preferences: user.preferences,
        statistics: user.statistics,
      }));
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db("test");
    const collection = db.collection("users");

    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}
