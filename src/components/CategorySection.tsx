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
  isOpen: boolean;
  onToggle: () => void;
  onStatChange: (attribute: string, value: number) => void;
}

export default function CategorySection({
  category,
  entries,
  categoryAp,
  isOpen,
  onToggle,
  onStatChange,
}: CategorySectionProps) {
  const panelId = `category-${category}`;
  const raised = entries.filter((e) => e.targetStat > e.baseStat).length;
  const accent = CATEGORY_ACCENTS[category] ?? CATEGORY_ACCENTS.Physical;

  return (
    <section className="panel overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.03] sm:px-5"
        >
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-base ${accent.border} ${accent.bg}`}
          >
            {CATEGORY_ICONS[category]}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold tracking-tight text-zinc-100">
              {CATEGORY_LABELS[category]}
            </span>
            <span className="block text-[11px] text-zinc-500">
              {entries.length} atributos
              {raised > 0 ? ` · ${raised} mejorados` : ""}
            </span>
          </span>

          <span
            className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
              categoryAp > 0 ? `${accent.bg} ${accent.text}` : "bg-white/[0.03] text-zinc-600"
            }`}
          >
            {categoryAp} AP
          </span>

          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </h3>

      {isOpen && (
        <div
          id={panelId}
          className="grid animate-fade-in grid-cols-1 gap-2.5 border-t border-white/[0.06] p-3 sm:p-4 lg:grid-cols-2"
        >
          {entries.map((entry) => (
            <AttributeRow
              key={entry.attribute}
              entry={entry}
              onChange={onStatChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}