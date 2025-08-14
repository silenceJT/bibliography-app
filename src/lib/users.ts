import clientPromise from "./mongodb";
import { hash } from "bcryptjs";
import {
  User,
  UserCreate,
  UserUpdate,
  UserRole,
  ROLE_PERMISSIONS,
} from "@/types/user";
import { ObjectId } from "mongodb";

export class UserService {
  private static async getCollection() {
    const client = await clientPromise;
    const db = client.db("test");
    return db.collection("users");
  }

  static async createUser(
    userData: UserCreate,
    createdBy?: string
  ): Promise<User> {
    const collection = await this.getCollection();

    // Check if user already exists
    const existingUser = await collection.findOne({
      email: userData.email.toLowerCase(),
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password if provided
    let hashedPassword = undefined;
    if (userData.password) {
      hashedPassword = await hash(userData.password, 12);
    }

    const newUser: UserCreate = {
      ...userData,
      password: hashedPassword,
      email: userData.email.toLowerCase(),
      is_active: true,
      role: "standard", // Default role for new users
      createdBy: createdBy,
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
    updates: UserUpdate,
    updatedBy?: string
  ): Promise<User | null> {
    const collection = await this.getCollection();

    // Hash password if provided
    if (updates.password) {
      updates.password = await hash(updates.password, 12);
    }

    // Track role changes
    if (updates.role) {
      updates.roleChangedBy = updatedBy;
      updates.roleChangedAt = new Date();
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
      { $set: { "statistics.lastLogin": new Date() } }
    );
  }

  // Role management methods
  static async changeUserRole(
    userId: string,
    newRole: UserRole,
    changedBy: string
  ): Promise<User | null> {
    const collection = await this.getCollection();

    // Get the user making the change
    const changer = await this.getUserById(changedBy);
    if (!changer) {
      throw new Error("User making the change not found");
    }

    // Check if the changer has permission to change roles
    if (!ROLE_PERMISSIONS[changer.role].canManageUsers) {
      throw new Error("Insufficient permissions to change user roles");
    }

    // Super admins can change to any role, admins can only change to standard
    if (changer.role === "admin" && newRole !== "standard") {
      throw new Error("Admins can only change users to standard role");
    }

    // Prevent changing own role
    if (userId === changedBy) {
      throw new Error("Cannot change your own role");
    }

    // Get the target user
    const targetUser = await this.getUserById(userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Prevent changing super admin roles
    if (targetUser.role === "super_admin" && changer.role !== "super_admin") {
      throw new Error("Only super admins can change super admin roles");
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role: newRole,
          roleChangedBy: changedBy,
          roleChangedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result.value
      ? { ...result.value, _id: result.value._id.toString() }
      : null;
  }

  static async deactivateUser(
    userId: string,
    deactivatedBy: string
  ): Promise<boolean> {
    const collection = await this.getCollection();

    // Get the user making the change
    const changer = await this.getUserById(deactivatedBy);
    if (!changer) {
      throw new Error("User making the change not found");
    }

    // Check if the changer has permission to deactivate users
    if (!ROLE_PERMISSIONS[changer.role].canDeleteUsers) {
      throw new Error("Insufficient permissions to deactivate users");
    }

    // Prevent deactivating own account
    if (userId === deactivatedBy) {
      throw new Error("Cannot deactivate your own account");
    }

    // Get the target user
    const targetUser = await this.getUserById(userId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    // Prevent deactivating super admin accounts
    if (targetUser.role === "super_admin" && changer.role !== "super_admin") {
      throw new Error("Only super admins can deactivate super admin accounts");
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          is_active: false,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  static async getUsersByRole(role: UserRole): Promise<User[]> {
    const collection = await this.getCollection();
    const users = await collection.find({ role, is_active: true }).toArray();
    return users.map((user) => ({ ...user, _id: user._id.toString() }));
  }

  static async getActiveUsers(): Promise<User[]> {
    const collection = await this.getCollection();
    const users = await collection.find({ is_active: true }).toArray();
    return users.map((user) => ({ ...user, _id: user._id.toString() }));
  }
}
