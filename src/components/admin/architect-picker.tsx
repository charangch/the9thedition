"use client";

import { useMemo, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm text-charcoal shadow-sm outline-none transition placeholder:text-muted/60 focus:border-primary/45 focus:ring-2 focus:ring-primary/15";

type Option = { value: string; label: string; hint?: string };

export function ArchitectPicker({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");

  const studioOptions = useMemo(() => options.filter((o) => o.value !== "__new__"), [options]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return studioOptions;
    return studioOptions.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q));
  }, [studioOptions, query]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{label}</label>
        {hint ? <p className="mt-0.5 text-[11px] text-muted/90">{hint}</p> : null}
      </div>

      <input
        type="search"
        className={inputClass}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search firm or architect name…"
        aria-label="Search architects"
      />

      <p className="text-[11px] text-muted">
        {filtered.length} of {studioOptions.length} studios
        {selected && selected.value !== "__new__" ? (
          <span className="text-charcoal">
            {" "}
            · Selected: <span className="font-medium">{selected.label}</span>
          </span>
        ) : null}
      </p>

      <div className="overflow-hidden rounded-lg border border-primary/15 bg-white shadow-sm">
        <button
          type="button"
          className={`w-full border-b border-primary/10 px-3 py-2.5 text-left text-sm transition hover:bg-primary/5 ${
            value === "__new__" ? "bg-primary/10 font-medium text-primary" : "text-charcoal"
          }`}
          onClick={() => onChange("__new__")}
        >
          <span className="block">+ Create new architect / firm</span>
          <span className="block text-[10px] font-normal text-muted">New profile with optional photo and social links</span>
        </button>
        <ul className="max-h-52 overflow-y-auto" role="listbox" aria-label="Existing studios">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-muted">No studios match your search.</li>
          ) : (
            filtered.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  type="button"
                  className={`w-full border-b border-primary/8 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-primary/5 ${
                    opt.value === value ? "bg-primary/10 font-medium text-primary" : "text-charcoal"
                  }`}
                  onClick={() => onChange(opt.value)}
                >
                  <span className="block">{opt.label}</span>
                  {opt.hint ? <span className="block text-[10px] font-normal text-muted">{opt.hint}</span> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
