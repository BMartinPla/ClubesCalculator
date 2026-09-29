"use client";

import { useEffect } from "react";
import type { ArchetypeMastery, MasteriesState } from "@/types";
import { getArchetypeIcon } from "@/data/playstyles";
import UiIcon from "@/components/UiIcon";
import { attributeNameToEn } from "@/lib/attributeNames";

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
  if (m.bonus_1 > 0) parts.push(`+${m.bonus_1} ${attributeNameToEn(m.stat_1)}`);
  if (m.bonus_2 > 0) parts.push(`+${m.bonus_2} ${attributeNameToEn(m.stat_2)}`);
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="masteries-title"
        className="relative flex max-h-[88vh] w-full max-w-3xl animate-pop-in flex-col rounded-2xl border border-line bg-[#0d130f] p-5 shadow-2xl shadow-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand"
            >
              <UiIcon name="trophy" className="h-5 w-5" />
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
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-white"
          >
            <UiIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMarkAll}
            className="focus-ring rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-bold text-brand transition hover:bg-brand/15"
          >
            Mark All
          </button>
          <button
            type="button"
            onClick={onUnmarkAll}
            className="focus-ring rounded-lg border border-line bg-surface-input px-3 py-2 text-xs font-semibold text-muted transition hover:border-line-strong hover:text-white"
          >
            Unmark All
          </button>
          <span className="data-number ml-auto rounded-md bg-white/[0.06] px-2.5 py-1.5 text-xs font-bold text-zinc-200">
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
                    ? "border-brand/40 bg-brand/10 text-zinc-100"
                    : "border-line bg-surface-input text-muted hover:border-line-strong"
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
                    on ? "border-brand bg-brand text-[#10150b]" : "border-line-strong bg-black/30"
                  }`}
                >
                  {on && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                {getArchetypeIcon(m.archetype) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getArchetypeIcon(m.archetype)} alt="" width={32} height={32} className="h-8 w-8 shrink-0 object-contain" />
                )}
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
            className="focus-ring w-full rounded-xl bg-brand px-4 py-3 text-sm font-extrabold text-[#10150b] transition hover:bg-brand-hi"
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
}
