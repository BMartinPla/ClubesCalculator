"use client";

import {
  PLAYSTYLES,
  getPlayStyle,
  getPlusSlotCount,
  getSilverSlotCount,
} from "@/data/playstyles";
import { ATTRIBUTE_ID_TO_INTERNAL, attributeLabel } from "@/lib/attributeNames";
import type { Archetype } from "@/types";

interface PlayStylesPanelProps {
  level: number;
  archetype: Archetype;
  statTotals: Record<string, number>;
  selection: (string | null)[];
  onOpenPicker: (slotIndex: number) => void;
  onClear: (slotIndex: number) => void;
}

/** Is a requirement met by the current build stats? */
function reqMet(
  req: { attributeId: string; min: number },
  statTotals: Record<string, number>,
): boolean {
  const name = ATTRIBUTE_ID_TO_INTERNAL[req.attributeId] ?? req.attributeId;
  return (statTotals[name] ?? 0) >= req.min;
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
    <div className="panel flex h-full flex-col p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="panel-title">PlayStyles</h2>
        <span className="chip bg-white/[0.05] text-muted">
          Lv {level} · {silverSlots}/{getSilverSlotCount(40)} slots
        </span>
      </div>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => {
          const locked = i >= silverSlots;
          const id = locked ? null : selection[i] ?? null;
          const ps = getPlayStyle(id);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={locked}
                onClick={() => (locked ? undefined : onOpenPicker(i))}
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition ${
                  locked
                    ? "cursor-not-allowed border-rose-500/25 bg-black/40 opacity-50"
                    : ps
                      ? "border-pitch bg-pitch/10"
                      : "border-dashed border-line-strong bg-black/20 hover:border-brand"
                }`}
                aria-label={ps ? ps.name : "Empty slot"}
              >
                {ps ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ps.icon} alt={ps.name} width={38} height={38} />
                ) : (
                  <span className="text-lg text-muted">{locked ? "🔒" : "+"}</span>
                )}
              </button>
              <span className="w-full truncate text-center text-[10px] text-muted">
                {locked ? `Lv ${[5, 15, 40][i]}` : ps ? ps.name : "Empty"}
              </span>
              {ps && !locked && (
                <button
                  type="button"
                  onClick={() => onClear(i)}
                  className="text-[9px] text-muted hover:text-rose-400"
                >
                  clear
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Requirements */}
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
                        ok ? "bg-pitch/15 text-pitch" : "bg-rose-500/15 text-rose-300"
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

      {/* PlayStyle+ */}
      {plusSlots > 0 && signature && (
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={signature.iconplus} alt={signature.name} width={34} height={34} />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold">
              PlayStyle+ ({plusSlots})
            </p>
            <p className="truncate text-sm font-semibold text-amber-200">
              {signature.name} +
            </p>
          </div>
        </div>
      )}
    </div>
  );
}