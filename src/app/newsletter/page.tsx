import { SiteHeader } from "@/components/site-header";
import { NewsletterPanel } from "@/components/newsletter-panel";

export default async function NewsletterPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-premium py-14">
        <section className="rounded-2xl border border-primary/15 bg-surface p-7">
          <p className="text-[11px] uppercase tracking-[0.16em] text-primary">Newsletter</p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl md:text-5xl">Editorial Briefing</h1>
          <p className="mt-3 max-w-3xl text-sm text-charcoal/85">
            Subscribe for architecture news, products, project insights, event announcements, and market
            intelligence. All rights reserved by the9thedition.
          </p>
        </section>
        <div className="mt-8">
          <NewsletterPanel />
        </div>
      </main>
    </>
  );
}
