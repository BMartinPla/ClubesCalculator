"use client";

import AttributeRow from "@/components/AttributeRow";
import { CATEGORY_ACCENTS, CATEGORY_LABELS } from "@/data/categories";
import type { AttributeBreakdown, CategoryName } from "@/types";

interface CategorySectionProps {
  category: CategoryName;
  entries: AttributeBreakdown[];
  categoryAp: number;
  onStatChange: (attribute: string, value: number) => void;
}

/** Bar fill for the AVG meter, matching the text color scale. */
function avgBar(value: number): string {
  if (value >= 80) return "bg-pitch";
  if (value >= 70) return "bg-gold";
  if (value >= 60) return "bg-orange-400";
  return "bg-rose-500";
}

/** Web-style AVG color. */
function avgColor(value: number): string {
  if (value >= 80) return "text-pitch";
  if (value >= 70) return "text-gold";
  if (value >= 60) return "text-orange-400";
  return "text-rose-500";
}

export default function CategorySection({
  category,
  entries,
  categoryAp,
  onStatChange,
}: CategorySectionProps) {
  const avg = Math.round(
    entries.reduce((s, e) => s + e.statTotal, 0) / Math.max(1, entries.length),
  );

  const accent = CATEGORY_ACCENTS[category];
  const raisedCount = entries.filter((e) => e.targetStat > e.baseStat).length;

  return (
    <section className="group relative overflow-hidden rounded-xl border border-line bg-[linear-gradient(160deg,rgba(21,30,24,.98),rgba(12,18,15,.98))] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,.14),inset_0_1px_0_rgba(255,255,255,.025)] transition-colors duration-200 hover:border-line-strong">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-100">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${accent.dot}`} />
          {CATEGORY_LABELS[category]}
          {raisedCount > 0 && (
            <span className="data-number text-[10px] font-medium normal-case tracking-normal text-muted">
              {raisedCount}/{entries.length} trained
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
              AVG
            </span>
            <span
              className={`data-number min-w-[2rem] rounded-md border border-line bg-black/30 px-1.5 py-0.5 text-center text-sm font-bold ${avgColor(avg)}`}
            >
              {avg}
            </span>
          </span>
          <span
            className={`chip data-number ${
              categoryAp > 0 ? "bg-brand/10 text-brand" : "bg-white/[0.04] text-muted"
            }`}
          >
            {categoryAp} AP
          </span>
        </div>
      </div>

      <div
        className="mb-3 h-1 overflow-hidden rounded-full bg-white/[0.05]"
        role="presentation"
      >
        <div
          className={`h-full rounded-full opacity-80 transition-[width] duration-300 ${avgBar(avg)}`}
          style={{ width: `${Math.min(100, Math.max(0, avg))}%` }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {entries.map((entry) => (
          <AttributeRow
            key={entry.attribute}
            entry={entry}
            onChange={onStatChange}
          />
        ))}
      </div>
    </section>
  );
}
