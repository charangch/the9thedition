import Image from "next/image";
import Link from "next/link";
import { featuredStories } from "@/lib/content";

export function StoryGrid() {
  return (
    <section className="container-premium py-14">
      <div className="mb-7 flex items-end justify-between">
        <h2 className="font-serif text-3xl">Trending Stories</h2>
        <Link href="/projects" className="text-sm uppercase tracking-[0.16em] text-primary">
          Explore all
        </Link>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {featuredStories.map((story) => (
          <article key={story.title} className="rounded-xl bg-surface">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={story.image}
                alt={story.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="pt-4">
              <h3 className="font-serif text-xl leading-snug">{story.title}</h3>
              <p className="mt-2 text-sm text-muted">{story.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
