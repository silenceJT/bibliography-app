import type { UserPermissions, UserRole } from "@/types/user";

export type Permission = "canView" | "canCreate" | "canUpdate" | "canDelete";

/**
 * HTTP status for a request needing `permission`: 401 without a usable
 * account, 403 when the account's role doesn't grant it, 200 otherwise.
 * `user` is the account as stored now (not the session's copy), so a
 * deactivated or demoted user loses access straight away.
 */
export function permissionStatus(
  user: { role?: string; is_active?: boolean } | null,
  permission: Permission,
  table: Record<UserRole, UserPermissions>
): 200 | 401 | 403 {
  if (!user || user.is_active === false) return 401;
  const granted = table[user.role as UserRole];
  return granted?.[permission] ? 200 : 403;
}
