import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["localhost"],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
