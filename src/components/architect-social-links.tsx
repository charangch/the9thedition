import Link from "next/link";

export type ArchitectSocialLinksModel = {
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
};

export function ArchitectSocialLinks({ socials, className = "" }: { socials: ArchitectSocialLinksModel; className?: string }) {
  const items = [
    { label: "Website", href: socials.website },
    { label: "Instagram", href: socials.instagram },
    { label: "Facebook", href: socials.facebook },
    { label: "YouTube", href: socials.youtube },
  ].filter((i) => i.href?.trim());

  if (!items.length) return null;

  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Studio links</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-primary/20 px-3 py-1 text-xs uppercase tracking-[0.1em] text-primary hover:bg-primary/5"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
