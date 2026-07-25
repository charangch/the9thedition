"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
      className={cn("shrink-0 transition-colors", filled ? "text-[#9a3b3b]" : "text-charcoal/50", className)}
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
          strokeWidth="1.5"
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
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const shareBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  useLayoutEffect(() => {
    if (!shareOpen || !shareBtnRef.current) {
      setMenuPos(null);
      return;
    }
    const update = () => {
      const rect = shareBtnRef.current!.getBoundingClientRect();
      const menuWidth = 210;
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - menuWidth - 8,
      );
      setMenuPos({ top: rect.bottom + 8, left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [shareOpen]);

  useEffect(() => {
    if (!shareOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (shareBtnRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setShareOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShareOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
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
      label: "Share on X",
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
  ];

  const displayCount = count == null ? "—" : formatLikeCount(count);
  const btnPad = compact ? "h-9 px-3" : "h-10 px-3.5";
  const labelSize = compact ? "text-[11px]" : "text-xs";

  const menu =
    mounted && shareOpen && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
            className="w-[13.25rem] overflow-hidden rounded-lg border border-charcoal/10 bg-[#faf8f4] py-1 shadow-[0_12px_40px_-12px_rgba(40,32,24,0.35)]"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] tracking-wide text-charcoal/90 transition hover:bg-charcoal/[0.04]"
              onClick={() => {
                void openShareNative();
              }}
            >
              Share…
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] tracking-wide text-charcoal/90 transition hover:bg-charcoal/[0.04]"
              onClick={() => {
                void copyText(fullUrl, "Link copied");
                setShareOpen(false);
              }}
            >
              Copy link
            </button>
            <div className="my-1 border-t border-charcoal/8" />
            {shareLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className="flex w-full px-3.5 py-2 text-left text-[13px] tracking-wide text-charcoal/85 transition hover:bg-charcoal/[0.04]"
                onClick={() => {
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={cn("relative z-20 flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Like and share"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        disabled={likeBusy}
        aria-pressed={liked}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void toggleLike();
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border transition disabled:opacity-50",
          btnPad,
          liked
            ? "border-[#c4a4a4]/60 bg-[#f7efef] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
            : "border-charcoal/12 bg-[#faf8f4]/90 hover:border-charcoal/25 hover:bg-white",
        )}
      >
        <HeartIcon filled={liked} className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        <span
          className={cn(
            "font-medium tabular-nums tracking-[0.04em] text-charcoal/85",
            labelSize,
          )}
        >
          {displayCount}
        </span>
        <span className="sr-only">{liked ? "Unlike" : "Like"}</span>
      </button>

      <button
        ref={shareBtnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={shareOpen}
        aria-controls={shareOpen ? menuId : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShareOpen((o) => !o);
        }}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-charcoal/12 bg-[#faf8f4]/90 font-medium tracking-[0.08em] text-charcoal/80 uppercase transition hover:border-charcoal/25 hover:bg-white hover:text-charcoal",
          btnPad,
          labelSize,
        )}
      >
        <ShareGlyph className={compact ? "h-3.5 w-3.5" : "h-3.5 w-3.5"} />
        Share
      </button>

      {menu}

      {hint ? (
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted" aria-live="polite">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function ShareGlyph({ className }: { className?: string }) {
  return (
    <svg className={cn("shrink-0 text-charcoal/55", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="18" cy="5" r="2.1" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="2.1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.6 13.5l6.8 3.98M15.4 6.52L8.58 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
