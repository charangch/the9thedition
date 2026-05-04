import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16">
        <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </>
  );
}
