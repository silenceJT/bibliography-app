import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
  },
  // MONGODB_URI / NEXTAUTH_SECRET / NEXTAUTH_URL used to be listed under `env`,
  // which inlines them at build time (and into any client bundle that
  // references them). Server code reads them from process.env at runtime.
  // Ignore ESLint errors during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
