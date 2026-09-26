"use client";

import { forwardRef } from "react";
import { CATEGORY_ORDER } from "@/data/categories";
import { PLAYSTYLES, getArchetypeIcon } from "@/data/playstyles";
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
  "Potencia Tiro": "Shot Power",
  "Tiros Lejanos": "Long Shots",
  Voleas: "Volleys",
  Penales: "Penalties",
  Vision: "Vision",
  Centros: "Crossing",
  "Precision TL": "FK Accuracy",
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
  Scoring: "Scoring",
  Passing: "Passing",
  "Ball Control": "Ball Control",
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
  if (value >= 80) return { text: "text-brand", bar: "bg-brand" };
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
        <span className={isKey ? "font-semibold text-brand" : "text-zinc-200"}>
          {labelFor(entry.attribute)}
        </span>
          <span className="data-number whitespace-nowrap font-bold">
          <span className={text}>{value}</span>
          {entry.masteryBonus > 0 ? (
            <span className="ml-1 font-normal text-brand">
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
    <div className="rounded-xl border border-brand/25 bg-brand/[0.045] p-3">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="text-[11px]">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
            <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
          </svg>
        </span>
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
          Active Masteries ({count}/{totalMasteriesCount})
        </p>
      </div>

      {count === 0 ? (
        <p className="mt-2 text-[10px] text-zinc-600">No active masteries</p>
      ) : (
        <>
          {allActive && (
            <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-300">
              All Active Masteries (+{passiveTotal} Passive Stats)
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeMasteries.map((m) => (
              <span
                key={m.archetype}
                className="whitespace-nowrap rounded-md border border-brand/25 bg-brand/5 px-2 py-0.5 text-[10px] font-medium text-brand"
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
    const archetypeIcon = getArchetypeIcon(archetype.name);
    const signaturePlayStyle = PLAYSTYLES.find(
      (playStyle) => playStyle.name === archetype.signature_playstyle_plus,
    );

    return (
      <div
        ref={ref}
        className="w-[820px] rounded-2xl border border-[#334039] bg-[radial-gradient(ellipse_at_85%_0%,rgba(75,104,57,.18),transparent_35%),#0a100d] p-5 font-sans text-white shadow-2xl"
      >
        {/* ---- Header: 3 info boxes ---- */}
        <div className="grid grid-cols-3 gap-3">
          {/* Box 1: archetype info */}
          <div className="flex items-center gap-3 rounded-xl border border-[#27332d] bg-white/[0.025] p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/5 p-1">
              {archetypeIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={archetypeIcon} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              ) : (
                <span className="text-sm font-extrabold text-brand">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-tight">{archetype.name}</p>
              <p className="text-[10px] leading-snug text-zinc-400">
                Level {build.level}. SM: {skills}/5 • WF: {weakFoot}/5
              </p>
              <p className="text-[10px] leading-snug text-zinc-400">
                AP Used:{" "}
                <span className="text-zinc-200">{build.totalApSpent}</span>/
                {build.maxAp}. AP Left:{" "}
                <span className="text-zinc-200">
                  {Math.max(0, build.remainingAp)}
                </span>
              </p>
              {activeMasteriesCount > 0 && (
                <p className="text-[10px] leading-snug text-brand">
                  Masteries: {activeMasteriesCount} active
                </p>
              )}
            </div>
          </div>

          {/* Box 2: signature playstyles */}
          <div className="rounded-xl border border-[#27332d] bg-white/[0.025] p-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Signature Playstyles
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {signaturePlayStyle?.iconplus && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={signaturePlayStyle.iconplus} alt="" width={38} height={38} className="h-9 w-9 object-contain" />
              )}
              <span className="text-[11px] font-semibold text-brand">
                {archetype.signature_playstyle_plus} +
              </span>
            </div>
          </div>

          {/* Box 3: secondary playstyles */}
          <div className="rounded-xl border border-[#27332d] bg-white/[0.025] p-3">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Playstyles
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {archetype.specializations.map((spec) => (
                <span
                  key={spec}
                  className="rounded-md border border-zinc-700 bg-zinc-800/70 px-1.5 py-0.5 text-[10px] text-zinc-300"
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
              <div className="rounded-xl border border-[#27332d] bg-white/[0.025] p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand">
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
