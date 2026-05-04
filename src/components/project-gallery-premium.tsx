import Image from "next/image";

function unopt(src: string) {
  return src.startsWith("/api/generated-image");
}

export function ProjectGalleryPremium({
  title,
  images,
}: {
  title: string;
  images: string[];
}) {
  if (!images.length) return null;
  const hero = images[0];
  const rest = images.slice(1);
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-charcoal">Project Gallery</h2>
      <p className="mt-2 text-sm text-muted">
        Frames below are on-site generated graphics for layout and image SEO—swap for project photography when
        available.
      </p>
      <div className="mt-4 space-y-4">
        <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-primary/10">
          <Image
            src={hero}
            alt={`${title} hero`}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            unoptimized={unopt(hero)}
          />
        </div>
        {rest.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {rest.map((src, i) => (
              <div key={`${src}-${i}`} className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-primary/10">
                <div className={`relative ${i % 3 === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <Image
                    src={src}
                    alt={`${title} gallery ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 33vw"
                    unoptimized={unopt(src)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
