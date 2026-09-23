"use client";

import { memo } from "react";
import type { AttributeBreakdown, CostTier } from "@/types";

interface AttributeRowProps {
  entry: AttributeBreakdown;
  onChange: (attribute: string, value: number) => void;
}

const TIER_STYLES: Record<CostTier, string> = {
  Cheapest: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  Cheap: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  Expensive: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  "Most Expensive": "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const TIER_SHORT: Record<CostTier, string> = {
  Cheapest: "Econ.",
  Cheap: "Barato",
  Expensive: "Caro",
  "Most Expensive": "Muy caro",
};

function AttributeRowBase({ entry, onChange }: AttributeRowProps) {
  const {
    attribute,
    targetStat,
    baseStat,
    capStat,
    costTier,
    apCost,
    masteryBonus,
    statTotal,
  } = entry;

  const span = Math.max(capStat - baseStat, 1);
  const pct = ((targetStat - baseStat) / span) * 100;
  const atBase = targetStat <= baseStat;
  const atCap = targetStat >= capStat;

  const step = (delta: number) =>
    onChange(attribute, Math.min(capStat, Math.max(baseStat, targetStat + delta)));

  return (
    <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-3 transition hover:border-zinc-700/80">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-semibold text-zinc-200">{attribute}</p>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`hidden rounded border px-1.5 py-0.5 text-[10px] font-semibold sm:inline ${TIER_STYLES[costTier]}`}
            title={`Tier de coste: ${costTier}`}
          >
            {TIER_SHORT[costTier]}
          </span>
          <span
            className={`w-16 rounded-md px-2 py-1 text-right font-mono text-xs font-bold ${
              apCost > 0
                ? "bg-zinc-800 text-zinc-100"
                : "bg-zinc-900 text-zinc-600"
            }`}
            title="Coste en AP"
          >
            {apCost} AP
          </span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atBase}
          aria-label={`Reducir ${attribute}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg font-bold leading-none text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <div className="relative flex-1">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
          <input
            type="range"
            min={baseStat}
            max={capStat}
            step={1}
            value={targetStat}
            onChange={(e) => onChange(attribute, Number(e.target.value))}
            className="ap-range absolute inset-x-0 -top-[9px] h-6"
            aria-label={`${attribute}: ${targetStat} (base ${baseStat}, tope ${capStat})`}
          />
        </div>

        <span className="flex w-24 shrink-0 items-center justify-end gap-1.5">
          <span className="font-mono text-base font-bold text-zinc-100">
            {statTotal}
          </span>
          {masteryBonus > 0 && (
            <span
              title={`${targetStat} por AP + ${masteryBonus} de maestría`}
              className="rounded border border-violet-500/50 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-violet-200"
            >
              (+{masteryBonus} Maestría)
            </span>
          )}
        </span>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={atCap}
          aria-label={`Aumentar ${attribute}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-lg font-bold leading-none text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-zinc-600">
        <span>
          Base: <span className="font-mono text-zinc-400">{baseStat}</span>
        </span>
        <span>
          AP <span className="font-mono text-zinc-400">{targetStat}</span>
          {" · "}Tope: <span className="font-mono text-zinc-400">{capStat}</span>
        </span>
      </div>
    </div>
  );
}

const AttributeRow = memo(AttributeRowBase);
export default AttributeRow;
