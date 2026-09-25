"use client";

import type { Archetype } from "@/types";

interface PlaystylesCardProps {
  archetype: Archetype;
}

export default function PlaystylesCard({ archetype }: PlaystylesCardProps) {
  return (
    <div className="panel p-4">
      <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-100">
        PlayStyles
      </h2>

      {/* Signature PlayStyle+ */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-3">
        <div className="flex h-9 w-9 shrink-0 rotate-45 items-center justify-center rounded-[5px] border border-amber-400/70 bg-amber-500/15">
          <span className="-rotate-45 text-sm text-amber-300">★</span>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
            Signature PlayStyle+
          </p>
          <p className="truncate text-sm font-bold text-amber-200">
            {archetype.signature_playstyle_plus} +
          </p>
        </div>
      </div>

      {/* Secondary playstyles */}
      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Secundarios
      </p>
      <div className="flex flex-wrap gap-1.5">
        {archetype.specializations.map((spec) => (
          <span
            key={spec}
            className="chip border-white/[0.08] bg-white/[0.04] text-zinc-300"
          >
            {spec}
          </span>
        ))}
      </div>

      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] text-zinc-500">
        Inspirado en{" "}
        <span className="font-medium text-zinc-300">{archetype.inspired_by}</span>
      </p>
    </div>
  );
}