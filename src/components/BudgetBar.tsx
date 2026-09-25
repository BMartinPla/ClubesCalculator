"use client";

import { forwardRef, useEffect, useState } from "react";
import { getBudgetStatus } from "@/lib/buildEngine";
import { MAX_LEVEL, getMaxApForLevel } from "@/data/levelProgression";
import ArchetypeDropdown from "@/components/ArchetypeDropdown";
import type { Archetype } from "@/types";

interface BudgetBarProps {
  archetypes: Archetype[];
  archetypeName: string;
  onArchetypeSelect: (name: string) => void;
  spent: number;
  maxAp: number;
  statsApCost: number;
  starsApCost: number;
  level: number;
  shareUrl: string;
  onLevelChange: (level: number) => void;
  onReset: () => void;
  onExport: () => void;
}

const BudgetBar = forwardRef<HTMLElement, BudgetBarProps>(function BudgetBar(
  {
    archetypes,
    archetypeName,
    onArchetypeSelect,
    spent,
    maxAp,
    statsApCost,
    starsApCost,
    level,
    shareUrl,
    onLevelChange,
    onReset,
    onExport,
  },
  ref,
) {
  const remainingAp = maxAp - spent;
  const status = getBudgetStatus(spent, maxAp);
  const isOver = remainingAp < 0;
  const pct = Math.min(100, (spent / maxAp) * 100);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      window.prompt("Copy the URL to share your build:", shareUrl);
    }
  };

  return (
    <header
      ref={ref}
      className="fixed left-0 right-0 top-0 z-50 w-full border-b border-line bg-[#0c0f16]/95 px-4 py-2.5 shadow-xl backdrop-blur-md sm:px-6"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
        {/* Left: brand */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand/60 bg-brand/15 text-[10px] font-black leading-none text-brand-hi">
            FC27
          </div>
          <div className="leading-tight">
            <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-white">
              Clubs Builder
            </p>
          </div>
        </div>

        {/* Archetype selector (from the header) */}
        <div className="w-full min-w-0 lg:max-w-xs">
          <ArchetypeDropdown
            archetypes={archetypes}
            selected={archetypeName}
            onSelect={onArchetypeSelect}
            compact
          />
        </div>

        {/* Center: level + AP */}
        <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
          <label className="flex items-center gap-2 rounded-lg border border-line bg-black/20 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
              Level
            </span>
            <select
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              aria-label="Pro level"
              className="cursor-pointer bg-transparent text-sm font-extrabold text-pitch focus:outline-none"
            >
              {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl} className="bg-panel text-white">
                  {lvl} · {getMaxApForLevel(lvl)} AP
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-4 rounded-lg border border-line bg-[#161a22]/70 px-4 py-1.5">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span
                  className={`text-2xl font-extrabold leading-none tabular-nums ${
                    isOver ? "text-rose-500" : "text-pitch"
                  }`}
                >
                  {remainingAp}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  AP Left
                </span>
              </div>
              <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-line">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOver ? "bg-rose-500" : "bg-pitch"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="hidden border-l border-line pl-3.5 text-xs text-muted xl:flex xl:flex-col xl:justify-center">
              <div>
                Spent{" "}
                <span className="font-mono font-bold text-white">{spent}</span>
                <span className="text-line-strong"> / {maxAp}</span>
              </div>
              <div className="mt-0.5 text-[11px]">
                Stats <span className="font-mono font-semibold text-zinc-200">{statsApCost}</span>
                {" · "}Stars{" "}
                <span className="font-mono font-semibold text-zinc-200">{starsApCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExport}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-pitch bg-pitch/10 px-4 py-2 text-sm font-bold text-pitch transition hover:bg-pitch hover:text-[#11141a]"
          >
            <span aria-hidden="true">📷</span>
            Export
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
              copied
                ? "border-pitch/60 bg-pitch/15 text-pitch"
                : "border-line-strong bg-black/20 text-zinc-200 hover:border-zinc-500"
            }`}
          >
            <span aria-hidden="true">🔗</span>
            {copied ? "Copied!" : "Share"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-brand/70 bg-transparent px-3.5 py-2 text-sm font-bold uppercase tracking-wide text-rose-400 transition hover:bg-rose-500/20"
          >
            <span aria-hidden="true">↺</span>
            Reset
          </button>
        </div>
      </div>

      {status === "over" && (
        <div className="mx-auto mt-2 max-w-[1600px] rounded-lg border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-center text-xs font-semibold text-rose-200">
          Budget exceeded: {Math.abs(remainingAp)} AP over. Reduce attributes or
          stars to return to {maxAp} AP.
        </div>
      )}
    </header>
  );
});

export default BudgetBar;