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
    <section className="rounded-lg border border-line bg-[#161a22]/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
          {CATEGORY_LABELS[category]}
        </h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              AVG
            </span>
            <span
              className={`min-w-[2rem] rounded border border-line bg-black/30 px-1.5 py-0.5 text-center font-mono text-sm font-bold ${avgColor(avg)}`}
            >
              {avg}
            </span>
          </span>
          <span
            className={`chip ${
              categoryAp > 0 ? "bg-brand/20 text-rose-300" : "bg-white/[0.04] text-muted"
            }`}
          >
            {categoryAp} AP
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
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