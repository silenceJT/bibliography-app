export type UserRole = "standard" | "admin" | "super_admin";

export interface User {
  _id?: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  password?: string;
  is_active: boolean;
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      browser: boolean;
    };
  };
  statistics: {
    totalBibliographies: number;
    lastLogin: Date;
    createdAt: Date;
  };
  createdBy?: string; // Track who created this user (for super admins)
  roleChangedBy?: string; // Track who last changed the role
  roleChangedAt?: Date; // When the role was last changed
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate
  extends Omit<
    User,
    "_id" | "createdAt" | "updatedAt" | "roleChangedBy" | "roleChangedAt"
  > {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdate
  extends Partial<
    Omit<
      User,
      "_id" | "createdAt" | "updatedAt" | "roleChangedBy" | "roleChangedAt"
    >
  > {
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  preferences: User["preferences"];
  statistics: User["statistics"];
}

// Permission system
export interface UserPermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canDeleteUsers: boolean;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  standard: {
    canView: true,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
    canDeleteUsers: false,
  },
  admin: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: false,
    canDeleteUsers: false,
  },
  super_admin: {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true,
    canDeleteUsers: true,
  },
};
