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

/** "+1 Compostura, +2 Definicion" (skips zero bonuses). */
function bonusLabel(m: ArchetypeMastery): string {
  const parts: string[] = [];
  if (m.bonus_1 > 0) parts.push(`+${m.bonus_1} ${m.stat_1}`);
  if (m.bonus_2 > 0) parts.push(`+${m.bonus_2} ${m.stat_2}`);
  return parts.length > 0 ? parts.join(", ") : "Sin bonificación";
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
        className="relative flex max-h-[85vh] w-full max-w-2xl animate-pop-in flex-col rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-lg"
            >
              🏆
            </span>
            <div>
              <h2 id="masteries-title" className="text-lg font-bold text-zinc-50">
                Maestrías Desbloqueadas
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Las bonificaciones se aplican automáticamente a tus estadísticas
                sin consumir AP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Quick actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onMarkAll}
            className="focus-ring rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition hover:border-violet-500/70 hover:bg-violet-500/20"
          >
            Marcar Todas
          </button>
          <button
            type="button"
            onClick={onUnmarkAll}
            className="focus-ring rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            Desmarcar Todas
          </button>
          <span className="ml-auto rounded-md bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-zinc-300">
            {count} de {total} activas
          </span>
        </div>

        {/* Body */}
        <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-y-auto py-2 pr-1 md:grid-cols-2">
          {masteries.map((m) => {
            const on = Boolean(active[m.archetype]);
            return (
              <label
                key={m.archetype}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  on
                    ? "border-violet-500/50 bg-violet-950/30 text-violet-200"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12]"
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
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    on
                      ? "border-violet-400 bg-violet-500 text-zinc-950"
                      : "border-zinc-600 bg-zinc-900"
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

        {/* Footer */}
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
          >
            Confirmar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}