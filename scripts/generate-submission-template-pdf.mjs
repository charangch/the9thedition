/**
 * Generates a minimal programmatic checklist PDF for local/dev use only.
 * The editorial submission template shipped in the app is
 * `public/documents/the9thedition-premium-submission-template.pdf` (design asset).
 * Run: npm run generate:submission-pdf
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "documents");
const outFile = path.join(outDir, "the9thedition-submission-template-generated.pdf");

const MARGIN = 54;
const LINE = 13.5;
const PAGE_W = 612;
const PAGE_H = 792;

function wrapLine(font, text, maxW, size) {
  const words = text.split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(trial, size) <= maxW) cur = trial;
    else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function main() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const sections = [
    { title: "the9thedition — Project submission template", body: [], bold: true },
    {
      title: "",
      body: [
        "Complete this checklist and email your package to letters@theninthedition.com with the subject line:",
        "SUBMISSION — [Project name] — [City, Country]",
        "Attach the filled PDF plus imagery/video links (or use a single cloud folder link).",
      ],
    },
    {
      title: "1. General information",
      body: [
        "Project title (as it should appear in publication)",
        "Architecture / design office name",
        "Office website URL",
        "Contact email for follow-up questions",
        "Office location (city, country)",
        "Competition entry?  Yes / No    If yes — competition name + competition website",
        "Will the project be built?  Yes / No / Unknown",
        "Completion year (if applicable) or “Unbuilt”",
        "Gross built area (m² or ft²) or “N/A — unbuilt”",
        "Project location (city, region, country)",
        "Lead architects (names)",
        "Lead architects’ email(s)",
      ],
    },
    {
      title: "2. Media & credits",
      body: [
        "Primary hero / key renders: minimum long edge 2880 px, JPG or PNG, RGB, sRGB profile preferred.",
        "Drawings: JPG (plans, sections, diagrams) — legible line weights; include scale where relevant.",
        "Name each render folder or file with credit lines, e.g. “Courtesy of [Office] / Visualization by [Studio]”.",
        "Video: one public link (YouTube or Vimeo preferred). Optional: short GIF links for motion studies.",
        "List all third-party visualizations, photographers, and model photographers explicitly.",
      ],
    },
    {
      title: "3. Project description (two lengths)",
      body: [
        "Short summary — up to 80 words. Used for round-ups / listings if selected. Will be published as supplied; proofread carefully.",
        "Long narrative — 200–500 words. Used for a dedicated feature if selected. Not rewritten by editors; clear credits and grammar speed review.",
      ],
    },
    {
      title: "4. Build details & team",
      body: [
        "Design team (names + roles)",
        "Clients / developer (if shareable)",
        "Structural / MEP / façade / lighting consultants",
        "Landscape architect (if any)",
        "Other collaborators (acoustics, sustainability, etc.)",
      ],
    },
    {
      title: "5. Folder structure (recommended)",
      body: [
        "ProjectName_ArchitectureOffice/",
        "  Renders (2880px)/CourtesyOf___By___/",
        "  Drawings (jpg)/",
        "  Other media (GIFs, YouTube, Vimeo links).txt",
        "  Text/short-summary.txt and long-narrative.txt",
      ],
    },
    {
      title: "Rights",
      body: [
        "By submitting you confirm you control or have written permission to publish all text and images supplied.",
      ],
    },
  ];

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;
  const maxW = PAGE_W - 2 * MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  const drawParagraph = (lines, size, bold) => {
    const f = bold ? fontBold : font;
    for (const line of lines) {
      if (y < MARGIN + 40) newPage();
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: f,
        color: rgb(0.12, 0.12, 0.11),
      });
      y -= LINE * (size / 11);
    }
    y -= LINE * 0.35;
  };

  for (const sec of sections) {
    if (sec.title) {
      const titleLines = wrapLine(fontBold, sec.title, maxW, 13);
      drawParagraph(titleLines, 13, true);
    }
    for (const para of sec.body) {
      const lines = wrapLine(font, para, maxW, 11);
      drawParagraph(lines, 11, false);
    }
    y -= LINE * 0.5;
  }

  fs.mkdirSync(outDir, { recursive: true });
  const bytes = await pdf.save();
  fs.writeFileSync(outFile, bytes);
  console.log("Wrote", outFile, `(${bytes.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
