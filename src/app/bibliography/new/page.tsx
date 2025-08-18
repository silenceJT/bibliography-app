"use client";

import ContentLayout from "@/components/layout/content-layout";
import { PermissionGuard } from "@/components/ui/permission-guard";
import BibliographyForm from "@/components/forms/bibliography-form";

export default function AddBibliographyPage() {
  return (
    <PermissionGuard requiredPermission="create">
      <ContentLayout>
        <BibliographyForm mode="create" />
      </ContentLayout>
    </PermissionGuard>
  );
}
