import clientPromise from "./mongodb";
import { hash } from "bcryptjs";
import { User, UserCreate, UserUpdate } from "@/types/user";
import { ObjectId } from "mongodb";

export class UserService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db("test");
    return db.collection("users");
  }

  static async createUser(userData: UserCreate): Promise<User> {
    const collection = await this.getCollection();

    // Check if user already exists
    const existingUser = await collection.findOne({
      email: userData.email.toLowerCase(),
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    const newUser: UserCreate = {
      ...userData,
      password: hashedPassword,
      email: userData.email.toLowerCase(),
      is_active: true,
    };

    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ email: email.toLowerCase() });
    return user ? { ...user, _id: user._id.toString() } : null;
  }

  static async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return user ? { ...user, _id: user._id.toString() } : null;
  }

  static async updateUser(
    id: string,
    updates: UserUpdate
  ): Promise<User | null> {
    const collection = await this.getCollection();

    if (updates.password) {
      updates.password = await hash(updates.password, 12);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    return result.value
      ? { ...result.value, _id: result.value._id.toString() }
      : null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async getAllUsers(): Promise<User[]> {
    const collection = await this.getCollection();
    const users = await collection.find({}).toArray();
    return users.map((user) => ({ ...user, _id: user._id.toString() }));
  }

  static async updateLastLogin(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { last_login: new Date() } }
    );
  }
}
