import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon, YouTubeIcon } from "@/components/social-brand-icons";
import { SITE_SECTIONS } from "@/lib/site-sections";
import { EDITORIAL_EMAIL, SUPPORT_EMAIL } from "@/lib/site-contact";
import { SITE_FACEBOOK_URL, SITE_INSTAGRAM_URL } from "@/lib/site-social";

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/15 bg-surface">
      <div className="container-premium grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <BrandMark logoClassName="min-h-[3.5rem] sm:min-h-[4rem] md:min-h-[5.1rem]" textClassName="text-charcoal" />
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted">
            Premium architecture, design, culture, and editorial intelligence from The 9th Edition.
          </p>
          <p className="mt-3 text-xs text-muted">
            Newsletter & editorial:{" "}
            <a href={`mailto:${EDITORIAL_EMAIL}`} className="text-primary hover:underline">
              {EDITORIAL_EMAIL}
            </a>
            <br />
            Support:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
        <nav className="md:col-span-2" aria-label="Site sections">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Sections</p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {SITE_SECTIONS.slice(0, 6).map((section) => (
              <li key={section.href}>
                <Link href={section.href} className="group block">
                  <span className="text-sm font-medium text-charcoal group-hover:text-primary">{section.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{section.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-primary">Social</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={SITE_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/90 text-charcoal transition hover:border-primary hover:shadow-sm"
            >
              <InstagramIcon />
            </a>
            <a
              href={SITE_FACEBOOK_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/90 transition hover:border-primary hover:shadow-sm"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/90 transition hover:border-primary hover:shadow-sm"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/90 transition hover:border-primary hover:shadow-sm"
            >
              <YouTubeIcon />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-white/90 text-charcoal transition hover:border-primary hover:shadow-sm"
            >
              <XIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/10 py-4">
        <div className="container-premium flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.12em] text-charcoal/70">
          <Link href="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link href="/cookies" className="hover:text-primary">
            Cookies
          </Link>
          <Link href="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link href="/report-bug" className="hover:text-primary">
            Report a bug
          </Link>
          <Link href="/newsletter" className="hover:text-primary">
            Newsletter
          </Link>
          <Link href="/awards" className="hover:text-primary">
            Awards
          </Link>
        </div>
      </div>
      <div className="border-t border-primary/10 py-4 text-center text-[11px] text-muted">
        <div className="container-premium flex flex-wrap items-center justify-center gap-3">
          <span>
            © {new Date().getFullYear()} the9thedition. All rights reserved. Editorial content and trademarks are protected.
          </span>
          <Link href="/login" className="font-semibold uppercase tracking-[0.12em] text-primary hover:underline">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
