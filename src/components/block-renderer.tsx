import Image from "next/image";
import { ProjectEnquiryForm } from "@/components/project-enquiry-form";
import { type LayoutBlock, normalizeLayoutBlocks } from "@/lib/layout-blocks";

type Props = {
  blocks: unknown;
  context: {
    pageType: "project" | "article";
    slug: string;
    title: string;
  };
};

function renderBlock(block: LayoutBlock, context: Props["context"]) {
  if (block.type === "HeroImage") {
    if (!block.imageUrl) return null;
    return (
      <section key={block.id} className="overflow-hidden rounded-2xl border border-primary/10 bg-surface">
        <div className="relative aspect-[16/9]">
          <Image src={block.imageUrl} alt={block.title ?? context.title} fill className="object-cover" />
        </div>
        {(block.title || block.subtitle) && (
          <div className="p-5">
            {block.title ? <h2 className="font-serif text-3xl text-charcoal">{block.title}</h2> : null}
            {block.subtitle ? <p className="mt-2 text-sm text-muted">{block.subtitle}</p> : null}
          </div>
        )}
      </section>
    );
  }
  if (block.type === "EditorialText") {
    return (
      <section key={block.id} className="rounded-2xl border border-primary/10 bg-surface p-6">
        {block.heading ? <h3 className="font-serif text-2xl text-charcoal">{block.heading}</h3> : null}
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-charcoal/90">{block.body}</p>
      </section>
    );
  }
  if (block.type === "MasonryGallery") {
    if (!block.images.length) return null;
    return (
      <section key={block.id} className="rounded-2xl border border-primary/10 bg-surface p-5">
        <h3 className="font-serif text-2xl text-charcoal">Gallery</h3>
        <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {block.images.map((item, index) => (
            <figure key={`${item.url}-${index}`} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-primary/10 bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={item.url} alt={`${context.title} image ${index + 1}`} fill className="object-cover" />
              </div>
              {item.caption ? <figcaption className="px-3 py-2 text-xs text-muted">{item.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </section>
    );
  }
  if (block.type === "ProjectFactSheet") {
    return (
      <section key={block.id} className="rounded-2xl border border-primary/10 bg-surface p-5">
        <h3 className="font-serif text-2xl text-charcoal">Project Facts</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {block.facts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`} className="rounded-lg border border-primary/10 bg-white p-3">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-primary">{fact.label}</dt>
              <dd className="mt-1 text-sm text-charcoal/85">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }
  if (block.type === "AdSlot") {
    return (
      <section key={block.id} className="rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 to-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.14em] text-primary">Sponsored</p>
        {block.title ? <h3 className="mt-2 font-serif text-2xl text-charcoal">{block.title}</h3> : null}
        {block.imageUrl ? (
          <div className="relative mt-3 aspect-[16/7] overflow-hidden rounded-xl border border-primary/10">
            <Image src={block.imageUrl} alt={block.title ?? "Ad"} fill className="object-cover" />
          </div>
        ) : null}
        {block.ctaText && block.ctaUrl ? (
          <a
            href={block.ctaUrl}
            className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            {block.ctaText}
          </a>
        ) : null}
      </section>
    );
  }
  if (block.type === "LeadInquiryForm") {
    return (
      <section key={block.id} className="rounded-2xl border border-primary/10 bg-surface p-5">
        {block.heading ? <h3 className="font-serif text-2xl text-charcoal">{block.heading}</h3> : null}
        <div className="mt-4">
          <ProjectEnquiryForm projectSlug={context.slug} projectTitle={context.title} />
        </div>
      </section>
    );
  }
  return null;
}

export function BlockRenderer({ blocks, context }: Props) {
  const parsed = normalizeLayoutBlocks(blocks);
  if (!parsed.length) return null;
  return <div className="space-y-6">{parsed.map((block) => renderBlock(block, context))}</div>;
}
