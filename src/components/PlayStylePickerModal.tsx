"use client";

import { useEffect, useMemo, useState } from "react";
import { PLAYSTYLES } from "@/data/playstyles";
import { attributeLabel } from "@/lib/attributeNames";
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

function categoryLabel(c: string): string {
  const map: Record<string, string> = {
    scoring: "Tiro",
    passing: "Pase",
    ball_control: "Regate",
    defending: "Defensa",
    physical: "Físico",
    pace: "Ritmo",
    goalkeeping: "Portería",
  };
  return map[c] ?? c;
}

function requirementMet(
  req: { attributeId: string; min: number },
  statTotals: Record<string, number>,
): boolean {
  return (statTotals[attributeLabel(req.attributeId)] ?? 0) >= req.min;
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
      <div className="relative flex max-h-[88vh] w-full max-w-3xl animate-pop-in flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] p-5">
          <div>
            <h2 className="text-lg font-bold text-zinc-50">Elegir PlayStyle</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Se cumplen automáticamente si tus stats llegan al mínimo.
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar…"
            className="w-40 rounded-lg border border-white/[0.08] bg-zinc-950 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:outline-none"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {grouped.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {categoryLabel(group.category)}
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
      className={`flex items-start gap-3 rounded-xl border p-2.5 text-left transition ${
        isSelected
          ? "border-emerald-500/50 bg-emerald-500/10"
          : met
            ? "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
            : "border-white/[0.06] bg-white/[0.01] opacity-70 hover:border-white/15"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playstyle.icon} alt="" width={34} height={34} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-zinc-100">
            {playstyle.name}
          </span>
          {isSelected && (
            <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
              Elegido
            </span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap gap-1">
          {playstyle.requirements.map((r) => {
            const ok = requirementMet(r, statTotals);
            return (
              <span
                key={r.attributeId}
                className={`chip ${
                  ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
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
