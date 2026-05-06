"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  /** Stable id for localStorage + server like aggregate (e.g. `project:slug`). */
  storageId: string;
  /** Absolute path starting with `/` used for share & copy. */
  sharePath: string;
  title: string;
  className?: string;
  compact?: boolean;
};

const LIKE_KEY_PREFIX = "t9e_like_";

function formatLikeCount(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("shrink-0", filled ? "text-[#e11d48]" : "text-charcoal/55", className)}
      aria-hidden
    >
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      )}
    </svg>
  );
}

function useLiked(storageId: string) {
  const key = `${LIKE_KEY_PREFIX}${storageId}`;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      setLiked(localStorage.getItem(key) === "1");
    } catch {
      /* ignore */
    }
  }, [key]);

  const setLikedPersist = useCallback(
    (next: boolean) => {
      setLiked(next);
      try {
        if (next) localStorage.setItem(key, "1");
        else localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return { liked, setLikedPersist };
}

export function LikeShareBar({ storageId, sharePath, title, className, compact }: Props) {
  const { liked, setLikedPersist } = useLiked(storageId);
  const [count, setCount] = useState<number | null>(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const shareWrapRef = useRef<HTMLDivElement>(null);

  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath.startsWith("/") ? sharePath : `/${sharePath}`}`
      : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/public/likes?target=${encodeURIComponent(storageId)}`);
        const j = (await r.json()) as { count?: number; error?: string };
        if (!cancelled && typeof j.count === "number") setCount(j.count);
      } catch {
        if (!cancelled) setCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageId]);

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [shareOpen]);

  const showHint = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 2400);
  };

  const toggleLike = async () => {
    if (likeBusy) return;
    setLikeBusy(true);
    const action = liked ? "unlike" : "like";
    const prevCount = count ?? 0;
    const prevLiked = liked;
    setLikedPersist(!liked);
    setCount((c) => {
      const base = c ?? 0;
      return Math.max(0, base + (action === "like" ? 1 : -1));
    });
    try {
      const r = await fetch("/api/public/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: storageId, action }),
      });
      const j = (await r.json()) as { count?: number; error?: string };
      if (!r.ok) throw new Error(j.error ?? "request failed");
      if (typeof j.count === "number") setCount(j.count);
    } catch {
      setLikedPersist(prevLiked);
      try {
        const r = await fetch(`/api/public/likes?target=${encodeURIComponent(storageId)}`);
        const j = (await r.json()) as { count?: number };
        if (typeof j.count === "number") setCount(j.count);
        else setCount(prevCount);
      } catch {
        setCount(prevCount);
      }
      showHint("Could not update like");
    } finally {
      setLikeBusy(false);
    }
  };

  const copyText = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showHint(okMsg);
    } catch {
      showHint("Could not copy");
    }
  };

  const openShareNative = async () => {
    const url = fullUrl;
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
        showHint("Shared");
      } else {
        await copyText(url, "Link copied");
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      await copyText(url, "Link copied");
    } finally {
      setShareOpen(false);
    }
  };

  const openWindow = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=580,height=520");
    setShareOpen(false);
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      id: "x",
      label: "X",
      onSelect: () =>
        openWindow(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`),
    },
    {
      id: "facebook",
      label: "Facebook",
      onSelect: () => openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      onSelect: () =>
        openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`),
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      onSelect: () =>
        openWindow(`https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`),
    },
    {
      id: "email",
      label: "Email",
      onSelect: () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        setShareOpen(false);
      },
    },
    {
      id: "instagram",
      label: "Instagram (copy caption)",
      onSelect: () =>
        void copyText(`${title}\n${fullUrl}`, "Caption copied — paste in Instagram"),
    },
  ];

  const displayCount = count == null ? "—" : formatLikeCount(count);

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", compact ? "" : "gap-3", className)}
      role="group"
      aria-label="Like and share"
    >
      <button
        type="button"
        disabled={likeBusy || count == null}
        aria-pressed={liked}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggleLike();
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border transition disabled:opacity-50",
          compact ? "px-2.5 py-1.5" : "px-3 py-2",
          liked
            ? "border-[#fecaca] bg-[#fff1f2] hover:border-[#fca5a5]"
            : "border-primary/20 bg-white/90 hover:border-primary/40",
        )}
      >
        <HeartIcon filled={liked} className={compact ? "h-4 w-4" : "h-[18px] w-[18px]"} />
        <span className={cn("font-semibold tabular-nums text-charcoal", compact ? "text-xs" : "text-sm")}>
          {displayCount}
        </span>
        <span className="sr-only">{liked ? "Unlike" : "Like"}</span>
      </button>

      <div ref={shareWrapRef} className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShareOpen((o) => !o);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/90 font-semibold text-charcoal transition hover:border-primary/40",
            compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
          )}
        >
          <ShareGlyph className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          Share
        </button>
        {shareOpen ? (
          <div
            className="absolute left-1/2 top-[calc(100%+6px)] z-50 w-[min(12.5rem,calc(100vw-1rem))] -translate-x-1/2 rounded-xl border border-primary/15 bg-surface py-1.5 shadow-lg sm:left-0 sm:w-[12.5rem] sm:translate-x-0"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-charcoal hover:bg-primary/5"
              onClick={() => {
                void openShareNative();
              }}
            >
              <PhoneShareGlyph className="h-4 w-4 shrink-0 text-primary" />
              More / system share…
            </button>
            <div className="my-1 border-t border-primary/10" />
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-charcoal hover:bg-primary/5"
              onClick={() => {
                void copyText(fullUrl, "Link copied");
                setShareOpen(false);
              }}
            >
              <LinkGlyph className="h-4 w-4 shrink-0 text-primary" />
              Copy link
            </button>
            <div className="my-1 border-t border-primary/10" />
            {shareLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="flex w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-primary/5"
                onClick={() => {
                  item.onSelect();
                  setShareOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {hint ? (
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted" aria-live="polite">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function ShareGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn("shrink-0 text-charcoal/70", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="6" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18" cy="19" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.6 13.5l6.8 3.98M15.4 6.52L8.58 10.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function LinkGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </svg>
  );
}

function PhoneShareGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M10 18h4" strokeLinecap="round" />
    </svg>
  );
}
