import Link from "next/link";
import type { EditorsRadarItem } from "@/lib/content";

type Props = {
  items: EditorsRadarItem[];
};

/**
 * Scrollable editorial themes — each card links to a project or section (not a truncated static ticker).
 */
export function EditorsRadar({ items }: Props) {
  if (items.length === 0) return null;

  const total = items.length;

  return (
    <section
      className="border-y border-primary/15 bg-gradient-to-b from-surface to-background-light/80"
      aria-labelledby="editors-radar-heading"
    >
      <div className="container-premium py-4 md:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
          <div className="max-w-sm shrink-0">
            <p
              id="editors-radar-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
            >
              Editor&apos;s radar
            </p>
            <p className="mt-1.5 text-sm leading-snug text-charcoal/75">
              Short themes we&apos;re following.{" "}
              <span className="text-muted">Scroll sideways on mobile — each card opens a project or section.</span>
            </p>
            <Link
              href="/articles"
              className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.14em] text-primary underline-offset-4 hover:underline"
            >
              Articles &amp; features →
            </Link>
          </div>

          <div className="relative min-w-0 flex-1 md:pt-1">
            <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden px-1 pb-1 pt-0.5 [scrollbar-width:thin] md:gap-3">
              {items.map((item, i) => (
                <Link
                  key={`${item.href}-${i}`}
                  href={item.href}
                  className="group flex max-w-[min(100%,18rem)] shrink-0 snap-start flex-col rounded-xl border border-primary/20 bg-surface/90 px-4 py-3 shadow-sm transition hover:border-primary/45 hover:bg-white hover:shadow-md md:max-w-xs"
                >
                  <span className="text-[10px] font-medium tabular-nums text-muted">
                    {i + 1} / {total}
                  </span>
                  <span className="mt-2 text-sm leading-snug text-charcoal/90 group-hover:text-primary">
                    {item.text}
                  </span>
                  <span className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted group-hover:text-primary/80">
                    Open →
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-muted md:hidden" aria-hidden>
              ← Swipe for more →
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
