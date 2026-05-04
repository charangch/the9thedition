"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { overflowNavItems, primaryNavItems } from "@/lib/content";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-primary/10 bg-background-light/90 backdrop-blur">
      <div className="container-premium flex items-center justify-between py-4">
        <Link href="/" className="flex items-center py-0.5">
          <BrandMark logoClassName="min-h-[4.5rem] justify-center md:min-h-[5.1rem]" textClassName="text-charcoal" />
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {primaryNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.18em] ${
                  active ? "text-primary" : "text-charcoal/70 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="relative flex items-center gap-2 sm:gap-3">
          <Link
            href="/newsletter"
            className="shrink-0 text-xs font-semibold text-primary hover:underline sm:text-sm"
          >
            Subscribe
          </Link>
          <span className="h-5 w-px shrink-0 bg-charcoal/15" aria-hidden />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="rounded-md border border-primary/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/80 hover:border-primary hover:text-primary"
          >
            <span aria-hidden>☰</span>
            <span className="sr-only">Menu</span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-14 w-56 rounded-xl border border-primary/15 bg-surface p-2 shadow-lg">
              <p className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                More Sections
              </p>
              {overflowNavItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-charcoal/80 hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
