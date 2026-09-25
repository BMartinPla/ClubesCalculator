"use client";

import { memo } from "react";
import { attributeNameToEn } from "@/lib/attributeNames";
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

const TIER_LABEL: Record<CostTier, string> = {
  Cheapest: "Cheapest",
  Cheap: "Cheap",
  Expensive: "Expensive",
  "Most Expensive": "Most Exp.",
};

/** Stat number color by level (web palette). */
function statColor(value: number): string {
  if (value >= 80) return "text-pitch";
  if (value >= 70) return "text-gold";
  if (value >= 60) return "text-orange-400";
  return "text-rose-500";
}

function AttributeRowBase({ entry, onChange }: AttributeRowProps) {
  const {
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

  const span = Math.max(capStat - baseStat, 1);
  const pct = ((targetStat - baseStat) / span) * 100;
  const atBase = targetStat <= baseStat;
  const atCap = targetStat >= capStat;

  const step = (delta: number) =>
    onChange(attribute, Math.min(capStat, Math.max(baseStat, targetStat + delta)));

  return (
    <div className="rounded border border-line bg-[#11151f] px-2.5 py-1.5 transition hover:border-line-strong">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[12px] font-semibold text-zinc-100">
            {attributeNameToEn(attribute)}
          </p>
          {physicalModifier !== 0 && (
            <span
              title="Height/weight modifier"
              className={`chip shrink-0 ${
                physicalModifier > 0
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "bg-rose-500/15 text-rose-300"
              }`}
            >
              {physicalModifier > 0 ? "+" : ""}
              {physicalModifier}
            </span>
          )}
          {masteryBonus > 0 && (
            <span
              title="Mastery bonus"
              className="chip shrink-0 bg-violet-500/15 text-violet-300"
            >
              +{masteryBonus}M
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`hidden chip lg:inline-flex ${TIER_STYLES[costTier]}`}
            title={`Cost tier: ${costTier}`}
          >
            {TIER_LABEL[costTier]}
          </span>
          <span
            className={`min-w-[2.6rem] rounded px-1.5 py-0.5 text-right font-mono text-[10px] font-bold ${
              apCost > 0 ? "bg-white/[0.06] text-white" : "text-muted"
            }`}
            title="AP cost"
          >
            {apCost} AP
          </span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atBase}
          aria-label={`Decrease ${attribute}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-line bg-black/20 text-sm font-bold leading-none text-zinc-300 transition hover:border-line-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <div className="relative flex-1">
          <input
            type="range"
            min={baseStat}
            max={capStat}
            step={1}
            value={targetStat}
            onChange={(e) => onChange(attribute, Number(e.target.value))}
            className="ap-range"
            aria-label={`${attribute}: ${targetStat} (base ${baseStat}, max ${capStat})`}
          />
        </div>

        <span
          className={`w-8 shrink-0 text-center font-mono text-base font-extrabold tabular-nums ${statColor(statTotal)}`}
        >
          {statTotal}
        </span>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={atCap}
          aria-label={`Increase ${attribute}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-line bg-black/20 text-sm font-bold leading-none text-zinc-300 transition hover:border-line-strong hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

const AttributeRow = memo(AttributeRowBase);
export default AttributeRow;