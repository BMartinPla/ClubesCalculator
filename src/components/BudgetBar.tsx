"use client";

import { forwardRef, useEffect, useState } from "react";
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

const BudgetBar = forwardRef<HTMLElement, BudgetBarProps>(function BudgetBar(
  {
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
      window.prompt("Copia la URL para compartir tu build:", shareUrl);
    }
  };

  return (
    <header
      ref={ref}
      className="fixed left-0 right-0 top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/90 px-4 py-3 shadow-xl backdrop-blur-md sm:px-6"
    >
      {/* Accent hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6">
        {/* Izquierda: emblema + branding */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-500 text-[11px] font-black leading-none text-zinc-950 shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]">
              FC27
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-400" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-black tracking-tight text-zinc-50">
              Clubs Build Calculator
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {archetypeName}
            </p>
          </div>
        </div>

        {/* Centro: cockpit (nivel + AP) */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Nivel
            </span>
            <select
              value={level}
              onChange={(e) => onLevelChange(Number(e.target.value))}
              aria-label="Nivel del Pro"
              className="cursor-pointer bg-transparent text-sm font-black text-emerald-400 focus:outline-none"
            >
              {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => (
                <option key={lvl} value={lvl} className="bg-zinc-900 text-white">
                  {lvl} · {getMaxApForLevel(lvl)} AP
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-transparent px-4 py-2.5">
            {/* Saldo AP */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${
                  isOver
                    ? "bg-rose-500/15 text-rose-400"
                    : "bg-emerald-500/15 text-emerald-400"
                }`}
              >
                ⚡
              </span>
              <div className="text-right">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span
                    className={`text-3xl font-black leading-none tabular-nums tracking-tight ${
                      isOver ? "text-rose-500" : "text-emerald-400"
                    }`}
                  >
                    {remainingAp}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    AP libres
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isOver ? "bg-rose-500" : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Desglose */}
            <div className="hidden border-l border-white/[0.08] pl-3.5 text-xs text-zinc-400 sm:flex sm:flex-col sm:justify-center">
              <div>
                Gastados{" "}
                <span className="font-mono font-bold text-zinc-100">{spent}</span>
                <span className="text-zinc-600"> / {maxAp}</span>
              </div>
              <div className="mt-0.5 text-[11px]">
                Stats <span className="font-mono font-semibold text-zinc-300">{statsApCost}</span>
                {" · "}Estrellas{" "}
                <span className="font-mono font-semibold text-zinc-300">{starsApCost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Derecha: acciones */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onExport}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-4 py-2 text-sm font-black text-zinc-950 shadow-[0_8px_24px_-10px_rgba(34,197,94,0.9)] transition hover:from-emerald-300 hover:to-emerald-400"
          >
            <span aria-hidden="true">📷</span>
            Exportar Captura
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`focus-ring inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
              copied
                ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                : "border-white/[0.08] bg-white/[0.04] text-zinc-200 hover:border-white/20 hover:bg-white/[0.08]"
            }`}
          >
            <span aria-hidden="true">🔗</span>
            {copied ? "¡Copiado!" : "Compartir"}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-transparent px-3.5 py-2 text-sm font-semibold text-zinc-400 transition hover:border-rose-500/30 hover:bg-rose-500/20 hover:text-rose-400"
          >
            <span aria-hidden="true">🔄</span>
            Resetear
          </button>
        </div>
      </div>

      {status === "over" && (
        <div className="mx-auto mb-3 max-w-[1440px] rounded-xl border border-rose-500/30 bg-rose-500/20 px-4 py-2 text-center text-xs font-semibold text-rose-200">
          Has superado el presupuesto: {Math.abs(remainingAp)} AP de más. Reduce
          atributos o estrellas para volver a {maxAp} AP.
        </div>
      )}
    </header>
  );
});

export default BudgetBar;