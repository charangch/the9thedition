"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { NewsletterPanel } from "@/components/newsletter-panel";

type Props = {
  signals: string[];
  highlights: string[];
};

export function NewsLanding({ signals, highlights }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <section className="border-b border-primary/10 bg-gradient-to-b from-surface to-background-light">
        <div className="container-premium py-12 md:py-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">News desk</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-charcoal md:text-4xl">
              Industry signals & editorial briefings
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-charcoal/75">
              Short reads on material trends, studio workflows, and the built environment—paired with our
              searchable architecture news index below. Subscribe for weekly digests.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-premium py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16">
          <div className="space-y-12">
            <section>
              <h3 className="font-serif text-2xl text-charcoal">Signals</h3>
              <p className="mt-2 text-sm text-muted">Curated notes we&apos;re tracking this season.</p>
              <ul className="mt-6 space-y-4 border-l-2 border-primary/25 pl-5">
                {signals.map((line) => (
                  <li key={line} className="text-sm leading-relaxed text-charcoal/85">
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="font-serif text-2xl text-charcoal">From the briefing list</h3>
              <ul className="mt-4 space-y-3">
                {highlights.map((line) => (
                  <li
                    key={line}
                    className="rounded-lg border border-primary/10 bg-surface px-4 py-3 text-sm text-charcoal/85"
                  >
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
                <Link href="/articles" className="text-primary hover:underline">
                  Articles →
                </Link>
                <Link href="/archive" className="text-primary hover:underline">
                  Archive →
                </Link>
              </div>
            </section>
          </div>

          <aside className="lg:pt-2">
            <NewsletterPanel />
          </aside>
        </div>
      </div>
    </>
  );
}
