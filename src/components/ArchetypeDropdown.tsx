"use client";

import { useEffect, useRef, useState } from "react";
import type { Archetype } from "@/types";

interface ArchetypeDropdownProps {
  archetypes: Archetype[];
  selected: string;
  onSelect: (name: string) => void;
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ArchetypeDropdown({
  archetypes,
  selected,
  onSelect,
}: ArchetypeDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = archetypes.find((a) => a.name === selected) ?? archetypes[0];
  const initials = current?.name.slice(0, 2).toUpperCase() ?? "";

  // Close on outside click / Escape.
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
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-left transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-xs font-black text-zinc-950 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
          {initials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-lg font-black tracking-tight text-zinc-100">
              {current?.name}
            </span>
            <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-bold text-zinc-300">
              {current?.primary_position}
            </span>
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
              ★ {current?.signature_playstyle_plus}+
            </span>
            <span className="text-[10px] text-zinc-500">{current?.role}</span>
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          aria-label="Seleccionar arquetipo"
          className="absolute z-40 mt-2 max-h-96 w-full origin-top animate-fade-in overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl backdrop-blur-md"
        >
          {archetypes.map((a) => {
            const isSelected = a.name === selected;
            return (
              <li key={a.id} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => choose(a.name)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                    isSelected ? "bg-zinc-800/80" : "hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-zinc-100">
                        {a.name}
                      </span>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                        {a.primary_position}
                      </span>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-amber-300">
                        ★ {a.signature_playstyle_plus}+
                      </span>
                      {a.specializations.length > 0 && (
                        <span className="truncate text-[10px] text-zinc-500">
                          {a.specializations.join(" · ")}
                        </span>
                      )}
                    </span>
                  </span>
                  {isSelected && <CheckIcon className="h-4 w-4 shrink-0 text-emerald-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}