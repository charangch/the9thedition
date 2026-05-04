"use server";

type LeadNotificationPayload = {
  projectSlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export async function sendLeadNotificationEmail(payload: LeadNotificationPayload) {
  const webhook = process.env.LEADS_NOTIFICATION_WEBHOOK?.trim();
  if (!webhook) {
    console.info("[leads] notification webhook not configured", payload.projectSlug);
    return { ok: false, reason: "webhook_not_configured" } as const;
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `New lead for ${payload.projectSlug}`,
        body: `Lead received\nProject: ${payload.projectSlug}\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nMessage: ${payload.message}`,
        payload,
      }),
      cache: "no-store",
    });
    return { ok: res.ok } as const;
  } catch {
    return { ok: false, reason: "network_error" } as const;
  }
}
