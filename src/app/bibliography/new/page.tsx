"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import BibliographyForm from "@/components/forms/bibliography-form";

export default function AddBibliographyPage() {
  return (
    <DashboardLayout>
      <BibliographyForm mode="create" />
    </DashboardLayout>
  );
}
