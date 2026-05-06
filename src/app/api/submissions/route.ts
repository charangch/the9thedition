import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizePlainText } from "@/lib/api-validation";
import { createInsForgeServerClientPublic, getInsForgePublicEnv, insforgeNotConfiguredResponse } from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { slugifyProject, submissionFormSchema } from "@/lib/submission-template";

const payloadSchema = z.object({
  kind: z.literal("project"),
  formData: submissionFormSchema,
  imageUrls: z.array(z.string().url()).max(25).optional(),
  imageCaptions: z.array(z.string().max(300)).max(25).optional(),
  videoLinks: z.array(z.string().url()).max(25).optional(),
  externalLinks: z.array(z.string().url()).max(25).optional(),
});

function buildLeadMessage(params: {
  projectName: string;
  architectureFirm: string;
  projectLocation: string;
  shortText: string;
  longText: string;
}) {
  const intro = params.shortText.trim() || params.longText.trim().slice(0, 480);
  return [
    `New project details submission for "${params.projectName}".`,
    `Firm: ${params.architectureFirm}`,
    `Location: ${params.projectLocation}`,
    "",
    intro,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }

  const limiter = rateLimit(`submission:public:${clientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many submissions. Try again shortly." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { formData } = parsed.data;
  const db = createInsForgeServerClientPublic();
  const leadMessage = sanitizePlainText(
    buildLeadMessage({
      projectName: formData.projectName,
      architectureFirm: formData.architectureFirm,
      projectLocation: formData.projectLocation,
      shortText: formData.shortText,
      longText: formData.longText,
    }),
    8000,
  );

  const rawProjectId = formData.projectName.trim() || slugifyProject(formData.projectName);
  const project_id = rawProjectId.replace(/[\r\n\0]/g, "").slice(0, 200);
  const contactName = sanitizePlainText(
    formData.leadArchitects.trim() || formData.architectureFirm.trim(),
    200,
  );
  const contactEmail = sanitizePlainText(formData.contactEmail.trim(), 320);

  const { error } = await db.database.from("inquiries").insert([
    {
      project_id: project_id || slugifyProject(formData.projectName),
      name: contactName,
      email: contactEmail,
      message: leadMessage,
      status: "new",
      internal_notes: null,
    },
  ]);

  if (error) {
    console.error("submissions->inquiries insert:", error.message);
    return NextResponse.json({ error: "Could not submit project details right now." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
