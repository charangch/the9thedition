"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/45 focus:ring-2 focus:ring-primary/15";

type Option = { value: string; label: string; hint?: string };

export function SearchableSelect({
  label,
  hint,
  value,
  options,
  placeholder = "Search…",
  emptyLabel = "No matches",
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: Option[];
  placeholder?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (selected) setQuery(selected.label);
  }, [selected?.label, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 40);
    return options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q)).slice(0, 40);
  }, [options, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</label>
      {hint ? <p className="mt-0.5 text-[11px] text-muted/90">{hint}</p> : null}
      <input
        className={`${inputClass} mt-2`}
        value={query}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      {open ? (
        <ul
          id={listId}
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-primary/15 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted">{emptyLabel}</li>
          ) : (
            filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/5 ${
                    opt.value === value ? "bg-primary/10 font-medium text-primary" : "text-charcoal"
                  }`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(opt.value);
                    setQuery(opt.label);
                    setOpen(false);
                  }}
                >
                  <span className="block">{opt.label}</span>
                  {opt.hint ? <span className="block text-[10px] text-muted">{opt.hint}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
