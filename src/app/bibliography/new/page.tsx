"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PermissionGuard } from "@/components/ui/permission-guard";
import BibliographyForm from "@/components/forms/bibliography-form";

export default function AddBibliographyPage() {
  return (
    <PermissionGuard requiredPermission="create">
      <DashboardLayout>
        <BibliographyForm mode="create" />
      </DashboardLayout>
    </PermissionGuard>
  );
}
