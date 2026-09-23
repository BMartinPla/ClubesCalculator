"use client";

import { forwardRef } from "react";
import { CATEGORY_ORDER } from "@/data/categories";
import type {
  Archetype,
  ArchetypeMastery,
  AttributeBreakdown,
  BuildResult,
  CategoryName,
} from "@/types";

interface BuildSummaryCardProps {
  archetype: Archetype;
  build: BuildResult;
  /** Attribute names highlighted as the archetype's signature stats. */
  keyAttributes: string[];
  /** The masteries that are currently active. */
  activeMasteries: ArchetypeMastery[];
  /** Total number of masteries available (13). */
  totalMasteriesCount: number;
  skills: number;
  weakFoot: number;
}

/** EA-style English labels for the raw (Spanish) attribute names. */
const ATTRIBUTE_LABELS: Record<string, string> = {
  Aceleracion: "Acceleration",
  Sprint: "Sprint Speed",
  Posicionamiento: "Attack Positioning",
  Definicion: "Finishing",
  "Potencia de Tiro": "Shot Power",
  "Tiros Lejanos": "Long Shots",
  Voleas: "Volleys",
  Penales: "Penalties",
  Vision: "Vision",
  Centros: "Crossing",
  "Pase Corto": "Short Passing",
  "Pase Largo": "Long Passing",
  Efecto: "Curve",
  Agilidad: "Agility",
  Balance: "Balance",
  Reacciones: "Reactions",
  "Control Balon": "Ball Control",
  Regates: "Dribbling",
  Compostura: "Composure",
  Intercepciones: "Interceptions",
  "Precision Cabeza": "Heading Accuracy",
  "Percepcion Defensiva": "Def. Awareness",
  Robos: "Standing Tackle",
  Barridas: "Sliding Tackle",
  Salto: "Jumping",
  Resistencia: "Stamina",
  Fuerza: "Strength",
  Agresividad: "Aggression",
  GK_Estirada: "GK Diving",
  GK_Paradas: "GK Handling",
  GK_Saque: "GK Kicking",
  GK_Reflejos: "GK Reflexes",
  GK_Colocacion: "GK Positioning",
};

const CATEGORY_LABELS: Record<CategoryName, string> = {
  Pace: "Pace",
  Shooting: "Scoring",
  Passing: "Passing",
  Dribbling: "Ball Control",
  Defending: "Defending",
  Physical: "Physical",
  Goalkeeping: "Goalkeeping",
};

const labelFor = (attribute: string) => ATTRIBUTE_LABELS[attribute] ?? attribute;

/** 3-letter Spanish abbreviation, e.g. "Compostura" -> "Com", "GK_Paradas" -> "Par". */
function abbrev(stat: string): string {
  const clean = stat.startsWith("GK_") ? stat.slice(3) : stat;
  const short = clean.slice(0, 3);
  return short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();
}

/** "Finisher (+1 Com, +2 Def)" */
function masteryBadge(m: ArchetypeMastery): string {
  const parts: string[] = [];
  if (m.bonus_1 > 0) parts.push(`+${m.bonus_1} ${abbrev(m.stat_1)}`);
  if (m.bonus_2 > 0) parts.push(`+${m.bonus_2} ${abbrev(m.stat_2)}`);
  return parts.length > 0 ? `${m.archetype} (${parts.join(", ")})` : m.archetype;
}

/** Accent color class (text + bar) by stat level. */
function accentClass(value: number): { text: string; bar: string } {
  if (value >= 80) return { text: "text-emerald-400", bar: "bg-emerald-400" };
  if (value >= 70) return { text: "text-amber-400", bar: "bg-amber-400" };
  if (value >= 60) return { text: "text-orange-400", bar: "bg-orange-400" };
  return { text: "text-rose-500", bar: "bg-rose-500" };
}

