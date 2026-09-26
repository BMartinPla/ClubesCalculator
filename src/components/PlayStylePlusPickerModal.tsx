"use client";

import { useEffect } from "react";
import { getPlayStyleByName } from "@/data/playstyles";
import { getPlayStylePlusRequirements } from "@/data/playstylePlusRequirements";
import {
  canApplyPlayStyleAutoUpgrade,
  estimatePlayStyleRequirements,
  planPlayStyleAutoUpgrade,
} from "@/lib/playstyleRequirements";
import { attributeLabel } from "@/lib/attributeNames";
import type { Archetype, AttributeBreakdown } from "@/types";

interface PlayStylePlusPickerModalProps {
  open: boolean;
  onClose: () => void;
  archetype: Archetype;
  breakdown: AttributeBreakdown[];
  availableAp: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function PlayStylePlusPickerModal({
  open,
  onClose,
  archetype,
  breakdown,
  availableAp,
  selectedId,
  onSelect,
}: PlayStylePlusPickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const specializations = archetype.specializations
    .map((name) => getPlayStyleByName(name))
    .filter((playStyle) => playStyle !== undefined);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plus-picker-title"
      className="fixed inset-0 z-[65] flex items-center justify-center p-4"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close PlayStyle+ selector"
      />
      <div className="relative flex max-h-[88vh] w-full max-w-3xl animate-pop-in flex-col overflow-hidden rounded-2xl border border-amber-400/25 bg-[#0d130f] shadow-2xl shadow-black/50">
        <div className="border-b border-line bg-amber-400/[0.035] p-4 sm:p-5">
          <h2
            id="plus-picker-title"
            className="text-lg font-extrabold uppercase tracking-wide text-amber-200"
          >
            Choose a PlayStyle+
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {archetype.name} specializations · choose one to replace your current PlayStyle+.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4 sm:p-5">
          {specializations.map((playStyle) => {
            const requirements = getPlayStylePlusRequirements(archetype.name, playStyle.id);
            const estimates = requirements
              ? estimatePlayStyleRequirements({ ...playStyle, requirements }, breakdown)
              : [];
            const plan = requirements
              ? planPlayStyleAutoUpgrade(requirements, breakdown)
              : { targetStats: {}, apCost: 0, reachable: false };
            const canApply = Boolean(requirements) && canApplyPlayStyleAutoUpgrade(plan, availableAp);
            const isSelected = playStyle.id === selectedId;

            return (
              <button
                key={playStyle.id}
                type="button"
                disabled={!canApply}
                onClick={() => canApply && onSelect(playStyle.id)}
                aria-pressed={isSelected}
                title={
                  !plan.reachable
                    ? "Requirement exceeds this archetype's cap"
                    : canApply
                      ? `Automatically upgrade stats for ${plan.apCost} AP`
                      : `Requires ${plan.apCost} AP; ${availableAp} AP available`
                }
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 sm:items-center sm:p-3.5 ${
                  isSelected
                    ? "border-amber-300/60 bg-amber-300/[0.08]"
                    : "border-line bg-[#111914] hover:border-amber-300/35 hover:bg-amber-300/[0.03]"
                }`}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-300/15 bg-black/25">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={playStyle.iconplus}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-amber-100">
                      {playStyle.name} +
                    </span>
                    {isSelected && (
                      <span className="chip bg-amber-300/10 text-amber-200">Equipped</span>
                    )}
                  </span>
                  {requirements && (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {estimates.map((requirement) => (
                        <span
                          key={requirement.attributeId}
                          className={`chip ${
                            requirement.met
                              ? "bg-pitch/15 text-pitch"
                              : requirement.reachable
                                ? "bg-rose-500/15 text-rose-300"
                                : "bg-zinc-700/40 text-zinc-400"
                          }`}
                        >
                          {attributeLabel(requirement.attributeId)} {requirement.current} → {requirement.min}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-2 block text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {!requirements
                      ? "Gold requirement data unavailable"
                      : !plan.reachable
                        ? "Requirement exceeds this archetype's cap"
                        : canApply
                          ? `Estimated additional cost: ${plan.apCost} AP`
                          : `Requires ${plan.apCost} AP · ${availableAp} AP available`}
                  </span>
                </span>
                <span aria-hidden="true" className="hidden text-amber-300 sm:block">›</span>
              </button>
            );
          })}
          {specializations.length === 0 && (
            <p className="rounded-xl border border-line p-4 text-sm text-muted">
              No PlayStyle+ specialization data is available for this archetype.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
