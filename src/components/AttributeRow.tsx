"use client";

import { memo, type CSSProperties } from "react";
import { attributeNameToEn } from "@/lib/attributeNames";
import { getSinglePointCost } from "@/lib/buildEngine";
import type { AttributeBreakdown } from "@/types";

interface AttributeRowProps {
  entry: AttributeBreakdown;
  onChange: (attribute: string, value: number) => void;
}

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
  const rangeStyle = { "--range-progress": `${pct}%` } as CSSProperties;
  const atBase = targetStat <= baseStat;
  const atCap = targetStat >= capStat;
  const nextPointCost = atCap ? null : getSinglePointCost(targetStat + 1, costTier);

  const step = (delta: number) =>
    onChange(attribute, Math.min(capStat, Math.max(baseStat, targetStat + delta)));

  const raised = targetStat > baseStat;
  const gained = targetStat - baseStat;

  return (
    <div
      className={`relative rounded-lg border px-2.5 pb-2 pt-1.5 transition-colors duration-150 ${
        raised
          ? "border-brand/20 bg-brand/[0.035] hover:border-brand/35"
          : "border-transparent bg-[#0a100d]/80 hover:border-line hover:bg-[#0c130f]"
      }`}
    >
      {raised && (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-brand/70"
        />
      )}

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
                  ? "bg-brand/10 text-brand"
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
              className="chip shrink-0 bg-gold/10 text-gold"
            >
              +{masteryBonus}M
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {raised && (
            <span
              className="data-number text-[10px] font-medium text-muted"
              title={`Base ${baseStat}, trained +${gained}`}
            >
              {baseStat}
              <span className="text-brand"> +{gained}</span>
            </span>
          )}
          <span
            className={`data-number min-w-[3.1rem] rounded-md border px-1.5 py-0.5 text-center text-[10px] font-semibold ${
              nextPointCost !== null
                ? "border-line bg-black/25 text-zinc-300"
                : "border-gold/30 bg-gold/10 text-gold"
            }`}
            title={
              nextPointCost === null
                ? "Attribute is at its maximum"
                : `Next point costs ${nextPointCost} AP (${costTier})`
            }
            aria-label={
              nextPointCost === null
                ? "Attribute is at its maximum"
                : `Next point costs ${nextPointCost} AP`
            }
          >
            {nextPointCost === null ? "MAX" : `+${nextPointCost} AP`}
          </span>
        </div>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atBase}
          aria-label={`Decrease ${attribute}`}
          className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface/80 text-sm font-bold leading-none text-zinc-300 transition hover:border-line-strong hover:bg-surface-raised hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
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
            style={rangeStyle}
            aria-label={`${attribute}: ${targetStat} (base ${baseStat}, max ${capStat})`}
          />
        </div>

        <button
          type="button"
          onClick={() => step(1)}
          disabled={atCap}
          aria-label={`Increase ${attribute}`}
          className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface/80 text-sm font-bold leading-none text-zinc-300 transition hover:border-brand/40 hover:bg-brand/10 hover:text-brand active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
        >
          +
        </button>

        <span
          className={`data-number w-9 shrink-0 text-right text-lg font-bold leading-none tabular-nums ${statColor(statTotal)}`}
        >
          {statTotal}
        </span>
      </div>
    </div>
  );
}

const AttributeRow = memo(AttributeRowBase);
export default AttributeRow;
