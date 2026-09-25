"use client";

import { useEffect, useRef, useState } from "react";
import { getArchetypeIcon } from "@/data/playstyles";
import type { Archetype } from "@/types";

interface ArchetypeDropdownProps {
  archetypes: Archetype[];
  selected: string;
  onSelect: (name: string) => void;
  compact?: boolean;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ArchetypeDropdown({
  archetypes,
  selected,
  onSelect,
  compact = false,
}: ArchetypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = archetypes.find((a) => a.name === selected) ?? archetypes[0];
  const initials = current?.name.slice(0, 2).toUpperCase() ?? "";
  const icon = getArchetypeIcon(current?.name ?? "");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (name: string) => {
    onSelect(name);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative flex h-full flex-col">
      {!compact && (
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
          Active Archetype
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`focus-ring flex w-full items-center gap-2.5 rounded-lg border border-line bg-[#161a22]/60 text-left transition hover:border-line-strong ${
          compact ? "px-2.5 py-1.5" : "h-full px-3 py-2.5"
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg border border-line bg-black/30 ${
            compact ? "h-8 w-8" : "h-11 w-11"
          }`}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon}
              alt=""
              width={compact ? 26 : 34}
              height={compact ? 26 : 34}
              className={compact ? "h-6 w-6 object-contain" : "h-9 w-9 object-contain"}
            />
          ) : (
            <span className="text-sm font-black text-white">{initials}</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span
              className={`truncate font-extrabold uppercase tracking-wide text-white ${
                compact ? "text-sm" : "text-lg"
              }`}
            >
              {current?.name}
            </span>
            <span className="chip bg-white/[0.06] text-zinc-300">
              {current?.primary_position}
            </span>
          </span>
          {!compact && (
            <span className="mt-1 flex flex-wrap items-center gap-2">
              <span className="chip bg-gold/15 text-gold">
                ★ {current?.signature_playstyle_plus}+
              </span>
              <span className="text-[10px] text-muted">{current?.role}</span>
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select archetype"
          className="absolute z-40 mt-2 max-h-96 w-full origin-top animate-fade-in overflow-y-auto rounded-lg border border-line bg-[#10141d] p-1.5 shadow-2xl"
        >
          {archetypes.map((a) => {
            const isSelected = a.name === selected;
            const rowIcon = getArchetypeIcon(a.name);
            return (
              <li key={a.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => choose(a.name)}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition ${
                    isSelected ? "bg-brand/25" : "hover:bg-white/[0.05]"
                  }`}
                >
                  {rowIcon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rowIcon} alt="" width={28} height={28} className="h-7 w-7 shrink-0 object-contain" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-white">
                        {a.name}
                      </span>
                      <span className="chip bg-white/[0.06] text-muted">
                        {a.primary_position}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-gold">
                      ★ {a.signature_playstyle_plus}+
                    </span>
                  </span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-pitch" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}