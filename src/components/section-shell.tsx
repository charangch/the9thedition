type SectionShellProps = {
  title: string;
  description: string;
};

export function SectionShell({ title, description }: SectionShellProps) {
  return (
    <main className="container-premium py-16">
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-muted">{description}</p>
      <div className="mt-10 rounded-2xl border border-primary/15 bg-surface p-8">
        <p className="text-sm uppercase tracking-[0.15em] text-primary">
          Planned in current build phase
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-charcoal/85">
          <li>Editorial list and detail templates with SEO metadata.</li>
          <li>CMS-driven content hydration (Directus API integration).</li>
          <li>Reader interactions (follow, bookmark, folders) where applicable.</li>
        </ul>
      </div>
    </main>
  );
}
