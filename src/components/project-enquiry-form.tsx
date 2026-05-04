"use client";

import { useMemo, useState } from "react";

type Props = {
  projectSlug: string;
  projectTitle: string;
};

const DIAL_OPTIONS: { value: string; label: string }[] = [
  { value: "+91", label: "India (+91)" },
  { value: "+1", label: "United States / Canada (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+971", label: "United Arab Emirates (+971)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+61", label: "Australia (+61)" },
  { value: "+49", label: "Germany (+49)" },
  { value: "+33", label: "France (+33)" },
  { value: "+81", label: "Japan (+81)" },
  { value: "+86", label: "China (+86)" },
  { value: "__full__", label: "Other — enter full international number" },
];

const E164_RE = /^\+[1-9]\d{6,14}$/;

function buildPhone(dial: string, nationalDigits: string, fullManual: string): string | null {
  if (dial === "__full__") {
    const v = fullManual.trim().replace(/\s/g, "");
    return E164_RE.test(v) ? v : null;
  }
  let digits = nationalDigits.replace(/\D/g, "");
  digits = digits.replace(/^0+/, "");
  if (digits.length < 6 || digits.length > 14) return null;
  const v = `${dial}${digits}`;
  return E164_RE.test(v) ? v : null;
}

export function ProjectEnquiryForm({ projectSlug, projectTitle }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+91");
  const [national, setNational] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const phonePreview = useMemo(() => buildPhone(dial, national, fullPhone), [dial, national, fullPhone]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const phone = buildPhone(dial, national, fullPhone);
    if (!phone) {
      setFeedback(
        dial === "__full__"
          ? "Enter a valid international number starting with + (7–15 digits after +)."
          : "Choose a country code and enter 6–14 digits for the local number (no leading 0).",
      );
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setFeedback(null);
    try {
      const res = await fetch("/api/project-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug,
          name: name.trim(),
          email: email.trim(),
          phone,
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as { error?: unknown; message?: string };
      if (!res.ok) {
        setFeedback(
          typeof data.error === "string"
            ? data.error
            : "Could not send. Check the fields and try again.",
        );
        setStatus("error");
        return;
      }
      setStatus("success");
      setFeedback(data.message ?? "Thank you. We will be in touch.");
      setName("");
      setEmail("");
      setDial("+91");
      setNational("");
      setFullPhone("");
      setMessage("");
    } catch {
      setFeedback("Network error. Try again shortly.");
      setStatus("error");
    }
  }

  return (
    <section
      className="min-w-0 rounded-xl border border-charcoal/10 bg-cream/40 p-5 shadow-sm"
      aria-labelledby="project-enquiry-heading"
    >
      <h2 id="project-enquiry-heading" className="font-serif text-lg text-charcoal">
        Enquire about this project
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Share your interest in{" "}
        <span className="font-medium text-charcoal/90">{projectTitle}</span>. Our team routes serious enquiries to the
        studio or editorial desk.
      </p>
      {status === "success" ? (
        <p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-charcoal/90">
          {feedback}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div>
            <label htmlFor="enq-name" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Name
            </label>
            <input
              id="enq-name"
              name="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="enq-email" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Email
            </label>
            <input
              id="enq-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Phone</span>
            <p className="mt-0.5 text-[11px] text-muted">Country code and number (validated as international E.164).</p>
            <div className="mt-1 flex min-w-0 flex-col gap-2">
              <select
                id="enq-dial"
                aria-label="Country calling code"
                value={dial}
                onChange={(e) => {
                  setDial(e.target.value);
                  setNational("");
                  setFullPhone("");
                }}
                className="w-full max-w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
              >
                {DIAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {dial === "__full__" ? (
                <input
                  id="enq-phone-full"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+44 20 7946 0958"
                  value={fullPhone}
                  onChange={(e) => setFullPhone(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
                />
              ) : (
                <input
                  id="enq-phone-national"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  placeholder="9876543210"
                  value={national}
                  onChange={(e) => setNational(e.target.value.replace(/[^\d]/g, ""))}
                  className="w-full min-w-0 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
                />
              )}
            </div>
            {phonePreview ? (
              <p className="mt-1 font-mono text-[11px] text-muted">Will send as: {phonePreview}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="enq-message" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Message
            </label>
            <textarea
              id="enq-message"
              name="message"
              required
              minLength={10}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly describe your enquiry (site visit, similar commission, press…)"
              className="mt-1 w-full resize-y rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm text-charcoal outline-none ring-primary/30 focus:ring-2"
            />
          </div>
          {feedback && status === "error" ? <p className="text-sm text-red-700">{feedback}</p> : null}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "submitting" ? "Sending…" : "Submit enquiry"}
          </button>
        </form>
      )}
    </section>
  );
}
