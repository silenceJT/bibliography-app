"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import ContentLayout from "@/components/layout/content-layout";

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission: keyof ReturnType<typeof usePermissions>["can"];
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermission,
  fallback,
  showAccessDenied = true,
}: PermissionGuardProps) {
  const { can } = usePermissions();

  if (!can[requiredPermission]) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAccessDenied) {
      return (
        <ContentLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this feature.
            </p>
          </div>
        </ContentLayout>
      );
    }

    return null;
  }

  return <>{children}</>;
}
