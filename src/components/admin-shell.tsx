"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/bug-reports", label: "Bug reports" },
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/newsletter", label: "Newsletter Ops" },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <main className="container-premium py-6 sm:py-8 md:py-10">
      <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-primary/15 bg-surface p-4 lg:sticky lg:top-20">
          <p className="px-2 text-xs uppercase tracking-[0.14em] text-primary">Admin Workspace</p>
          <nav className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1 lg:space-y-1 lg:gap-0">
            {nav.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-center text-xs sm:text-sm lg:text-left ${
                    active ? "bg-primary/10 font-medium text-primary" : "text-charcoal/80 hover:bg-primary/5"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl">{title}</h1>
            {pathname !== "/admin" ? (
              <Link
                href="/admin"
                className="rounded-full border border-primary/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary/5"
              >
                Dashboard
              </Link>
            ) : null}
          </div>
          {description ? <p className="mt-2 max-w-3xl text-sm text-muted">{description}</p> : null}
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
