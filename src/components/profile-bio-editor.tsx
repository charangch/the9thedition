"use client";

import { useState } from "react";

export function ProfileBioEditor({
  initialDisplayName,
  initialBio,
  initialWebsite,
  initialInstagramHandle,
}: {
  initialDisplayName: string;
  initialBio: string;
  initialWebsite: string;
  initialInstagramHandle: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [bio, setBio] = useState(initialBio);
  const [website, setWebsite] = useState(initialWebsite);
  const [instagramHandle, setInstagramHandle] = useState(initialInstagramHandle);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setMessage(null);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, website, instagramHandle }),
    });
    const data = (await res.json()) as { error?: string };
    setPending(false);
    if (!res.ok) {
      setMessage(data.error ?? "Could not save profile.");
      return;
    }
    setMessage("Profile updated.");
  }

  return (
    <div className="mt-8 rounded-xl border border-primary/15 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-primary">Creator profile</p>
      <div className="mt-3 grid gap-3">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="rounded-md border border-primary/20 px-3 py-2 text-sm"
        />
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Instagram-style bio (max 220 chars)"
          maxLength={220}
          rows={4}
          className="rounded-md border border-primary/20 px-3 py-2 text-sm"
        />
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website URL"
          className="rounded-md border border-primary/20 px-3 py-2 text-sm"
        />
        <input
          value={instagramHandle}
          onChange={(e) => setInstagramHandle(e.target.value)}
          placeholder="@instagram_handle"
          className="rounded-md border border-primary/20 px-3 py-2 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => void save()}
        disabled={pending}
        className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save profile"}
      </button>
      {message ? <p className="mt-2 text-xs text-charcoal/80">{message}</p> : null}
    </div>
  );
}
