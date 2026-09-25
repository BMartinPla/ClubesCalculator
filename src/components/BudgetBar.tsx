"use client";

import { useEffect, useState } from "react";
import { getBudgetStatus } from "@/lib/buildEngine";
import { MAX_LEVEL, getMaxApForLevel } from "@/data/levelProgression";

interface BudgetBarProps {
  archetypeName: string;
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

export default function BudgetBar({
  archetypeName,
  spent,
  maxAp,
  statsApCost,
  starsApCost,
  level,
  shareUrl,
  onLevelChange,
  onReset,
  onExport,
}: BudgetBarProps) {
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
      window.prompt("Copia la URL para compartir tu build:", shareUrl);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Izquierda: Branding y arquetipo activo */}
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

        {/* Centro: selector de nivel + cápsula de presupuesto unificada */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900/70 px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Nivel
            </span>
            <select
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              aria-label="Nivel del Pro"
              className="cursor-pointer bg-transparent text-sm font-bold text-emerald-400 focus:outline-none"
            >
              {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl} className="bg-zinc-900 text-white">
                  {lvl} ({getMaxApForLevel(lvl)} AP)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-zinc-900/70 px-4 py-2">
            {/* Número grande de AP disponibles */}
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5">
                <span
                  className={`text-2xl font-black tabular-nums tracking-tight ${
                    isOver ? "text-rose-500" : "text-emerald-400"
                  }`}
                >
                  {remainingAp}
                </span>
                <span className="text-xs font-semibold uppercase text-zinc-400">
                  AP Libres
                </span>
              </div>
              <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOver ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Desglose compacto */}
            <div className="flex flex-col justify-center border-l border-white/[0.08] pl-3 text-xs text-zinc-400">
              <div>
                Gastados:{" "}
                <span className="font-semibold text-zinc-200">{spent}</span> / {maxAp}
              </div>
              <div className="text-[11px] text-zinc-400">
                Stats:{" "}
                <span className="font-medium text-zinc-300">{statsApCost}</span> •
                Estrellas:{" "}
                <span className="font-medium text-zinc-300">{starsApCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Derecha: acciones */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <span aria-hidden="true">📷</span>
            Exportar Captura
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              copied
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                : "border-white/[0.08] bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1]"
            }`}
          >
            <span aria-hidden="true">🔗</span>
            {copied ? "¡Copiado!" : "Compartir"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-zinc-400 transition hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400"
          >
            <span aria-hidden="true">🔄</span>
            Resetear
          </button>
        </div>
      </div>

      {status === "over" && (
        <div className="mx-auto mt-3 max-w-7xl rounded-lg border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-center text-xs font-semibold text-rose-200">
          Has superado el presupuesto: {Math.abs(remainingAp)} AP de más. Reduce
          atributos o estrellas para volver a {maxAp} AP.
        </div>
      )}
    </header>
  );
}