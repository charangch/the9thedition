import Link from "next/link";
import type { CmsEntry } from "@/lib/cms";

export function CmsList({
  title,
  basePath,
  description,
  entries,
}: {
  title: string;
  basePath: string;
  description: string;
  entries: CmsEntry[];
}) {
  return (
    <section className="container-premium py-14">
      <h1 className="font-serif text-4xl text-charcoal">{title}</h1>
      <p className="mt-3 max-w-3xl text-muted">{description}</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {entries.length === 0 ? (
          <li className="rounded-xl border border-primary/15 bg-surface p-5 text-sm text-muted">
            No entries found yet. Add content in your CMS integration or keep fallback data enabled.
          </li>
        ) : (
          entries.map((item) => (
            <li key={item.id} className="rounded-xl border border-primary/15 bg-surface p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-primary">
                {item.category ?? "Editorial"}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-charcoal">
                <Link href={`${basePath}/${item.slug}`} className="hover:text-primary">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.excerpt}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
