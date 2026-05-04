"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { SiteHeader } from "@/components/site-header";

type UserRow = {
  user_id: string;
  role: "admin";
  display_name: string | null;
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = (await res.json()) as { users?: UserRow[]; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to load users.");
      return;
    }
    setRows(data.users ?? []);
  }

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, []);

  async function createUser() {
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to create user.");
      return;
    }
    setCreateForm({ email: "", password: "", displayName: "" });
    await load();
  }

  async function removeUser(userId: string) {
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Failed to remove user.");
      return;
    }
    setRows((prev) => prev.filter((r) => r.user_id !== userId));
  }

  const filtered = rows.filter((row) => {
    const q = query.trim().toLowerCase();
    const matchQuery = !q
      ? true
      : row.user_id.toLowerCase().includes(q) || (row.display_name ?? "").toLowerCase().includes(q);
    return matchQuery;
  });

  return (
    <>
      <SiteHeader />
      <AdminShell
        title="User Management"
        description="Create and remove admin users. Reader management has been retired."
      >
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <section className="rounded-xl border border-primary/15 bg-surface p-5">
          <h2 className="font-serif text-2xl">Create new admin</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={createForm.displayName}
              onChange={(e) => setCreateForm((v) => ({ ...v, displayName: e.target.value }))}
              placeholder="Display name"
              className="rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={createForm.email}
              onChange={(e) => setCreateForm((v) => ({ ...v, email: e.target.value }))}
              placeholder="admin@theninthedition.com"
              className="rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={createForm.password}
              onChange={(e) => setCreateForm((v) => ({ ...v, password: e.target.value }))}
              placeholder="Temporary password"
              type="password"
              className="rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => void createUser()}
            className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Create admin
          </button>
        </section>
        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or user ID"
            className="min-w-[260px] rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-primary/15 bg-surface">
          <table className="min-w-full text-sm">
            <thead className="border-b border-primary/10 text-left text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3">Display name</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.user_id} className="border-b border-primary/10 last:border-0">
                  <td className="px-4 py-3">{row.display_name ?? "Unnamed user"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-charcoal/70">{row.user_id}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void removeUser(row.user_id)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs uppercase tracking-[0.12em] text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
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
