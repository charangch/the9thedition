"use client";

import { AdminShell } from "@/components/admin-shell";
import { SiteHeader } from "@/components/site-header";
import { SubmissionsTable } from "@/app/admin/submissions/submissions-table";

export default function AdminSubmissionsPage() {
  return (
    <>
      <SiteHeader />
      <AdminShell
        title="Editorial submissions"
        description="Enter architect email details, publish to a live project page (same layout as the catalog), homepage Latest Projects, and the professional portfolio."
      >
        <SubmissionsTable />
      </AdminShell>
    </>
  );
}
