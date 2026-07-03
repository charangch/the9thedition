import Link from "next/link";
import { SITE_SECTIONS } from "@/lib/site-sections";
import { SITE_BRAND } from "@/lib/site-metadata";

/** Visible section index — helps users and search engines discover main site areas (sitelinks). */
export function SiteSectionsIndex() {
  return (
    <section className="container-premium mt-12 border-t border-primary/15 pt-10" aria-labelledby="site-sections-heading">
      <h2 id="site-sections-heading" className="font-serif text-2xl text-charcoal md:text-3xl">
        Explore {SITE_BRAND}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Projects, editorial, news, and professional discovery — the main sections of theninthedition.com.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SITE_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="group flex h-full flex-col rounded-xl border border-primary/12 bg-surface p-4 transition hover:border-primary/35 hover:shadow-sm"
            >
              <h3 className="font-serif text-lg text-charcoal group-hover:text-primary">{section.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/75">{section.description}</p>
              <span className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                View {section.title.toLowerCase()} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
