"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  defaultPasswordPolicy,
  describePasswordRules,
  validatePassword,
} from "@/lib/password-policy";

type PublicAuthConfig = {
  passwordMinLength: number;
  requireNumber: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireSpecialChar: boolean;
  resetPasswordMethod: "code" | "link";
};

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const status = searchParams.get("insforge_status");
  const insforgeType = searchParams.get("insforge_type");
  const incomingError = searchParams.get("insforge_error");

  const [config, setConfig] = useState<PublicAuthConfig | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [msgTone, setMsgTone] = useState<"warn" | "success">("warn");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    void loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const res = await fetch("/api/auth/public-config");
      const data = (await res.json()) as PublicAuthConfig & { error?: string };
      if (!res.ok) {
        setMsg(data.error ?? "Could not load password reset settings.");
        setMsgTone("warn");
        return;
      }
      setConfig(data);
    } catch {
      setMsg("Could not load password reset settings.");
      setMsgTone("warn");
    }
  }

  useEffect(() => {
    if (incomingError) {
      setMsg("This reset link is invalid or expired. Request a new password reset from login.");
      setMsgTone("warn");
      return;
    }
    if (insforgeType === "reset_password" && status === "ready" && token) {
      setMsg("Reset link verified. Create a new password to secure your account.");
      setMsgTone("success");
    }
  }, [incomingError, insforgeType, status, token]);

  const policy = useMemo(() => {
    if (!config) return defaultPasswordPolicy();
    return {
      passwordMinLength: config.passwordMinLength,
      requireNumber: config.requireNumber,
      requireLowercase: config.requireLowercase,
      requireUppercase: config.requireUppercase,
      requireSpecialChar: config.requireSpecialChar,
    };
  }, [config]);

  const isCodeMode = config?.resetPasswordMethod === "code" && !token;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const pwdErr = validatePassword(newPassword, policy);
    if (pwdErr) {
      setPasswordError(pwdErr);
      setMsg(pwdErr);
      setMsgTone("warn");
      return;
    }
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setMsg("New password and confirmation do not match.");
      setMsgTone("warn");
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      const body = isCodeMode
        ? { mode: "code", email, code, newPassword }
        : { mode: "token", otp: token, newPassword };

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setMsg(
          data.error ??
            "Could not reset password. The link/code may be expired. Request a fresh reset from login.",
        );
        setMsgTone("warn");
        return;
      }
      setMsg(
        data.message ??
          "Password updated successfully. Sign in with your new password and keep it unique.",
      );
      setMsgTone("success");
      setNewPassword("");
      setConfirmPassword("");
      setCode("");
      setPasswordError(null);
    } catch {
      setMsg("Network error while updating password.");
      setMsgTone("warn");
    } finally {
      setSubmitting(false);
    }
  }

  const hasReadyToken = Boolean(token && insforgeType === "reset_password" && status === "ready");

  const canSubmit = isCodeMode
    ? Boolean(email && code && newPassword && confirmPassword)
    : Boolean(hasReadyToken && newPassword && confirmPassword);

  const tokenModeBlocked = !isCodeMode && !hasReadyToken;

  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-primary/15 bg-surface p-8">
          <h1 className="font-serif text-4xl">Reset your password</h1>
          <p className="mt-3 text-sm text-muted">
            For security, reset links and reset codes are short-lived. If this reset expires, go
            back to login and request a new one.
          </p>

          {msg ? (
            <p
              className={`mt-4 rounded-lg px-3 py-2 text-sm ${
                msgTone === "success"
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              {msg}
            </p>
          ) : null}

          {tokenModeBlocked ? (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This reset link is no longer valid. Request a new reset email from the login page.
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            {isCodeMode ? (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
                />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit reset code"
                  inputMode="numeric"
                  maxLength={6}
                  className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
                />
              </>
            ) : null}

            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                const v = e.target.value;
                setNewPassword(v);
                setPasswordError(v ? validatePassword(v, policy) : null);
              }}
              placeholder="New password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm outline-none ring-primary/20 focus:ring"
            />
            <p className="text-xs text-muted">Password rules: {describePasswordRules(policy)}.</p>
            {passwordError ? <p className="text-xs text-amber-900">{passwordError}</p> : null}
            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Updating password…" : "Update password"}
            </button>
          </form>

          <p className="mt-4 text-sm text-muted">
            Use a unique password you do not reuse on other websites. Avoid names, birthdays, or
            easy patterns.
          </p>
          <Link href="/login" className="mt-2 inline-block text-sm text-primary hover:underline">
            Back to login
          </Link>
    </section>
  );
}
