"use client";

import { Shield, ShieldCheck, Crown } from "lucide-react";
import { UserRole } from "@/types/user";

interface RoleDisplayProps {
  role: UserRole;
  showIcon?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function RoleDisplay({
  role,
  showIcon = true,
  showBadge = true,
  className = "",
}: RoleDisplayProps) {
  const getRoleIcon = () => {
    switch (role) {
      case "super_admin":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "admin":
        return <ShieldCheck className="h-4 w-4 text-blue-600" />;
      case "standard":
        return <Shield className="h-4 w-4 text-gray-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = () => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (role) {
      case "super_admin":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "admin":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "standard":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && getRoleIcon()}
      {showBadge && (
        <span className={getRoleBadge()}>
          {role.replace("_", " ").toUpperCase()}
        </span>
      )}
    </div>
  );
}
