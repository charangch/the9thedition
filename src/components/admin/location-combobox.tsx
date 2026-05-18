"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { filterLocationSuggestions } from "@/lib/admin/location-suggestions";

const inputClass =
  "w-full rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/45 focus:ring-2 focus:ring-primary/15";

export function LocationCombobox({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => setQuery(value), [value]);

  const suggestions = useMemo(() => filterLocationSuggestions(query, 14), [query]);

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
        placeholder="City, state, or country"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onBlur={() => onChange(query.trim())}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-primary/15 bg-white py-1 shadow-lg"
        >
          {suggestions.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-primary/5"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(loc);
                  setQuery(loc);
                  setOpen(false);
                }}
              >
                {loc}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
