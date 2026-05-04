"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SiteHeader } from "@/components/site-header";

type Subscriber = {
  id: string;
  email: string;
  subscriber_name?: string | null;
  status: "subscribed" | "unsubscribed";
  source?: string | null;
  consent_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/newsletter");
      const json = (await res.json()) as { subscribers?: Subscriber[]; error?: string };
      if (res.ok) setSubscribers(json.subscribers ?? []);
      else setMessage(json.error ?? "Could not load subscribers.");
      setLoading(false);
    })();
  }, []);

  function exportSubscribersToExcelCsv() {
    if (subscribers.length === 0) {
      setMessage("No subscribers available to export.");
      return;
    }
    const rows = [
      ["Name", "Email", "Status", "Source", "Consent At", "Created At", "Updated At"],
      ...subscribers.map((s) => [
        s.subscriber_name?.trim() || "",
        s.email,
        s.status,
        s.source ?? "",
        s.consent_at ?? "",
        s.created_at ?? "",
        s.updated_at ?? "",
      ]),
    ];
    const escapeCell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = rows.map((row) => row.map((cell) => escapeCell(cell)).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${subscribers.length} subscribers.`);
  }

  const q = query.trim().toLowerCase();
  const filteredSubscribers = subscribers.filter((subscriber) => {
    if (!q) return true;
    const name = (subscriber.subscriber_name ?? "").toLowerCase();
    return subscriber.email.toLowerCase().includes(q) || name.includes(q);
  });

  return (
    <>
      <SiteHeader />
      <AdminShell
        title="Newsletter Subscribers"
        description="View subscriber names and emails, then export the list for external sending tools."
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            className="min-w-[260px] rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={exportSubscribersToExcelCsv}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Export to Excel (CSV)
          </button>
          <p className="text-xs text-muted">
            Total subscribed: {subscribers.length}
          </p>
        </div>

        <section className="mt-4 rounded-xl border border-primary/15 bg-surface p-5">
          {loading ? <p className="text-sm text-muted">Loading subscribers…</p> : null}
          {!loading ? (
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-primary/10 text-xs uppercase tracking-[0.14em] text-primary">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Source</th>
                    <th className="py-2">Consent Date</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((s) => (
                    <tr key={s.id} className="border-b border-primary/10 last:border-0">
                      <td className="py-2 text-charcoal/90">
                        {s.subscriber_name?.trim() ? s.subscriber_name.trim() : "—"}
                      </td>
                      <td className="py-2">{s.email}</td>
                      <td className="py-2 text-charcoal/70">{s.source ?? "web"}</td>
                      <td className="py-2 text-charcoal/70">
                        {s.consent_at ? new Date(s.consent_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-2 text-charcoal/70">
                        {s.updated_at ? new Date(s.updated_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {!loading && filteredSubscribers.length === 0 ? (
            <p className="text-sm text-muted">No subscribers found.</p>
          ) : null}
        </section>
        {message ? <p className="mt-3 text-xs text-charcoal/80">{message}</p> : null}
      </AdminShell>
    </>
  );
}
