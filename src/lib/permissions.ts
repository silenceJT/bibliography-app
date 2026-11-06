import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { authOptions } from "./auth";
import { UserService } from "./users";
import { ROLE_PERMISSIONS } from "@/types/user";
import { permissionStatus, type Permission } from "./permission-check";

/**
 * Check that the signed-in user may do `permission` (ROLE_PERMISSIONS).
 * Returns the error response to send, or null when allowed:
 *
 *   const denied = await requirePermission("canDelete");
 *   if (denied) return denied;
 *
 * The role is read from the database, not the session token, so a role
 * change or deactivation applies to the next request.
 */
export async function requirePermission(
  permission: Permission
): Promise<NextResponse | null> {
  const session = (await getServerSession(authOptions)) as {
    user?: { id?: string };
  } | null;
  const id = session?.user?.id;
  const user =
    id && ObjectId.isValid(id) ? await UserService.getUserById(id) : null;

  const status = permissionStatus(user, permission, ROLE_PERMISSIONS);
  if (status === 401) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (status === 403) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }
  return null;
}
