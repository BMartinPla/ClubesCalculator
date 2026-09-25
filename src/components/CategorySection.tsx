"use client";

import AttributeRow from "@/components/AttributeRow";
import {
  CATEGORY_ACCENTS,
  CATEGORY_ICONS,
  CATEGORY_LABELS,
} from "@/data/categories";
import type { AttributeBreakdown, CategoryName } from "@/types";

interface CategorySectionProps {
  category: CategoryName;
  entries: AttributeBreakdown[];
  categoryAp: number;
  onStatChange: (attribute: string, value: number) => void;
}

export default function CategorySection({
  category,
  entries,
  categoryAp,
  onStatChange,
}: CategorySectionProps) {
  const raised = entries.filter((e) => e.targetStat > e.baseStat).length;
  const accent = CATEGORY_ACCENTS[category] ?? CATEGORY_ACCENTS.Physical;
  const avg = Math.round(
    entries.reduce((s, e) => s + e.statTotal, 0) / Math.max(1, entries.length),
  );

  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base ${accent.border} ${accent.bg}`}
        >
          {CATEGORY_ICONS[category]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-black tracking-tight text-zinc-50">
            {CATEGORY_LABELS[category]}
          </span>
          <span className="block text-[11px] text-zinc-500">
            {entries.length} atributos
            {raised > 0 ? ` · ${raised} mejorados` : ""}
          </span>
        </span>
        <span className={`font-mono text-sm font-bold ${accent.text}`}>
          AVG {avg}
        </span>
        <span
          className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
            categoryAp > 0 ? `${accent.bg} ${accent.text}` : "bg-white/[0.03] text-zinc-600"
          }`}
        >
          {categoryAp} AP
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 p-3 sm:p-4 lg:grid-cols-2">
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
