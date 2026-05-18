import { AdminShell } from "@/components/admin-shell";
import { BugReportsTable } from "./bug-reports-table";

export default function AdminBugReportsPage() {
  return (
    <AdminShell
      title="Bug reports"
      description="Submissions from /report-bug — newest first. Requires INSFORGE_SERVICE_KEY on the server."
    >
      <BugReportsTable />
    </AdminShell>
  );
}
