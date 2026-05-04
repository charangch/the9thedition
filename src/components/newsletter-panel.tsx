"use client";

import { useState } from "react";

function formatApiError(err: unknown, status?: number): string {
  if (typeof err === "string" && err.trim()) return err.trim();
  if (!err || typeof err !== "object") {
    return status && status >= 500
      ? `Server error (${status}). Please try again.`
      : "Could not update subscription.";
  }
  const o = err as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
  if (typeof o.details === "string" && o.details.trim()) return o.details.trim();
  if (typeof o.hint === "string" && o.hint.trim()) return o.hint.trim();
  const fe = o.fieldErrors;
  if (fe && typeof fe === "object") {
    for (const v of Object.values(fe as Record<string, unknown>)) {
      if (Array.isArray(v) && v[0] != null && String(v[0]).trim()) return String(v[0]).trim();
    }
    return "Please check the name and email fields.";
  }
  if (Array.isArray(o.formErrors) && o.formErrors[0] != null) return String(o.formErrors[0]);
  return status && status >= 500
    ? `Server error (${status}). Please try again.`
    : "Could not update subscription.";
}

export function NewsletterPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"subscribed" | "unsubscribed">("unsubscribed");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(nextStatus: "subscribed" | "unsubscribed") {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          status: nextStatus,
          source: "newsletter_page",
          ...(nextStatus === "subscribed" ? { name: name.trim() } : {}),
        }),
      });
      const raw = await res.text();
      let data: Record<string, unknown> = {};
      if (raw) {
        try {
          data = JSON.parse(raw) as Record<string, unknown>;
        } catch {
          setMessage(`Something went wrong (HTTP ${res.status}). Please try again.`);
          return;
        }
      }
      if (!res.ok) {
        setMessage(formatApiError(data.error ?? data, res.status));
        return;
      }
      setStatus(nextStatus);
      setMessage(nextStatus === "subscribed" ? "You are subscribed." : "You are unsubscribed.");
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-surface p-8 md:p-10">
      <h2 className="font-serif text-2xl text-charcoal">Newsletter</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-charcoal/80">
        Subscribe for curated briefings on projects, products, and editorial intelligence. No account required.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        autoComplete="name"
        className="mt-5 w-full max-w-md rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        className="mt-3 w-full max-w-md rounded-md border border-primary/20 bg-white px-3 py-2 text-sm"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading || !email || !name.trim() || status === "subscribed"}
          onClick={() => void submit("subscribed")}
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Subscribe
        </button>
        <button
          type="button"
          disabled={loading || !email || status === "unsubscribed"}
          onClick={() => void submit("unsubscribed")}
          className="rounded-full border border-charcoal/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/80 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Unsubscribe
        </button>
      </div>
      {message ? (
        <p className="mt-4 text-sm text-charcoal/85" role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
