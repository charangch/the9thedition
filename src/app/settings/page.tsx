import Link from "next/link";
import { ProfileBioEditor } from "@/components/profile-bio-editor";
import { redirect } from "next/navigation";
import { ProfilePhotoSettings } from "@/components/profile-photo-settings";
import { SiteHeader } from "@/components/site-header";
import { resolveProfileAvatarUrl } from "@/lib/avatar";
import { getProfileForUser } from "@/lib/profile";
import { getServerSession } from "@/lib/session";
import {
  getDisplayNameFromUser,
  getOAuthAvatarProviderFromUser,
  getOAuthAvatarProviderLabel,
  getOAuthAvatarUrlFromUser,
} from "@/lib/user-display";

const sidebar: { href: string; label: string; soon?: boolean }[] = [
  { href: "/settings", label: "Your account" },
  { href: "/newsletter", label: "Newsletters" },
  { href: "/settings#notifications", label: "Notifications", soon: true },
  { href: "/settings#privacy", label: "Privacy", soon: true },
  { href: "/reset-password", label: "Email & password" },
];

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?next=/settings");
  }

  const profile = await getProfileForUser(session.user.id, session.accessToken);
  const oauthAvatarUrl = getOAuthAvatarUrlFromUser(session.user);
  const oauthAvatarProvider = getOAuthAvatarProviderFromUser(session.user);
  const oauthAvatarProviderLabel = getOAuthAvatarProviderLabel(oauthAvatarProvider);
  const avatarUrl = resolveProfileAvatarUrl(session.user, profile);
  const displayName = getDisplayNameFromUser(session.user);
  const hasCustomAvatar = Boolean(profile?.custom_avatar_url?.trim());

  return (
    <>
      <SiteHeader />
      <div className="border-b border-primary/10 bg-surface">
        <div className="container-premium py-3 text-xs text-muted">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/80">{displayName}</span>
          <span className="mx-2">/</span>
          <span className="text-charcoal">Settings</span>
        </div>
      </div>

      <main className="container-premium py-10">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary/15 bg-background-light p-5 text-center sm:flex-row sm:text-left">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-white/80"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 font-serif text-xl font-semibold text-primary">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-serif text-lg text-charcoal">{displayName}</p>
                <p className="truncate text-xs text-muted">{session.user.email}</p>
              </div>
            </div>
            <nav className="space-y-1" aria-label="Settings sections">
              {sidebar.map((item) =>
                item.soon ? (
                  <span
                    key={item.label}
                    className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted"
                  >
                    {item.label}
                    <span className="text-[10px] uppercase tracking-wider">Soon</span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-charcoal/90 hover:bg-primary/10 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary/15 pb-6">
              <h1 className="font-serif text-4xl text-charcoal">Account</h1>
              <Link
                href="/me"
                className="rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary hover:bg-primary/5"
              >
                View reader profile
              </Link>
            </div>

            <section className="mt-10">
              <h2 className="font-serif text-2xl text-charcoal">Profile</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Your name comes from your account; your photo is taken from your OAuth provider (Google,
                Apple, LinkedIn) when available, or from an image you upload. Platform role:{" "}
                <span className="font-medium text-charcoal/90">{profile?.role ?? "reader"}</span>.
              </p>
              <ProfilePhotoSettings
                displayName={displayName}
                resolvedAvatarUrl={avatarUrl}
                oauthAvatarUrl={oauthAvatarUrl}
                oauthAvatarProviderLabel={oauthAvatarProviderLabel}
                hasCustomAvatar={hasCustomAvatar}
              />
              <ProfileBioEditor
                initialDisplayName={profile?.display_name?.trim() || displayName}
                initialBio={profile?.bio?.trim() || ""}
                initialWebsite={profile?.website?.trim() || ""}
                initialInstagramHandle={profile?.instagram_handle?.trim() || ""}
              />
              <dl className="mt-8 max-w-lg space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Display name
                  </dt>
                  <dd className="mt-1 rounded-lg border border-primary/15 bg-white px-3 py-2 text-charcoal">
                    {profile?.display_name?.trim() || displayName}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Email
                  </dt>
                  <dd className="mt-1 rounded-lg border border-primary/15 bg-white px-3 py-2 text-charcoal">
                    {session.user.email}
                  </dd>
                </div>
              </dl>
            </section>

            <section id="notifications" className="mt-12 scroll-mt-24 border-t border-primary/10 pt-10">
              <h2 className="font-serif text-2xl text-charcoal">Notifications</h2>
              <p className="mt-2 text-sm text-muted">
                Notification preferences will be available in a future update.
              </p>
            </section>

            <section id="privacy" className="mt-12 scroll-mt-24 border-t border-primary/10 pt-10">
              <h2 className="font-serif text-2xl text-charcoal">Privacy</h2>
              <p className="mt-2 text-sm text-muted">
                Privacy controls and data export will be linked here as the product matures.
              </p>
              <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                Back to home
              </Link>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
