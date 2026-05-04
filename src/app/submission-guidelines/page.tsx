import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { LETTERS_EMAIL } from "@/lib/site-contact";
import { getSiteUrl } from "@/lib/site-url";

const TEMPLATE_HREF = "/documents/the9thedition-premium-submission-template.pdf";
const TEMPLATE_DOWNLOAD_NAME = "the9thedition-premium-submission-template.pdf";

export const metadata: Metadata = {
  title: "Submission guidelines | the9thedition",
  description:
    "How to prepare built and unbuilt work for editorial review: folder structure, imagery, video, build details, and downloadable submission template.",
  alternates: { canonical: `${getSiteUrl()}/submission-guidelines` },
};

const checklist = [
  {
    title: "How to send your work",
    items: [
      `Email **${LETTERS_EMAIL}** with the subject line: \`SUBMISSION — [Project title] — [City, Country]\`.`,
      "Attach the completed PDF template (download below) **and** either zipped media or a **single cloud folder link** (Drive, Dropbox, WeTransfer) with read access.",
      "One thread per project. Replies stay on the same email chain so editors can track versions.",
    ],
  },
  {
    title: "1. General information",
    items: [
      "**Project title** — exactly as it should appear if published.",
      "**Architecture / design office** (legal name as credited).",
      "**Office website** and **primary contact email** for follow-up.",
      "**Office location** (city, country).",
      "**Competition entry?** Yes / No — if yes: competition name + official competition URL.",
      "**Realization status** — built, under construction, unbuilt, or unknown.",
      "**Year** — completion, expected completion, or “Unbuilt”.",
      "**Gross built area** — m² or ft²; use “N/A” for purely unbuilt studies.",
      "**Project location** — city, region, country (as precise as you can share).",
      "**Lead architects** (names) and **lead contact email(s)**.",
    ],
  },
  {
    title: "2. Imagery & drawings",
    items: [
      "**Hero renders / key visuals** — long edge at least **2880 px**, JPG or PNG, RGB, **sRGB** preferred. Avoid upscaled low-resolution files.",
      "**Drawings** — exported as **JPG** (plans, sections, diagrams). Keep line weights legible at web scale; include scale bars where relevant.",
      "**Credit naming** — for each batch of images, use clear filenames or subfolders, e.g. `Courtesy of [Office] / Visualization by [Studio]` (match your contract credits).",
      "Provide **alt-style captions** in a plain text file if helpful (optional but speeds layout).",
    ],
  },
  {
    title: "3. Video & other media",
    items: [
      "**Primary video** — one public link (**YouTube** or **Vimeo** preferred). Add chapter timestamps if the film is long.",
      "**GIFs or motion loops** — optional; host on a stable URL or include files in the media folder.",
      "List **music / voice-over / film credits** if the piece is not silent.",
    ],
  },
  {
    title: "4. Project text (two lengths)",
    items: [
      "**Short summary — up to 80 words.** Used for listings and round-ups if selected. Published **as supplied** — proofread names, credits, and spelling.",
      "**Long narrative — 200–500 words.** Used for a **dedicated feature** if selected. Not rewritten from scratch; clean copy and correct credits make review faster.",
      "Both texts should be `.txt` or `.docx` inside your `Text/` folder, or pasted into the PDF template fields.",
    ],
  },
  {
    title: "5. Build details & extended credits",
    items: [
      "**Design team** — names and roles.",
      "**Client / developer** — when shareable under your agreement.",
      "**Engineering** — structural, MEP, façade, lighting, acoustics, etc.",
      "**Landscape** and **other consultants** (sustainability, heritage, PM).",
      "**Collaborators** — photographers, CGI studios, models, researchers.",
    ],
  },
  {
    title: "6. Recommended folder layout",
    items: [
      "`ProjectName_ArchitectureOffice/`",
      "`Renders (2880px)/CourtesyOf___By___/` — grouped hero frames with credit in folder names.",
      "`Drawings (jpg)/` — plans, sections, diagrams.",
      "`Other media/` — links file for GIFs, YouTube, Vimeo (one `.txt` or `.md` is fine).",
      "`Text/` — `short-summary.txt`, `long-narrative.txt`, plus this completed PDF.",
    ],
  },
  {
    title: "Rights & permissions",
    items: [
      "By submitting you confirm you have the **rights** to publish all text, images, drawings, and video supplied, including third-party visualizations and photography.",
      "If any asset is embargoed or location-sensitive, state that explicitly in the email body.",
    ],
  },
];

function RichLine({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-charcoal">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export default function SubmissionGuidelinesPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium pb-20 pt-10 md:pt-14">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">For contributors</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-charcoal md:text-5xl">
            Editorial submission guidelines
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
            Use this page to assemble a complete package for built or unbuilt architecture and interiors. The structure
            follows common international editorial practice for competition and unbuilt features (similar to reference
            packs used by leading design media).
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Download</p>
            <p className="mt-2 font-serif text-2xl text-charcoal">Submission checklist (PDF)</p>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Fill in the fields, then attach it to your email with media or a folder link.
            </p>
          </div>
          <a
            href={TEMPLATE_HREF}
            download={TEMPLATE_DOWNLOAD_NAME}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:opacity-95"
          >
            Download template PDF
          </a>
        </div>

        <div className="mt-8 rounded-xl border border-primary/12 bg-background-light p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Send completed packages to</p>
          <p className="mt-2 font-serif text-2xl">
            <a href={`mailto:${LETTERS_EMAIL}`} className="text-charcoal hover:text-primary">
              {LETTERS_EMAIL}
            </a>
          </p>
          <p className="mt-2 text-sm text-muted">
            Newsletter and general editorial questions stay on{" "}
            <a href="mailto:editorial@theninthedition.com" className="text-primary hover:underline">
              editorial@theninthedition.com
            </a>
            ; use <strong className="text-charcoal/90">{LETTERS_EMAIL}</strong> for publication intake with attachments.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {checklist.map((section) => (
            <section key={section.title}>
              <h2 className="border-b border-primary/15 pb-2 font-serif text-2xl text-charcoal">{section.title}</h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-charcoal/85 md:text-[15px]">
                {section.items.map((item) => (
                  <li key={item}>
                    <RichLine text={item} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-primary/15 bg-surface p-6 md:p-8">
          <h2 className="font-serif text-2xl text-charcoal">Ready to submit?</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            When your folder matches the checklist, email{" "}
            <a href={`mailto:${LETTERS_EMAIL}`} className="font-medium text-primary hover:underline">
              {LETTERS_EMAIL}
            </a>{" "}
            with a clear subject line and links or attachments. The desk reviews in order of receipt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={TEMPLATE_HREF}
              download={TEMPLATE_DOWNLOAD_NAME}
              className="rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal hover:border-primary"
            >
              Download PDF again
            </a>
            <Link
              href="/submit"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:opacity-95"
            >
              Email submission overview
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-primary/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal hover:border-primary"
            >
              Browse published work
            </Link>
          </div>
        </div>

        <p className="mt-10 text-xs text-muted">
          Reference pack reviewed for structure: industry-standard unbuilt / competition submission layout (folders for
          renders, drawings, media, and text). the9thedition is an independent publication.
        </p>
      </main>
    </>
  );
}
