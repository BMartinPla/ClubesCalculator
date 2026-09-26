"use client";

import AttributeRow from "@/components/AttributeRow";
import { CATEGORY_LABELS } from "@/data/categories";
import type { AttributeBreakdown, CategoryName } from "@/types";

interface CategorySectionProps {
  category: CategoryName;
  entries: AttributeBreakdown[];
  categoryAp: number;
  onStatChange: (attribute: string, value: number) => void;
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

  return (
    <section className="group rounded-xl border border-line bg-[linear-gradient(145deg,rgba(19,27,22,.98),rgba(13,19,16,.98))] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,.12)] transition-colors duration-200 hover:border-line-strong">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-zinc-300">
          {CATEGORY_LABELS[category]}
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
              AVG
            </span>
            <span
              className={`data-number min-w-[2rem] rounded-md border border-line bg-black/30 px-1.5 py-1 text-center text-xs font-bold ${avgColor(avg)}`}
            >
              {avg}
            </span>
          </span>
          <span
            className={`chip ${
              categoryAp > 0 ? "bg-brand/10 text-brand" : "bg-white/[0.04] text-muted"
            }`}
          >
            {categoryAp} AP
          </span>
        </div>
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
