import { architects } from "@/lib/architects";
import type { ProfessionalRow } from "@/lib/professionals-db";

export type ArchitectOption =
  | { kind: "db"; id: string; slug: string; firm: string; name: string }
  | { kind: "static"; slug: string; firm: string; name: string };

/** Same merge as /professionals — DB studios plus curated static profiles. */
export function buildArchitectOptions(dbProfessionals: ProfessionalRow[]): ArchitectOption[] {
  const db: ArchitectOption[] = dbProfessionals.map((p) => ({
    kind: "db",
    id: p.id,
    slug: p.slug,
    firm: p.firm,
    name: p.name,
  }));

  const staticOpts: ArchitectOption[] = architects
    .filter((a) => !dbProfessionals.some((p) => p.slug === a.slug))
    .map((a) => ({
      kind: "static",
      slug: a.slug,
      firm: a.firm,
      name: a.name,
    }));

  return [...db, ...staticOpts].sort((a, b) => a.firm.localeCompare(b.firm));
}

export function architectOptionValue(option: ArchitectOption): string {
  return option.kind === "db" ? `db:${option.id}` : `static:${option.slug}`;
}

export function parseArchitectOptionValue(value: string): { kind: "db"; id: string } | { kind: "static"; slug: string } | null {
  if (value.startsWith("db:")) return { kind: "db", id: value.slice(3) };
  if (value.startsWith("static:")) return { kind: "static", slug: value.slice(7) };
  return null;
}
