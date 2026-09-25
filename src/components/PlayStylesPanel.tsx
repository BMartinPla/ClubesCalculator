"use client";

import {
  PLAYSTYLES,
  getPlayStyle,
  getPlusSlotCount,
  getSilverSlotCount,
} from "@/data/playstyles";
import { attributeLabel } from "@/lib/attributeNames";
import type { Archetype } from "@/types";

interface PlayStylesPanelProps {
  level: number;
  archetype: Archetype;
  statTotals: Record<string, number>;
  selection: (string | null)[];
  onOpenPicker: (slotIndex: number) => void;
  onClear: (slotIndex: number) => void;
}

function reqMet(
  req: { attributeId: string; min: number },
  statTotals: Record<string, number>,
): boolean {
  return (statTotals[attributeLabel(req.attributeId)] ?? 0) >= req.min;
}

export default function PlayStylesPanel({
  level,
  archetype,
  statTotals,
  selection,
  onOpenPicker,
  onClear,
}: PlayStylesPanelProps) {
  const silverSlots = getSilverSlotCount(level);
  const plusSlots = getPlusSlotCount(level);
  const signature =
    PLAYSTYLES.find((p) => p.name === archetype.signature_playstyle_plus) ?? null;

  return (
    <div className="panel flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-zinc-100">
          PlayStyles
        </h2>
        <span className="chip border-white/10 bg-white/[0.04] text-zinc-400">
          Nivel {level} · {silverSlots} slot{silverSlots === 1 ? "" : "s"}
        </span>
      </div>

      {/* Silver slots */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: Math.max(silverSlots, 1) }).map((_, i) => {
          const id = i < silverSlots ? selection[i] ?? null : null;
          const ps = getPlayStyle(id);
          const locked = i >= silverSlots;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={locked}
                onClick={() => (locked ? undefined : onOpenPicker(i))}
                className={`flex h-14 w-14 items-center justify-center rounded-xl border transition ${
                  locked
                    ? "cursor-not-allowed border-white/[0.04] bg-white/[0.01] opacity-40"
                    : ps
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-dashed border-white/15 bg-white/[0.02] hover:border-white/30"
                }`}
                aria-label={ps ? ps.name : "Slot vacío"}
              >
                {ps ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ps.icon} alt={ps.name} width={38} height={38} />
                ) : (
                  <span className="text-lg text-zinc-600">+</span>
                )}
              </button>
              <span className="w-full truncate text-center text-[10px] text-zinc-400">
                {locked
                  ? `Nivel ${[5, 15, 40][i]}`
                  : ps
                    ? ps.name
                    : "Vacío"}
              </span>
              {ps && !locked && (
                <button
                  type="button"
                  onClick={() => onClear(i)}
                  className="text-[9px] text-zinc-600 hover:text-rose-400"
                >
                  quitar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Requirements of the selected playstyles */}
      <div className="mt-3 space-y-1.5">
        {selection
          .slice(0, silverSlots)
          .filter(Boolean)
          .map((id) => {
            const ps = getPlayStyle(id)!;
            return (
              <div key={id} className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold text-zinc-300">
                  {ps.name}:
                </span>
                {ps.requirements.map((r) => {
                  const ok = reqMet(r, statTotals);
                  return (
                    <span
                      key={r.attributeId}
                      className={`chip ${
                        ok
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      {attributeLabel(r.attributeId)} ≥ {r.min}
                    </span>
                  );
                })}
              </div>
            );
          })}
      </div>

      {/* PlayStyle+ (signature) */}
      {plusSlots > 0 && signature && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signature.iconplus} alt={signature.name} width={32} height={32} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
              PlayStyle+ ({plusSlots})
            </p>
            <p className="truncate text-xs font-semibold text-amber-200">
              {signature.name} +
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
