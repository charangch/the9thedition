"use client";

type Props = {
  slug: string;
  title: string;
  imageUrl: string;
};

export function SaveProjectButton({ slug, title, imageUrl }: Props) {
  void slug;
  void title;
  void imageUrl;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled
        className="rounded-full border border-primary/30 bg-surface px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal hover:border-primary disabled:opacity-70"
      >
        Reader save disabled
      </button>
      <span className="text-sm text-muted">Public reader accounts are disabled in this workflow.</span>
    </div>
  );
}
