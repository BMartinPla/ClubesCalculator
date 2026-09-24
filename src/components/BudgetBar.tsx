"use client";

import { getBudgetStatus } from "@/lib/buildEngine";
import { LEVEL_OPTIONS, getLevelLabel } from "@/data/levelProgression";

interface BudgetBarProps {
  archetypeName: string;
  spent: number;
  maxAp: number;
  statsApCost: number;
  starsApCost: number;
  level: number;
  onLevelChange: (level: number) => void;
  onReset: () => void;
  onShare: () => void;
  onExport: () => void;
  onSave: () => void;
}

const STATUS_STYLES = {
  ok: {
    text: "text-emerald-400",
    bar: "bg-emerald-500",
    ring: "shadow-[0_0_24px_-4px_rgba(34,197,94,0.55)]",
  },
  warn: {
    text: "text-amber-400",
    bar: "bg-amber-500",
    ring: "shadow-[0_0_24px_-4px_rgba(245,158,11,0.55)]",
  },
  over: {
    text: "text-rose-500",
    bar: "bg-rose-500",
    ring: "shadow-[0_0_24px_-4px_rgba(244,63,94,0.7)]",
  },
} as const;

export default function BudgetBar({
  archetypeName,
  spent,
  maxAp,
  statsApCost,
  starsApCost,
  level,
  onLevelChange,
  onReset,
  onShare,
  onExport,
  onSave,
}: BudgetBarProps) {
  const status = getBudgetStatus(spent, maxAp);
  const styles = STATUS_STYLES[status];
  const pct = Math.min(100, (spent / maxAp) * 100);
  const remaining = Math.max(0, maxAp - spent);
  const overBy = Math.max(0, spent - maxAp);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-black text-zinc-950 shadow-lg shadow-emerald-500/20">
            FC
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-zinc-100">
              Clubs Build Calculator
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              {archetypeName} · EA SPORTS FC Pro Clubs
            </p>
          </div>
        </div>

        {/* Budget meter */}
        <div className="flex flex-1 items-center gap-4 lg:justify-end">
          <div
            className={`min-w-0 flex-1 rounded-lg px-2 py-1 lg:max-w-md ${
              status === "over" ? "bg-rose-500/20" : ""
            }`}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
              <span className="font-medium text-zinc-400">
                AP Usados:{" "}
                <span className={styles.text}>{spent}</span>
                <span className="text-zinc-600"> / {maxAp}</span>
                <span className="hidden text-zinc-600 sm:inline">
                  {" "}
                  (Stats: {statsApCost} AP | Estrellas: {starsApCost} AP)
                </span>
              </span>
              <span className={`font-mono font-semibold ${styles.text}`}>
                {overBy > 0
                  ? `${overBy} AP de más`
                  : `AP Restantes: ${remaining}`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${styles.bar} ${styles.ring}`}
                style={{ width: `${Math.max(pct, spent > 0 ? 2 : 0)}%` }}
                role="progressbar"
                aria-valuenow={spent}
                aria-valuemin={0}
                aria-valuemax={maxAp}
              />
            </div>
          </div>

          {/* Remaining counter */}
          <div className="hidden shrink-0 text-right sm:block">
            <p className={`font-mono text-2xl font-black leading-none ${styles.text}`}>
              {overBy > 0 ? `-${overBy}` : remaining}
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              {overBy > 0 ? "AP de más" : "AP restantes"}
            </p>
          </div>

          {/* Level selector */}
          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="pro-level" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Nivel
            </label>
            <select
              id="pro-level"
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              aria-label="Nivel del Pro"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-bold text-white focus:border-emerald-500/60 focus:outline-none"
            >
              {LEVEL_OPTIONS.map(({ level: lvl }) => (
                <option key={lvl} value={lvl}>
                  {getLevelLabel(lvl)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <span aria-hidden="true">📷</span>
              Exportar Captura
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-violet-500/60 hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <span aria-hidden="true">💾</span>
              Guardar
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500/60 hover:text-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Compartir
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-red-500/60 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 2v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L3 8" />
              </svg>
              Resetear
            </button>
          </div>
        </div>
      </div>

      {status === "over" && (
        <div className="border-t border-rose-500/30 bg-rose-500/20 px-4 py-2 text-center text-xs font-semibold text-rose-200 sm:px-6">
          Has superado el presupuesto: {overBy} AP de más. Reduce atributos o
          estrellas para volver a {maxAp} AP ({getLevelLabel(level)}).
        </div>
      )}
    </header>
  );
}