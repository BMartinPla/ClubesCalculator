"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildThresholdTargets,
  evaluateArchetypeForThreshold,
  getCanonicalAttributesByCategory,
  optimizeForAnimationThreshold,
  type AnimationThreshold,
} from "@/lib/animationOptimizer";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/data/categories";
import type { CategoryName } from "@/types";

interface AnimationThresholdModalProps {
  open: boolean;
  onClose: () => void;
  initialThreshold: AnimationThreshold;
  archetype: string;
  masteryBonus: Record<string, number>;
  onApply: (archetype: string, targets: Record<string, number>) => void;
}

export default function AnimationThresholdModal({
  open,
  onClose,
  initialThreshold,
  archetype,
  masteryBonus,
  onApply,
}: AnimationThresholdModalProps) {
  const [threshold, setThreshold] = useState<AnimationThreshold>(initialThreshold);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setThreshold(initialThreshold);
      setSelected(new Set());
    }
  }, [open, initialThreshold]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const groups = useMemo(() => getCanonicalAttributesByCategory(), []);
  const selectedList = useMemo(() => Array.from(selected), [selected]);

  const optimization = useMemo(
    () => optimizeForAnimationThreshold(selectedList, threshold, masteryBonus),
    [selectedList, threshold, masteryBonus],
  );

  const current = useMemo(
    () => evaluateArchetypeForThreshold(archetype, selectedList, threshold, masteryBonus),
    [archetype, selectedList, threshold, masteryBonus],
  );

  if (!open) return null;

  const toggle = (attribute: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(attribute)) next.delete(attribute);
      else next.add(attribute);
      return next;
    });
  };

  const apply = (targetArchetype: string) => {
    const targets = buildThresholdTargets(
      targetArchetype,
      selectedList,
      threshold,
      masteryBonus,
    );
    onApply(targetArchetype, targets);
    onClose();
  };

  const best = optimization.best;
  const hasSelection = selectedList.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="animations-title"
        className="relative flex max-h-[92vh] w-full max-w-5xl animate-pop-in flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/95 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-lg"
            >
              🎬
            </span>
            <div>
              <h2 id="animations-title" className="text-lg font-bold text-zinc-50">
                Optimizador de Animaciones
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Encuentra el arquetipo más económico para alcanzar el umbral.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {([71, 85] as AnimationThreshold[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThreshold(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  threshold === t
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : "border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/20"
                }`}
              >
                {t === 71 ? "⚡ Base" : "⭐ Mejoradas"} · {t}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_380px]">
          {/* Attribute selection */}
          <div className="min-h-0 overflow-y-auto p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Atributos ({selectedList.length} seleccionados)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(groups.flatMap((g) => g.attributes)))}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-zinc-300 transition hover:border-white/20"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-zinc-400 transition hover:border-white/20"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {CATEGORY_ICONS[group.category as CategoryName]}{" "}
                    {CATEGORY_LABELS[group.category as CategoryName] ?? group.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.attributes.map((attr) => {
                      const on = selected.has(attr);
                      return (
                        <button
                          key={attr}
                          type="button"
                          onClick={() => toggle(attr)}
                          aria-pressed={on}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                            on
                              ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                              : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          {attr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex min-h-0 flex-col border-t border-white/[0.06] lg:border-l lg:border-t-0">
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {!hasSelection ? (
                <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center text-xs text-zinc-500">
                  Selecciona al menos un atributo para calcular el arquetipo más
                  económico.
                </p>
              ) : (
                <>
                  {/* Best */}
                  {best && (
                    <div className="mb-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
                        Arquetipo más económico
                      </p>
                      <div className="mt-1 flex items-end justify-between gap-2">
                        <p className="text-xl font-black text-emerald-100">
                          {best.archetype}
                        </p>
                        <p className="font-mono text-2xl font-black text-emerald-300">
                          {best.totalCost}
                          <span className="ml-1 text-xs font-semibold text-emerald-400/70">
                            AP
                          </span>
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={best.archetype === archetype}
                        onClick={() => apply(best.archetype)}
                        className="focus-ring mt-3 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {best.archetype === archetype
                          ? "Ya es tu arquetipo activo"
                          : `Cambiar y Aplicar a ${best.archetype}`}
                      </button>
                    </div>
                  )}

                  {/* Ranking */}
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Ranking de arquetipos
                  </p>
                  <ol className="flex flex-col gap-1.5">
                    {optimization.results.map((r, i) => {
                      const isCurrent = r.archetype === archetype;
                      return (
                        <li
                          key={r.archetype}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                            isCurrent
                              ? "border-emerald-500/40 bg-emerald-500/[0.07]"
                              : "border-white/[0.06] bg-white/[0.02]"
                          }`}
                        >
                          <span className="w-5 shrink-0 text-center font-mono text-xs font-bold text-zinc-500">
                            #{i + 1}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-200">
                            {r.archetype}
                          </span>
                          {r.isPossible ? (
                            <span className="shrink-0 font-mono text-sm font-bold text-zinc-100">
                              {r.totalCost} AP
                            </span>
                          ) : (
                            <span className="chip shrink-0 border-rose-500/40 bg-rose-500/10 text-rose-300">
                              Tope insuficiente
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] p-4">
              <button
                type="button"
                disabled={!hasSelection}
                onClick={() => apply(archetype)}
                className="focus-ring w-full rounded-xl bg-gradient-to-b from-cyan-400 to-emerald-500 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:from-cyan-300 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aplicar solo al arquetipo actual ({current.totalCost} AP)
              </button>
              {hasSelection && !current.isPossible && (
                <p className="mt-2 text-center text-[11px] text-rose-300">
                  El arquetipo actual no alcanza: {current.impossibleAttributes.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
