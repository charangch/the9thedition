"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SiteHeader } from "@/components/site-header";

type LeadRow = {
  id: string;
  project_id: string;
  project_title?: string | null;
  project_url?: string | null;
  name: string;
  email: string;
  phone_e164?: string | null;
  message: string;
  status: "new" | "contacted" | "closed";
  internal_notes: string | null;
  created_at: string;
};

export default function AdminLeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | LeadRow["status"]>("all");
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const suffix = statusFilter === "all" ? "" : `?status=${statusFilter}`;
    const res = await fetch(`/api/admin/leads${suffix}`);
    const data = (await res.json()) as { leads?: LeadRow[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Could not load leads.");
      return;
    }
    setRows(data.leads ?? []);
  }, [statusFilter]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function updateLead(id: string, payload: { status?: LeadRow["status"]; internalNotes?: string }) {
    setSavingId(id);
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    const data = (await res.json()) as { error?: string };
    setSavingId(null);
    if (!res.ok) {
      setError(data.error ?? "Update failed.");
      return;
    }
    await load();
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (!q) return true;
      return (
        row.project_id.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        (row.phone_e164 ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  return (
    <>
      <SiteHeader />
      <AdminShell
        title="Leads & Enquiries"
        description="Track project enquiries, update status, and keep private notes. Mobile-friendly for on-the-go owner workflows."
      >
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project, name, or email"
            className="w-full min-w-0 rounded-md border border-primary/20 bg-white px-3 py-2 text-sm sm:w-auto sm:min-w-[240px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | LeadRow["status"])}
            className="rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="mt-6 grid gap-3 md:hidden">
          {filtered.map((lead) => (
            <article key={lead.id} className="rounded-xl border border-primary/15 bg-surface p-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-primary">{lead.project_id}</p>
              {lead.project_title ? (
                <p className="mt-1 text-xs text-charcoal/70">{lead.project_title}</p>
              ) : null}
              <h3 className="mt-1 font-serif text-xl">{lead.name}</h3>
              <p className="text-sm text-charcoal/80">{lead.email}</p>
              {lead.phone_e164 ? (
                <p className="mt-1 font-mono text-xs text-charcoal/75">{lead.phone_e164}</p>
              ) : null}
              <p className="mt-2 text-sm text-charcoal/85">{lead.message}</p>
              <select
                className="mt-3 w-full rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
                value={lead.status}
                disabled={savingId === lead.id}
                onChange={(e) => void updateLead(lead.id, { status: e.target.value as LeadRow["status"] })}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>
              <textarea
                defaultValue={lead.internal_notes ?? ""}
                placeholder="Private notes"
                className="mt-2 w-full rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
                onBlur={(e) => void updateLead(lead.id, { internalNotes: e.target.value })}
              />
            </article>
          ))}
        </div>

        <div className="mt-6 hidden overflow-x-auto rounded-xl border border-primary/15 bg-surface md:block">
          <table className="min-w-[980px] text-sm lg:min-w-full">
            <thead className="border-b border-primary/10 text-left text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Lead and phone</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Private notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-primary/10 align-top last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal">{lead.project_title ?? lead.project_id}</p>
                    {lead.project_url ? (
                      <a href={lead.project_url} className="text-xs text-primary hover:underline">
                        Open project
                      </a>
                    ) : (
                      <p className="text-xs text-muted">{lead.project_id}</p>
                    )}
                    <p className="text-xs text-muted">{new Date(lead.created_at).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{lead.name}</p>
                    <p className="text-xs text-muted">{lead.email}</p>
                    {lead.phone_e164 ? (
                      <p className="mt-1 font-mono text-xs text-charcoal/80">{lead.phone_e164}</p>
                    ) : (
                      <p className="mt-1 text-xs text-muted">—</p>
                    )}
                  </td>
                  <td className="max-w-[320px] break-words px-4 py-3 text-charcoal/85">{lead.message}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-primary/20 bg-white px-2 py-1"
                      value={lead.status}
                      disabled={savingId === lead.id}
                      onChange={(e) => void updateLead(lead.id, { status: e.target.value as LeadRow["status"] })}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      defaultValue={lead.internal_notes ?? ""}
                      placeholder="Private notes"
                      className="min-h-[90px] w-full min-w-[180px] max-w-[260px] rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
                      onBlur={(e) => void updateLead(lead.id, { internalNotes: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </>
  );
}
