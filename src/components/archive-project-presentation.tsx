"use client";

import Image from "next/image";
import Link from "next/link";
import { BlockRenderer } from "@/components/block-renderer";
import { LikeShareBar } from "@/components/like-share-bar";
import { editorialGalleryPaths, editorialHeroPath } from "@/lib/editorial-collection-images";
import type { ArchiveProjectViewModel } from "@/lib/builder/archive-project-view-model";

function heroSrc(item: ArchiveProjectViewModel["item"]) {
  const url = item.hero_image_url?.trim();
  if (url && (url.startsWith("http") || url.startsWith("/"))) return url;
  return editorialHeroPath("archive", item.slug);
}

export function ArchiveProjectPresentation({ model }: { model: ArchiveProjectViewModel }) {
  const { item, related, path, editorialBlocks, leadBlocks } = model;
  const hero = heroSrc(item);
  const gallery =
    item.image_urls?.length > 0
      ? item.image_urls.slice(0, 6)
      : editorialGalleryPaths("archive", item.slug);

  return (
    <main className="container-premium pb-16 pt-10">
      <nav className="text-xs uppercase tracking-[0.16em] text-muted">
        <Link href="/archive" className="hover:text-primary">
          Archive
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal/80">{item.title}</span>
      </nav>

      <header className="mt-6 border-b border-primary/15 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {item.category}
          {item.location ? ` · ${item.location}` : ""}
        </p>
        <h1 className="mt-3 max-w-4xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">{item.title}</h1>
        {item.byline ? <p className="mt-3 text-sm text-muted">{item.byline}</p> : null}
        {item.excerpt ? <p className="mt-4 max-w-3xl text-lg leading-relaxed text-charcoal/85">{item.excerpt}</p> : null}
      </header>

      <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-xl border border-primary/15 bg-charcoal/5">
        <Image
          src={hero}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1200px"
          priority
          unoptimized={hero.startsWith("/api/")}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <BlockRenderer
            blocks={editorialBlocks}
            context={{ pageType: "project", slug: item.slug, title: item.title }}
          />
          {gallery.length > 1 ? (
            <section className="rounded-2xl border border-primary/10 bg-surface p-5">
              <h2 className="font-serif text-2xl">Gallery</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {gallery.map((src, i) => (
                  <div key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-charcoal/5">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 400px"
                      unoptimized={src.startsWith("/api/")}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="space-y-6">
          <BlockRenderer blocks={leadBlocks} context={{ pageType: "project", slug: item.slug, title: item.title }} />
          <div className="rounded-xl border border-primary/12 bg-white p-4">
            <LikeShareBar storageId={`archive:${item.slug}`} sharePath={path} title={item.title} />
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="mt-14 border-t border-primary/15 pt-10">
          <h2 className="font-serif text-2xl">Related archive projects</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rel) => (
              <li key={rel.slug}>
                <Link href={`/archive/${rel.slug}`} className="group block overflow-hidden rounded-lg border border-primary/12 bg-white">
                  <div className="relative aspect-[16/10] bg-charcoal/5">
                    <Image
                      src={editorialHeroPath("archive", rel.slug)}
                      alt={rel.title}
                      fill
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="25vw"
                    />
                  </div>
                  <p className="p-3 font-serif text-sm leading-snug group-hover:text-primary">{rel.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
