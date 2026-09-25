"use client";

import { useEffect, useMemo, useState } from "react";
import { PLAYSTYLES } from "@/data/playstyles";
import { ATTRIBUTE_ID_TO_INTERNAL, attributeLabel } from "@/lib/attributeNames";
import type { PlayStyleDef } from "@/types";

interface PlayStylePickerModalProps {
  open: boolean;
  onClose: () => void;
  statTotals: Record<string, number>;
  selectedIds: (string | null)[];
  onSelect: (id: string) => void;
}

const CATEGORIES = [
  "scoring",
  "passing",
  "ball_control",
  "defending",
  "physical",
  "pace",
  "goalkeeping",
];

const CATEGORY_LABEL: Record<string, string> = {
  scoring: "Scoring",
  passing: "Passing",
  ball_control: "Ball Control",
  defending: "Defending",
  physical: "Physical",
  pace: "Pace",
  goalkeeping: "Goalkeeping",
};

function requirementMet(
  req: { attributeId: string; min: number },
  statTotals: Record<string, number>,
): boolean {
  const name = ATTRIBUTE_ID_TO_INTERNAL[req.attributeId] ?? req.attributeId;
  return (statTotals[name] ?? 0) >= req.min;
}

export default function PlayStylePickerModal({
  open,
  onClose,
  statTotals,
  selectedIds,
  onSelect,
}: PlayStylePickerModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PLAYSTYLES.filter(
      (p) => q === "" || p.name.toLowerCase().includes(q),
    );
    return CATEGORIES.map((category) => ({
      category,
      items: list.filter((p) => p.category === category),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[88vh] w-full max-w-3xl animate-pop-in flex-col overflow-hidden rounded-xl border border-line bg-[#0c0f16] shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-white">
              Choose a PlayStyle
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Auto-met when your stats reach the required value.
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-40 rounded border border-line-strong bg-[#0d0f12] px-3 py-1.5 text-sm text-white placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">
                {CATEGORY_LABEL[group.category] ?? group.category}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {group.items.map((p) => (
                  <PlayStyleOption
                    key={p.id}
                    playstyle={p}
                    met={p.requirements.every((r) => requirementMet(r, statTotals))}
                    isSelected={selectedIds.includes(p.id)}
                    statTotals={statTotals}
                    onSelect={() => onSelect(p.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayStyleOption({
  playstyle,
  met,
  isSelected,
  statTotals,
  onSelect,
}: {
  playstyle: PlayStyleDef;
  met: boolean;
  isSelected: boolean;
  statTotals: Record<string, number>;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-lg border p-2.5 text-left transition ${
        isSelected
          ? "border-pitch bg-pitch/10"
          : met
            ? "border-line bg-[#11151f] hover:border-line-strong"
            : "border-line bg-[#11151f]/60 opacity-75 hover:border-line-strong"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playstyle.icon} alt="" width={34} height={34} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {playstyle.name}
          </span>
          {isSelected && (
            <span className="chip bg-pitch/15 text-pitch">Selected</span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap gap-1">
          {playstyle.requirements.map((r) => {
            const ok = requirementMet(r, statTotals);
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
        </span>
      </span>
    </button>
  );
}