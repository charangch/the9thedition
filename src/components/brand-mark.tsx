"use client";

import { cn } from "@/lib/utils";

const ARCH_LOGO_SRC = "/images/brand/edition-arch-logo.png";

type BrandMarkProps = {
  className?: string;
  /** Applied to the outer wrapper (layout / min height). */
  logoClassName?: string;
  /** Base tone for the wordmark stack (serif line uses full contrast). */
  textClassName?: string;
};

/**
 * Official arch + column + “9” mark (author asset) to the left of the masthead.
 */
export function BrandMark({ className, logoClassName, textClassName }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3 md:gap-4", logoClassName, className)}>
      <span
        className="relative isolate flex h-[4.5rem] w-[3.9rem] shrink-0 items-center justify-center sm:h-[4.65rem] sm:w-[4.05rem] md:h-[5.1rem] md:w-[4.35rem]"
        aria-hidden
      >
        {/* Plain mark: no ring/shadow/card — sits flush with page background */}
        <img
          src={ARCH_LOGO_SRC}
          alt=""
          width={220}
          height={256}
          className="h-full w-full object-contain object-center"
          decoding="async"
          fetchPriority="high"
        />
      </span>
      <div
        className={cn(
          "flex min-w-0 flex-col items-start gap-0.5 leading-none",
          textClassName ?? "text-charcoal",
        )}
      >
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.42em] text-muted">
          The
        </span>
        <span className="font-serif text-[1.7rem] tracking-[-0.03em] text-charcoal md:text-[1.95rem]">
          9th
        </span>
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-muted">
          Edition
        </span>
      </div>
    </div>
  );
}
