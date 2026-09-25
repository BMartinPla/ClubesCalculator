"use client";

import { memo } from "react";
import { CATEGORY_ACCENTS } from "@/data/categories";
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

/** Stat number color/bar by level. */
function statAccent(value: number): { text: string; bar: string } {
  if (value >= 80) return { text: "text-emerald-400", bar: "bg-emerald-400" };
  if (value >= 70) return { text: "text-amber-400", bar: "bg-amber-400" };
  if (value >= 60) return { text: "text-orange-400", bar: "bg-orange-400" };
  return { text: "text-rose-500", bar: "bg-rose-500" };
}

function AttributeRowBase({ entry, onChange }: AttributeRowProps) {
  const {
    category,
    attribute,
    targetStat,
    baseStat,
    capStat,
    costTier,
    apCost,
    masteryBonus,
    physicalModifier,
    statTotal,
  } = entry;

  const accent = CATEGORY_ACCENTS[category] ?? CATEGORY_ACCENTS.Physical;
  const { text } = statAccent(statTotal);
  const span = Math.max(capStat - baseStat, 1);
  const pct = ((targetStat - baseStat) / span) * 100;
  const atBase = targetStat <= baseStat;
  const atCap = targetStat >= capStat;

  const step = (delta: number) =>
    onChange(attribute, Math.min(capStat, Math.max(baseStat, targetStat + delta)));

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}
          />
          <p className="truncate text-sm font-semibold text-zinc-100">{attribute}</p>
          {physicalModifier !== 0 && (
            <span
              title="Modificador por altura/peso"
              className={`chip shrink-0 ${
                physicalModifier > 0
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-300"
              }`}
            >
              {physicalModifier > 0 ? "+" : ""}
              {physicalModifier} Fís
            </span>
          )}
          {masteryBonus > 0 && (
            <span
              title={`${targetStat} por AP + ${masteryBonus} de maestría`}
              className="chip shrink-0 border-violet-500/40 bg-violet-500/10 text-violet-300"
            >
              +{masteryBonus} M
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`hidden chip sm:inline-flex ${TIER_STYLES[costTier]}`}
            title={`Tier de coste: ${costTier}`}
          >
            {TIER_SHORT[costTier]}
          </span>
          <span
            className={`min-w-[3.5rem] rounded-lg px-2 py-1 text-right font-mono text-xs font-bold ${
              apCost > 0
                ? "bg-zinc-800 text-zinc-100"
                : "bg-white/[0.03] text-zinc-600"
            }`}
            title="Coste en AP"
          >
            {apCost} AP
          </span>
        </div>
      </div>

      {/* Control */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atBase}
          aria-label={`Reducir ${attribute}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-lg font-bold leading-none text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <div className="relative flex-1">
          <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${accent.bar} transition-[width] duration-150`}
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

        <span
          className={`w-10 shrink-0 text-center font-mono text-lg font-black tabular-nums ${text}`}
        >
          {statTotal}
        </span>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={atCap}
          aria-label={`Aumentar ${attribute}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-lg font-bold leading-none text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-zinc-600">
        <span>
          Base <span className="font-mono text-zinc-400">{baseStat}</span>
        </span>
        <span>
          AP <span className="font-mono text-zinc-300">{targetStat}</span>
          {" · "}Tope <span className="font-mono text-zinc-400">{capStat}</span>
        </span>
      </div>
    </div>
  );
}

const AttributeRow = memo(AttributeRowBase);
export default AttributeRow;