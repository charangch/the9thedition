"use client";

import type { SubmissionFormData } from "@/lib/submission-template";
import { countWords } from "@/lib/submission-template";

function SectionCard({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white/85 p-5 shadow-inner shadow-primary/[0.03]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{kicker}</p>
      <h4 className="mt-1 font-serif text-lg text-charcoal">{title}</h4>
      {intro ? <p className="mt-2 text-xs leading-relaxed text-muted">{intro}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{children}</label>
      {hint ? <p className="mt-0.5 text-[11px] leading-snug text-muted/90">{hint}</p> : null}
    </div>
  );
}

type FieldHelpers = {
  fieldInput: string;
  str: (key: keyof SubmissionFormData) => string;
  setStr: (key: keyof SubmissionFormData, value: string) => void;
  val: <K extends keyof SubmissionFormData>(key: K) => SubmissionFormData[K] | undefined;
  setVal: <K extends keyof SubmissionFormData>(key: K, value: SubmissionFormData[K]) => void;
  projectName: string;
  setProjectName: (v: string) => void;
  longText: string;
  setLongText: (v: string) => void;
};

export function PublishingQueueEditFields({
  contentType,
  helpers,
}: {
  contentType: "project" | "student";
  helpers: FieldHelpers;
}) {
  const { fieldInput, str, setStr, val, setVal, projectName, setProjectName, longText, setLongText } = helpers;
  const isProjectLike = contentType === "project" || contentType === "student";
  const studentNote =
    contentType === "student"
      ? "Student work uses the same ArchDaily-style structure as projects; school or studio maps to Architecture Firm."
      : undefined;

  if (isProjectLike) {
    return (
      <div className="space-y-4">
        {studentNote ? (
          <p className="rounded-xl border border-primary/12 bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-charcoal/90">
            {studentNote}
          </p>
        ) : null}

        <SectionCard
          kicker="ArchDaily · General information"
          title="Project identity & contacts"
          intro="Aligned with the Unbuilt Project publication form: use clear credits and accurate contact details."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label hint="Maps to the public project name and URL slug.">Project Name</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name"
              />
            </div>
            <div>
              <Label>Architecture Firm</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("architectureFirm")}
                onChange={(e) => setStr("architectureFirm", e.target.value)}
                placeholder="Architecture Firm"
              />
            </div>
            <div>
              <Label>Website</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("website")}
                onChange={(e) => setStr("website", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label>Contact e-mail</Label>
              <input
                className={`${fieldInput} mt-2`}
                type="email"
                value={str("contactEmail")}
                onChange={(e) => setStr("contactEmail", e.target.value)}
                placeholder="contact@studio.com"
              />
            </div>
            <div>
              <Label>Firm Location</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("firmLocation")}
                onChange={(e) => setStr("firmLocation", e.target.value)}
                placeholder="City, country"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-6 border-t border-primary/8 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary/30"
                  checked={Boolean(val("isCompetitionEntry"))}
                  onChange={(e) => setVal("isCompetitionEntry", e.target.checked)}
                />
                Is your project a competition entry?
              </label>
              <span className="text-xs text-muted">—</span>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="text-muted">Will your project be realized?</span>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="willBeRealized"
                    checked={val("willBeRealized") === "yes"}
                    onChange={() => setVal("willBeRealized", "yes")}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="willBeRealized"
                    checked={val("willBeRealized") === "no"}
                    onChange={() => setVal("willBeRealized", "no")}
                  />
                  No
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="willBeRealized"
                    checked={val("willBeRealized") === "unknown" || val("willBeRealized") === undefined}
                    onChange={() => setVal("willBeRealized", "unknown")}
                  />
                  Unknown
                </label>
              </div>
            </div>
            <div>
              <Label>Competition name</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("competitionName")}
                onChange={(e) => setStr("competitionName", e.target.value)}
                placeholder="If applicable"
              />
            </div>
            <div>
              <Label>Competition website</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("competitionWebsite")}
                onChange={(e) => setStr("competitionWebsite", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label>Completion Year (if applies)</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("completionYear")}
                onChange={(e) => setStr("completionYear", e.target.value)}
                placeholder="e.g. 2026"
              />
            </div>
            <div>
              <Label>Gross Built Area</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("grossBuiltArea")}
                onChange={(e) => setStr("grossBuiltArea", e.target.value)}
                placeholder="e.g. 2,450 m²"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Project location</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("projectLocation")}
                onChange={(e) => setStr("projectLocation", e.target.value)}
                placeholder="City, region, country"
              />
            </div>
            <div>
              <Label>Lead Architects</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("leadArchitects")}
                onChange={(e) => setStr("leadArchitects", e.target.value)}
                placeholder="Names"
              />
            </div>
            <div>
              <Label>Lead Architects e-mail</Label>
              <input
                className={`${fieldInput} mt-2`}
                type="email"
                value={str("leadArchitectsEmail")}
                onChange={(e) => setStr("leadArchitectsEmail", e.target.value)}
                placeholder="lead@studio.com"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          kicker="ArchDaily · Media provider"
          title="Credits & moving image"
          intro="Renderings credits and primary video link; additional uploads are managed under Asset URLs below."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Renderings credits</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("renderCredits")}
                onChange={(e) => setStr("renderCredits", e.target.value)}
                placeholder="e.g. Mir, XYZ Visuals"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Video link</Label>
              <input
                className={`${fieldInput} mt-2`}
                value={str("videoLink")}
                onChange={(e) => setStr("videoLink", e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          kicker="ArchDaily · Additional credits"
          title="Design team & collaborators"
          intro="Design Team, Clients, Engineering, Landscape, Consultants, Collaborators, and other credits."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Design Team</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("designTeam")}
                onChange={(e) => setStr("designTeam", e.target.value)}
                placeholder="Names and roles"
              />
            </div>
            <div>
              <Label>Clients</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("clients")}
                onChange={(e) => setStr("clients", e.target.value)}
              />
            </div>
            <div>
              <Label>Engineering</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("engineering")}
                onChange={(e) => setStr("engineering", e.target.value)}
              />
            </div>
            <div>
              <Label>Landscape</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("landscape")}
                onChange={(e) => setStr("landscape", e.target.value)}
              />
            </div>
            <div>
              <Label>Consultants</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("consultants")}
                onChange={(e) => setStr("consultants", e.target.value)}
              />
            </div>
            <div>
              <Label>Collaborators</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[72px] resize-y`}
                value={str("collaborators")}
                onChange={(e) => setStr("collaborators", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Etc.</Label>
              <textarea
                className={`${fieldInput} mt-2 min-h-[80px] resize-y`}
                value={str("additionalCreditsEtc")}
                onChange={(e) => setStr("additionalCreditsEtc", e.target.value)}
                placeholder="Any other credits"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          kicker="ArchDaily · Project description"
          title="Editorial copy"
          intro="Short text for round-ups (up to 80 words). Long text for a separate feature (200–500 words). Both publish as received."
        >
          <div>
            <Label hint="Used if the work is selected for round-ups of unbuilt projects. It will not be edited by the editorial team—check credits and spelling.">
              Short text (up to 80 words)
            </Label>
            <textarea
              className={`${fieldInput} mt-2 min-h-[100px] resize-y`}
              value={str("shortText")}
              onChange={(e) => setStr("shortText", e.target.value)}
              placeholder="Up to 80 words"
            />
            <p className={`mt-1 text-xs ${countWords(str("shortText")) <= 80 ? "text-muted" : "text-red-700"}`}>
              Word count: {countWords(str("shortText"))}/80
            </p>
          </div>
          <div>
            <Label hint="Used for a separate feature. Not rewritten—clear credits and grammar speed up review.">
              Long text (200–500 words)
            </Label>
            <textarea
              className={`${fieldInput} mt-2 min-h-[200px] resize-y`}
              value={longText}
              onChange={(e) => setLongText(e.target.value)}
              placeholder="200–500 words"
            />
            <p
              className={`mt-1 text-xs ${
                countWords(longText) >= 200 && countWords(longText) <= 500 ? "text-muted" : "text-red-700"
              }`}
            >
              Word count: {countWords(longText)} (target 200–500)
            </p>
          </div>
        </SectionCard>
      </div>
    );
  }

  return null;
}
