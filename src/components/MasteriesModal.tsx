"use client";

import { useEffect } from "react";
import type { ArchetypeMastery, MasteriesState } from "@/types";

interface MasteriesModalProps {
  open: boolean;
  onClose: () => void;
  masteries: ArchetypeMastery[];
  active: MasteriesState;
  onToggle: (archetype: string) => void;
  onMarkAll: () => void;
  onUnmarkAll: () => void;
}

/** "+1 Composure, +2 Finishing" (skips zero bonuses). */
function bonusLabel(m: ArchetypeMastery): string {
  const parts: string[] = [];
  if (m.bonus_1 > 0) parts.push(`+${m.bonus_1} ${m.stat_1}`);
  if (m.bonus_2 > 0) parts.push(`+${m.bonus_2} ${m.stat_2}`);
  return parts.length > 0 ? parts.join(", ") : "No bonus";
}

export default function MasteriesModal({
  open,
  onClose,
  masteries,
  active,
  onToggle,
  onMarkAll,
  onUnmarkAll,
}: MasteriesModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const total = masteries.length;
  const count = masteries.filter((m) => active[m.archetype]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="masteries-title"
        className="relative flex max-h-[85vh] w-full max-w-2xl animate-pop-in flex-col rounded-xl border border-line bg-[#0c0f16] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-brand/40 bg-brand/15 text-lg"
            >
              🏆
            </span>
            <div>
              <h2 id="masteries-title" className="text-lg font-extrabold uppercase tracking-wide text-white">
                Unlocked Masteries
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Bonuses apply automatically to your stats without spending AP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-muted transition hover:bg-white/[0.06] hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMarkAll}
            className="focus-ring rounded border border-violet-500/50 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-500/25"
          >
            Mark All
          </button>
          <button
            type="button"
            onClick={onUnmarkAll}
            className="focus-ring rounded border border-line bg-black/20 px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-white"
          >
            Unmark All
          </button>
          <span className="ml-auto rounded bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-zinc-200">
            {count} of {total} active
          </span>
        </div>

        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto py-2 pr-1 md:grid-cols-2">
          {masteries.map((m) => {
            const on = Boolean(active[m.archetype]);
            return (
              <label
                key={m.archetype}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  on
                    ? "border-violet-500/50 bg-violet-950/40 text-violet-200"
                    : "border-line bg-black/20 text-muted hover:border-line-strong"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggle(m.archetype)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                    on ? "border-violet-400 bg-violet-500 text-black" : "border-line-strong bg-black/30"
                  }`}
                >
                  {on && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {m.archetype}
                  </span>
                  <span className="block truncate text-[11px] opacity-80">
                    {bonusLabel(m)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring w-full rounded-lg bg-brand px-4 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-hi"
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
}