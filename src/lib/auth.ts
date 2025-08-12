import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import clientPromise from "./mongodb";

import { UserService } from "./user";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await clientPromise;
          const db = client.db("test");
          const usersCollection = db.collection("users");

          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile) {
        try {
          // Check if user exists in our custom users collection
          const dbUser = await UserService.getUserByEmail(user.email!);

          if (!dbUser) {
            // Create new user in our custom collection
            await UserService.createUser({
              email: user.email!,
              name: user.name!,
              image: user.image,
              role: "user",
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
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // Update last login
            await UserService.updateLastLogin(dbUser._id!);
          }

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      if (account?.provider === "google" && user) {
        // Update last login on JWT creation
        const dbUser = await UserService.getUserByEmail(user.email!);
        if (dbUser) {
          await UserService.updateLastLogin(dbUser._id!);
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // Get additional user data from our custom collection
        if (user?.email) {
          const dbUser = await UserService.getUserByEmail(user.email);
          if (dbUser) {
            session.user.preferences = dbUser.preferences;
            session.user.statistics = dbUser.statistics;
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
