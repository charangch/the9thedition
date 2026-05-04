"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OAuthProviderIcon } from "@/components/oauth-provider-icons";
import { ADMIN_EMAIL_DOMAIN, isAllowedAdminEmail, normalizeEmail } from "@/lib/admin-auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const err = searchParams.get("error");
  const [pending, setPending] = useState<"google" | "password" | "magic" | null>(null);
  const [activeTab, setActiveTab] = useState<"password" | "magic">("password");
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [existingUser, setExistingUser] = useState<{ email: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"warn" | "success">("warn");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch("/api/auth/session");
      const j = (await r.json()) as {
        user: { email: string } | null;
      };
      if (!cancelled) {
        setExistingUser(j.user);
        setSessionLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next, router]);

  async function startGoogle() {
    setPending("google");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/oauth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", next }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setMessage(data.error ?? "Could not start Google sign in.");
        setMessageTone("warn");
        setPending(null);
        return;
      }
      globalThis.location.assign(data.url);
    } catch {
      setMessage("Network error while starting Google sign in.");
      setMessageTone("warn");
      setPending(null);
    }
  }

  async function submitPasswordSignIn() {
    if (!isAllowedAdminEmail(normalizeEmail(email))) {
      setMessage(`Use your @${ADMIN_EMAIL_DOMAIN} admin email (exact domain).`);
      setMessageTone("warn");
      return;
    }
    setPending("password");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmail(email), password }),
      });
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        const base = data.error ?? "Admin sign in failed.";
        let detail = base;
        if (data.code === "email_not_verified") {
          detail = `${base} Use the “Magic link” tab (same email) or confirm the address in your InsForge project, then try again.`;
        } else if (data.code === "admin_only") {
          detail = `${base} Grant admin: run \`npm run create-sample-admin\` from the web folder (needs INSFORGE_SERVICE_KEY), or set ADMIN_BOOTSTRAP_USER_ID and run \`npm run bootstrap:admin\`.`;
        } else if (data.code === "sign_in_failed") {
          detail = `${base} Check the exact domain @${ADMIN_EMAIL_DOMAIN}, password, and that the user exists (run \`npm run create-sample-admin\` from web/ with INSFORGE_SERVICE_KEY in .env.local).`;
        }
        setMessage(detail);
        setMessageTone("warn");
        return;
      }
      globalThis.location.assign(next.startsWith("/") ? next : "/admin");
    } catch {
      setMessage("Network error while signing in.");
      setMessageTone("warn");
    } finally {
      setPending(null);
    }
  }

  async function sendMagicLink() {
    if (!isAllowedAdminEmail(normalizeEmail(email))) {
      setMessage(`Use your @${ADMIN_EMAIL_DOMAIN} admin email (exact domain).`);
      setMessageTone("warn");
      return;
    }
    setPending("magic");
    setMessage(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmail(email), next }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMessage(data.error ?? "Could not send magic link.");
        setMessageTone("warn");
        return;
      }
      setMessage(data.message ?? "Magic link sent.");
      setMessageTone("success");
    } catch {
      setMessage("Network error while sending magic link.");
      setMessageTone("warn");
    } finally {
      setPending(null);
    }
  }

  const showAuthForm = sessionLoaded && !existingUser;
  const continueHref = next.startsWith("/") ? next : "/admin";
  const heading = existingUser && sessionLoaded ? "Admin session active" : "Admin login";
  const subtext =
    existingUser && sessionLoaded
      ? "Continue to the admin dashboard, or sign out and use a different admin account."
      : `Only @${ADMIN_EMAIL_DOMAIN} admin accounts can sign in.`;

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-primary/20 bg-white/90 p-8 shadow-[0_20px_60px_-24px_rgba(60,50,40,0.25)] backdrop-blur-sm md:p-10">
      <div className="mb-6 lg:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Admin Portal</p>
        <p className="mt-2 font-serif text-xl leading-snug text-charcoal">
          Sign in to manage publishing, admins, and newsletters.
        </p>
      </div>
      <h1 className="font-serif text-4xl tracking-tight text-charcoal md:text-[2.75rem]">{heading}</h1>
      <p className="mt-3 text-sm leading-relaxed text-charcoal/75">{subtext}</p>
      {!sessionLoaded && (
        <p className="mt-4 text-sm text-muted" aria-live="polite">
          Checking your session...
        </p>
      )}
      {existingUser && sessionLoaded ? (
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
          <p className="text-sm text-charcoal">
            Signed in as <span className="font-semibold">{existingUser.email}</span>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <a
              href={continueHref}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white hover:opacity-95"
            >
              Continue
            </a>
            <button
              type="button"
              onClick={() => {
                void fetch("/api/auth/signout", { method: "POST" }).then(() => {
                  globalThis.location.assign(`/login?next=${encodeURIComponent(next)}`);
                });
              }}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-center text-sm font-medium text-charcoal hover:bg-primary/5"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
      {err === "oauth_exchange_failed" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          Sign-in failed during OAuth exchange. Try again or check InsForge redirect URLs.
        </p>
      )}
      {err === "missing_code" && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Missing OAuth code. Start login from this page.
        </p>
      )}
      {err === "admin_only" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          This account is not an admin account.
        </p>
      )}
      {err === "domain_not_allowed" && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          Only @{ADMIN_EMAIL_DOMAIN} accounts are allowed.
        </p>
      )}
      {err === "insforge_not_configured" && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">InsForge environment variables are missing</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-900/95">
            <li>
              In the <code className="rounded bg-white/80 px-1">web</code> folder, copy{" "}
              <code className="rounded bg-white/80 px-1">.env.example</code> to{" "}
              <code className="rounded bg-white/80 px-1">.env.local</code>.
            </li>
            <li>
              Set <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_INSFORGE_URL</code> and{" "}
              <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_INSFORGE_ANON_KEY</code> from your
              InsForge project (CLI: <code className="rounded bg-white/80 px-1">npx @insforge/cli metadata --json</code>{" "}
              after <code className="rounded bg-white/80 px-1">npx @insforge/cli link</code>).
            </li>
            <li>Restart the dev server (<code className="rounded bg-white/80 px-1">npm run dev</code>).</li>
          </ol>
        </div>
      )}
      {message && (
        <p
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            messageTone === "success"
              ? "bg-emerald-50 text-emerald-900"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          {message}
        </p>
      )}
      {showAuthForm ? (
        <>
          <div className="mt-8">
            <button
              type="button"
              disabled={Boolean(pending)}
              onClick={startGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-white px-4 py-3 text-sm font-medium hover:border-primary disabled:opacity-60"
            >
              <OAuthProviderIcon provider="google" />
              {pending === "google" ? "Redirecting..." : "Continue with Google"}
            </button>
          </div>

          <div className="my-6 h-px w-full bg-primary/10" />

          <div className="flex rounded-lg border border-primary/15 p-1 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`w-1/2 rounded-md px-3 py-2 ${
                activeTab === "password" ? "bg-primary text-white" : "text-charcoal/80"
              }`}
            >
              Email + password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("magic")}
              className={`w-1/2 rounded-md px-3 py-2 ${
                activeTab === "magic" ? "bg-primary text-white" : "text-charcoal/80"
              }`}
            >
              Magic link
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={`sample.admin@${ADMIN_EMAIL_DOMAIN}`}
              autoComplete="email"
              className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
            />
            <p className="text-[11px] leading-snug text-muted">
              Domain must be exactly{" "}
              <span className="font-mono text-charcoal/80">@{ADMIN_EMAIL_DOMAIN}</span>. Common typo:{" "}
              <span className="font-mono">@theninthEdition.com</span> is wrong (extra “e” before Edition).
            </p>
            {activeTab === "password" ? (
              <>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
                />
                <button
                  type="button"
                  disabled={pending !== null || !email || !password}
                  onClick={() => void submitPasswordSignIn()}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {pending === "password" ? "Please wait..." : "Login with email"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={pending !== null || !email}
                onClick={() => void sendMagicLink()}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending === "magic" ? "Sending link..." : "Send magic link"}
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
