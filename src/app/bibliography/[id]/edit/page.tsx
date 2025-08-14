"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PermissionGuard } from "@/components/ui/permission-guard";
import BibliographyForm from "@/components/forms/bibliography-form";
import { Bibliography } from "@/types/bibliography";

export default function EditBibliographyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [bibliography, setBibliography] = useState<Bibliography | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBibliography = async () => {
      try {
        const response = await fetch(`/api/bibliography/${id}`);
        if (response.ok) {
          const data = await response.json();
          setBibliography(data);
        } else {
          console.error("Failed to fetch bibliography");
        }
      } catch (error) {
        console.error("Error fetching bibliography:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBibliography();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bibliography) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bibliography Not Found
          </h1>
          <p className="text-gray-600">
            The bibliography you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <PermissionGuard requiredPermission="update">
      <DashboardLayout>
        <BibliographyForm
          mode="edit"
          initialData={bibliography}
          bibliographyId={id}
        />
      </DashboardLayout>
    </PermissionGuard>
  );
}