function StatLine({
  entry,
  isKey,
}: {
  entry: AttributeBreakdown;
  isKey: boolean;
}) {
  const value = entry.statTotal;
  const { text, bar } = accentClass(value);
  const showBase = value !== entry.baseStat;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-xs leading-none">
        <span className={isKey ? "font-medium text-emerald-400" : "text-zinc-200"}>
          {labelFor(entry.attribute)}
        </span>
        <span className="whitespace-nowrap font-mono font-bold">
          <span className={text}>{value}</span>
          {entry.masteryBonus > 0 ? (
            <span className="ml-1 font-normal text-violet-300">
              (+{entry.masteryBonus} M)
            </span>
          ) : showBase ? (
            <span className="ml-1 font-normal text-zinc-500">
              ({entry.baseStat})
            </span>
          ) : null}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

function MasteriesBlock({
  activeMasteries,
  totalMasteriesCount,
}: {
  activeMasteries: ArchetypeMastery[];
  totalMasteriesCount: number;
}) {
  const count = activeMasteries.length;
  const passiveTotal = activeMasteries.reduce(
    (sum, m) => sum + m.bonus_1 + m.bonus_2,
    0,
  );
  const allActive = totalMasteriesCount > 0 && count === totalMasteriesCount;

  return (
    <div className="rounded-lg border border-violet-500/30 bg-violet-950/20 p-3">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="text-[11px]">
          🏆
        </span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
          Maestrías Activas ({count}/{totalMasteriesCount})
        </p>
      </div>

      {count === 0 ? (
        <p className="mt-2 text-[10px] text-zinc-600">Sin maestrías activas</p>
      ) : (
        <>
          {allActive && (
            <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300">
              ★ Todas las Maestrías Activas (+{passiveTotal} Stats Pasivas)
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeMasteries.map((m) => (
              <span
                key={m.archetype}
                className="whitespace-nowrap rounded-md border border-violet-500/40 bg-violet-950/50 px-2 py-0.5 text-[10px] font-medium text-violet-300"
              >
                {masteryBadge(m)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const BuildSummaryCard = forwardRef<HTMLDivElement, BuildSummaryCardProps>(
  function BuildSummaryCard(
    {
      archetype,
      build,
      keyAttributes,
      activeMasteries,
      totalMasteriesCount,
      skills,
      weakFoot,
    },
    ref,
  ) {
    const keySet = new Set(keyAttributes);
    const categories = CATEGORY_ORDER.filter((c) =>
      build.breakdown.some((b) => b.category === c),
    );
    const initials = archetype.name.slice(0, 2).toUpperCase();
    const activeMasteriesCount = activeMasteries.length;

    return (
      <div
        ref={ref}
        className="w-[820px] rounded-xl border border-zinc-800 bg-[#0c1017] p-5 font-sans text-white shadow-2xl"
      >
        {/* ---- Header: 3 info boxes ---- */}
        <div className="grid grid-cols-3 gap-3">
          {/* Box 1: archetype info */}
          <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-white/[0.02] p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-sm font-black text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.45)]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-tight">{archetype.name}</p>
              <p className="text-[10px] leading-snug text-zinc-400">
                SM: {skills}/5 • WF: {weakFoot}/5
              </p>
              <p className="text-[10px] leading-snug text-zinc-400">
                AP Usados:{" "}
                <span className="text-zinc-200">{build.totalApSpent}</span>/962 •
                AP Restantes:{" "}
                <span className="text-zinc-200">
                  {Math.max(0, build.remainingAp)}
                </span>
              </p>
              {activeMasteriesCount > 0 && (
                <p className="text-[10px] leading-snug text-violet-300">
                  Maestrías: {activeMasteriesCount} activas
                </p>
              )}
            </div>
          </div>

          {/* Box 2: signature playstyles */}
          <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Signature Playstyles
            </p>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-8 w-8 rotate-45 items-center justify-center rounded-[4px] border border-cyan-400/70 bg-cyan-500/10 shadow-[0_0_14px_rgba(34,211,238,0.35)]">
                <span className="-rotate-45 text-xs text-cyan-300">★</span>
              </div>
              <span className="text-center text-[11px] font-semibold text-cyan-200">
                {archetype.signature_playstyle_plus} +
              </span>
            </div>
          </div>

          {/* Box 3: secondary playstyles */}
          <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Playstyles
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {archetype.specializations.map((spec) => (
                <span
                  key={spec}
                  className="rounded border border-zinc-700 bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Body: category grid (masteries stacked under Physical) ---- */}
        <div className="mt-4 grid grid-cols-3 gap-x-5 gap-y-3">
          {categories.map((category) => {
            const entries = build.breakdown.filter(
              (b) => b.category === category,
            );
            const card = (
              <div className="rounded-lg border border-zinc-800/70 bg-white/[0.02] p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  {CATEGORY_LABELS[category]}
                </p>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <StatLine
                      key={entry.attribute}
                      entry={entry}
                      isKey={keySet.has(entry.attribute)}
                    />
                  ))}
                </div>
              </div>
            );

            // Masteries live in the empty space below the Physical column.
            if (category === "Physical") {
              return (
                <div key={category} className="flex flex-col gap-3">
                  {card}
                  <MasteriesBlock
                    activeMasteries={activeMasteries}
                    totalMasteriesCount={totalMasteriesCount}
                  />
                </div>
              );
            }
            return <div key={category}>{card}</div>;
          })}
        </div>

        {/* ---- Watermark ---- */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/70 pt-2">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-zinc-600">
            FC 27 CLUBS BUILDER
          </span>
          <span className="text-[10px] text-zinc-700">
            {archetype.role} · {archetype.primary_position}
          </span>
        </div>
      </div>
    );
  },
);

export default BuildSummaryCard;
