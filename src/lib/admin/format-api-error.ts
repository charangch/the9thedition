import type { ZodError } from "zod";
import { formatZodIssues } from "@/lib/admin/project-publish-schema";

export function formatApiError(payload: unknown, status?: number): string {
  if (status === 413) {
    return "Upload too large for one request. Try fewer or smaller images.";
  }
  if (!payload || typeof payload !== "object") {
    return status ? `Request failed (${status})` : "Request failed";
  }
  const data = payload as Record<string, unknown>;

  if (typeof data.error === "string") return data.error;

  const err = data.error;
  if (err && typeof err === "object") {
    const flat = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    const lines: string[] = [];
    if (flat.formErrors?.length) lines.push(...flat.formErrors);
    for (const [key, msgs] of Object.entries(flat.fieldErrors ?? {})) {
      for (const m of msgs) lines.push(`${key}: ${m}`);
    }
    if (lines.length) return lines.join("\n");
  }

  return status ? `Request failed (${status})` : "Request failed";
}

export function formatZodFlatten(error: ZodError): string {
  return formatZodIssues(error);
}
