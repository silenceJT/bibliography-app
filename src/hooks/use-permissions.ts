import { useSession } from "next-auth/react";
import { ROLE_PERMISSIONS, UserRole } from "@/types/user";

export function usePermissions() {
  const { data: session } = useSession();

  const userRole = (session?.user?.role as UserRole) || "standard";
  const permissions = ROLE_PERMISSIONS[userRole];

  const can = {
    view: permissions.canView,
    create: permissions.canCreate,
    update: permissions.canUpdate,
    delete: permissions.canDelete,
    manageUsers: permissions.canManageUsers,
    deleteUsers: permissions.canDeleteUsers,
  };

  const isRole = {
    standard: userRole === "standard",
    admin: userRole === "admin",
    superAdmin: userRole === "super_admin",
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  const requireRole = (role: UserRole | UserRole[]) => {
    if (!hasRole(role)) {
      throw new Error("Insufficient permissions");
    }
    return true;
  };

  return {
    userRole,
    permissions,
    can,
    isRole,
    hasRole,
    requireRole,
  };
}
