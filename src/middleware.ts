import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const userRole = token.role as string;

    // Define route permissions
    const routePermissions = {
      // Bibliography routes
      "/bibliography/new": ["admin", "super_admin"],
      "/bibliography/[id]/edit": ["admin", "super_admin"],

      // User management routes (super admin only)
      "/admin/users": ["super_admin"],
      "/admin/users/[id]": ["super_admin"],

      // Dashboard routes (all authenticated users)
      "/dashboard": ["standard", "admin", "super_admin"],
      "/bibliography": ["standard", "admin", "super_admin"],
    };

    // Check if current path matches any protected route
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (pathMatchesRoute(path, route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect to unauthorized page or dashboard
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        break;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Helper function to check if path matches route pattern
function pathMatchesRoute(path: string, route: string): boolean {
  // Convert route pattern to regex
  const routeRegex = route
    .replace(/\[.*?\]/g, "[^/]+") // Replace [id] with regex pattern
    .replace(/\//g, "\\/"); // Escape forward slashes

  const regex = new RegExp(`^${routeRegex}$`);
  return regex.test(path);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bibliography/:path*",
    "/admin/:path*",
    "/api/bibliography/:path*",
    "/api/users/:path*",
  ],
};
