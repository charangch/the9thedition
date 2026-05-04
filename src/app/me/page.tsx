import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getMySubmissions } from "@/lib/my-submissions";
import { getProfileForUser } from "@/lib/profile";
import { getReaderHub } from "@/lib/reader-hub";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function MePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?next=/me");
  }
  const [profile, hub, submissions] = await Promise.all([
    getProfileForUser(session.user.id, session.accessToken),
    getReaderHub(session.accessToken),
    getMySubmissions(session.accessToken),
  ]);

  const savedProjects = hub.bookmarks.filter((b) => b.item_type === "project");

  return (
    <>
      <SiteHeader />
      <main className="container-premium py-16">
        <h1 className="font-serif text-4xl">Reader Profile</h1>
        <p className="mt-3 text-muted">
          Signed in as {session.user.email}. Role:{" "}
          <span className="font-medium">{profile?.role ?? "reader"}</span>.
        </p>
        <div className="mt-4 rounded-xl border border-primary/15 bg-surface p-4 text-sm">
          <p className="font-medium text-charcoal">{profile?.display_name?.trim() || "Your profile"}</p>
          {profile?.bio ? <p className="mt-1 text-charcoal/80">{profile.bio}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
            {profile?.instagram_handle ? <span>@{profile.instagram_handle}</span> : null}
            {profile?.website ? (
              <a href={profile.website} target="_blank" rel="noreferrer" className="text-primary underline">
                {profile.website}
              </a>
            ) : null}
            <Link href="/settings" className="text-primary underline">
              Edit profile
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Following" value={hub.counts.follows} />
          <StatCard label="Bookmarks" value={hub.counts.bookmarks} />
          <StatCard label="My Folders" value={hub.counts.folders} note="Coming next phase" />
          <StatCard
            label="Newsletter"
            value={hub.newsletter?.status === "subscribed" ? 1 : 0}
            note={hub.newsletter?.status === "subscribed" ? "Subscribed" : "Not subscribed"}
          />
        </div>

        <section className="mt-12 rounded-xl border border-primary/15 bg-surface p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary/15 pb-4">
            <div>
              <h2 className="font-serif text-3xl">My projects</h2>
              <p className="mt-2 text-sm text-muted">
                Saved editorial projects appear here. Submissions you send through Submit Project
                appear under “Your submissions”.
              </p>
            </div>
            <Link
              href="/projects"
              className="text-xs uppercase tracking-[0.16em] text-primary hover:underline"
            >
              Browse all projects
            </Link>
          </div>

          <h3 className="mt-8 font-serif text-xl">Saved projects</h3>
          {savedProjects.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No saved projects yet. Open any project and use <strong>Save to My projects</strong>.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedProjects.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/projects/${b.item_slug}`}
                    className="group flex gap-3 rounded-lg border border-primary/10 p-3 transition hover:border-primary/30"
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-charcoal/5">
                      {b.image_url ? (
                        <Image
                          src={b.image_url}
                          alt={b.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif text-sm leading-snug group-hover:text-primary">{b.title}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                        View project
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-10 font-serif text-xl">Your submissions</h3>
          {submissions.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              You have not submitted a project yet.{" "}
              <Link href="/submit" className="text-primary underline">
                Submit a project
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {submissions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-3 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-charcoal/90">{s.title}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.12em] text-primary">{s.status}</span>
                    {s.status === "published" && s.published_slug ? (
                      <Link
                        href={`/projects/${s.published_slug}`}
                        className="rounded-full border border-primary/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary/5"
                      >
                        View
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-primary/15 bg-surface p-6">
            <h2 className="font-serif text-2xl">Latest Following</h2>
            <ul className="mt-4 space-y-3">
              {hub.follows.length === 0 ? (
                <li className="text-sm text-muted">
                  You are not following any professionals/topics yet.
                </li>
              ) : (
                hub.follows.slice(0, 8).map((item) => (
                  <li key={item.id} className="border-b border-primary/10 pb-2 text-sm">
                    <span className="uppercase tracking-[0.12em] text-primary">{item.target_type}</span>{" "}
                    <span className="text-charcoal/85">{item.target_name}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section id="bookmarks" className="scroll-mt-28 rounded-xl border border-primary/15 bg-surface p-6">
            <h2 className="font-serif text-2xl">Latest Bookmarks</h2>
            <ul className="mt-4 space-y-3">
              {hub.bookmarks.length === 0 ? (
                <li className="text-sm text-muted">
                  No bookmarks yet. Save stories from projects/articles.
                </li>
              ) : (
                hub.bookmarks.slice(0, 8).map((item) => (
                  <li key={item.id} className="border-b border-primary/10 pb-2 text-sm">
                    <span className="uppercase tracking-[0.12em] text-primary">{item.item_type}</span>{" "}
                    <span className="text-charcoal/85">{item.title}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <section className="mt-10 rounded-xl border border-primary/15 bg-surface p-6">
          <h2 className="font-serif text-2xl">My folders</h2>
          {hub.folders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No folders yet. Create folders from integrations or API and save items into them.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {hub.folders.map((folder) => {
                const items = hub.folderItems.filter((item) => item.folder_id === folder.id).slice(0, 5);
                return (
                  <li key={folder.id} className="rounded-lg border border-primary/10 p-4">
                    <p className="font-medium text-charcoal">{folder.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(folder.updated_at).toLocaleDateString()} · {items.length} recent items
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-charcoal/80">
                      {items.length === 0 ? (
                        <li className="text-muted">No items in this folder yet.</li>
                      ) : (
                        items.map((item) => (
                          <li key={item.id}>
                            <span className="uppercase tracking-[0.12em] text-primary">{item.item_type}</span>{" "}
                            {item.title}
                          </li>
                        ))
                      )}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-primary/15 bg-surface p-6">
      <h2 className="text-sm uppercase tracking-[0.15em] text-primary">{label}</h2>
      <p className="mt-2 font-serif text-4xl">{value}</p>
      {note ? <p className="mt-2 text-sm text-muted">{note}</p> : null}
    </div>
  );
}
