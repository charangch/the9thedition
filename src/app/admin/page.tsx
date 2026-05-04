import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getAdminAuditRows } from "@/lib/cms-publish";
import { requireAdminSession } from "@/lib/admin-session";

export default async function AdminPage() {
  const admin = await requireAdminSession();
  const auditRows = admin ? await getAdminAuditRows(admin.session.accessToken) : [];
  return (
    <>
      <SiteHeader />
      <AdminShell
        title="Admin Dashboard"
        description="This area is restricted to users with role admin. Use the left menu for users, leads, and newsletters."
      >
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-primary/15 bg-surface p-6">
            <h2 className="font-serif text-2xl">User Management</h2>
            <p className="mt-2 text-sm text-charcoal/80">
              Create and remove admin users. Reader accounts are disabled.
            </p>
            <Link
              href="/admin/users"
              className="mt-4 inline-block text-sm font-medium text-primary underline"
            >
              Open user manager
            </Link>
          </div>
          <div className="rounded-xl border border-primary/15 bg-surface p-6">
            <h2 className="font-serif text-2xl">Newsletter Ops</h2>
            <p className="mt-2 text-sm text-charcoal/80">
              Review subscribed emails and export the newsletter list in Excel-compatible format.
            </p>
            <Link
              href="/admin/newsletter"
              className="mt-4 inline-block text-sm font-medium text-primary underline"
            >
              Open newsletter manager
            </Link>
          </div>
          <div className="rounded-xl border border-primary/15 bg-surface p-6">
            <h2 className="font-serif text-2xl">Leads & Enquiries</h2>
            <p className="mt-2 text-sm text-charcoal/80">
              Track incoming project leads, update status (new/contacted/closed), and add private notes.
            </p>
            <Link
              href="/admin/leads"
              className="mt-4 inline-block text-sm font-medium text-primary underline"
            >
              Open leads dashboard
            </Link>
          </div>
        </div>
        <section className="mt-10 rounded-xl border border-primary/15 bg-surface p-6">
          <h2 className="font-serif text-2xl">Audit log</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {auditRows.length === 0 ? (
              <li className="text-muted">No admin actions recorded yet.</li>
            ) : (
              auditRows.slice(0, 12).map((row: { id: string; action: string; entity_type: string; created_at: string }) => (
                <li key={row.id} className="border-b border-primary/10 pb-2 last:border-0">
                  <span className="uppercase tracking-[0.12em] text-primary">{row.action}</span>{" "}
                  <span className="text-charcoal/85">
                    {row.entity_type} · {new Date(row.created_at).toLocaleString()}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </AdminShell>
    </>
  );
}
