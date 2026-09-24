import {
  calculateSingleAttributeCost,
  calculateAttributeUpgradeCost,
  getSinglePointCost,
  calculateMasteryBonuses,
  evaluateBuild,
  getStarsCost,
  clamp,
  MAX_AP,
} from "../src/lib/buildEngine";
import { getArchetype } from "../src/data/archetypes";
import { getArchetypeAttributes } from "../src/data/archetypeAttributes";
import { ARCHETYPE_MASTERIES } from "../src/data/archetypeMasteries";
import { getStars } from "../src/data/archetypeStars";
import { getMaxApForLevel } from "../src/data/levelProgression";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
  );
}

const finisher = getArchetypeAttributes("Finisher");
const attr = (name: string) => finisher.find((a) => a.attribute === name)!;

console.log("--- Finisher: datos desde raw-data (sin físicos) ---");
check("Aceleracion base", attr("Aceleracion").base_stat, 75);
check("Aceleracion cap", attr("Aceleracion").cap_stat, 95);
check("Aceleracion tier", attr("Aceleracion").cost_tier, "Cheapest");
check("Sprint base", attr("Sprint").base_stat, 70);
check("Sprint cap", attr("Sprint").cap_stat, 95);
check("Sprint tier", attr("Sprint").cost_tier, "Expensive");
check("Definicion tier", attr("Definicion").cost_tier, "Cheapest");

// Tope de ritmo por arquetipo (datos oficiales): Finisher 95/95, Target 90/92, Spark 99/99.
const targetAttrs = getArchetypeAttributes("Target");
const sparkAttrs = getArchetypeAttributes("Spark");
const capOf = (list: typeof finisher, name: string) =>
  list.find((a) => a.attribute === name)!.cap_stat;
check("Finisher ritmo 95/95", [capOf(finisher, "Aceleracion"), capOf(finisher, "Sprint")], [95, 95]);
check("Target ritmo 90/92", [capOf(targetAttrs, "Aceleracion"), capOf(targetAttrs, "Sprint")], [90, 92]);
check("Spark ritmo 99/99", [capOf(sparkAttrs, "Aceleracion"), capOf(sparkAttrs, "Sprint")], [99, 99]);

console.log("--- Coste marginal por tier ---");
check(
  "Aceleracion 90->92 (Cheapest)",
  calculateSingleAttributeCost(90, 92, attr("Aceleracion").cost_tier),
  16,
);
check(
  "Sprint 90->92 (Expensive)",
  calculateSingleAttributeCost(90, 92, attr("Sprint").cost_tier),
  30,
);
check(
  "Definicion 90->92 (Cheapest)",
  calculateSingleAttributeCost(90, 92, attr("Definicion").cost_tier),
  16,
);
check("toStat < fromStat => 0", calculateSingleAttributeCost(92, 90, "Cheapest"), 0);
check("toStat == fromStat => 0", calculateSingleAttributeCost(90, 90, "Expensive"), 0);
check(
  "Marginal 75->92 Most Expensive",
  calculateSingleAttributeCost(75, 92, "Most Expensive"),
  32 + 50 + 75 + 60,
);

console.log("--- evaluateBuild ---");

// Base build = 0 AP; effective base equals native base_stat (no physical).
const base = evaluateBuild("Finisher", {}, {}, null, 40);
check("Base build totalApSpent", base.totalApSpent, 0);
check("Base build remainingAp", base.remainingAp, MAX_AP);
const acel = base.breakdown.find((b) => b.attribute === "Aceleracion")!;
check("Aceleracion effective base == base_stat", [acel.baseStat, acel.targetStat], [75, 75]);

// Single raised attribute: Sprint -> 92 (Expensive, base 70).
const build = evaluateBuild("Finisher", { Sprint: 92 }, {}, null, 40);
const sprint = build.breakdown.find((b) => b.attribute === "Sprint")!;
check("Sprint apCost (70->92 Expensive)", sprint.apCost, 4 * 4 + 5 * 6 + 5 * 7 + 5 * 11 + 3 * 15);
check("Build totalApSpent", build.totalApSpent, 181);
check("Build remainingAp", build.remainingAp, MAX_AP - 181);
check("Build isValid", build.isValid, true);

// Values are clamped into [base_stat, cap_stat].
const clamped = evaluateBuild("Finisher", { Sprint: 999, TirosLejanos: 0 }, {}, null, 40);
check(
  "Sprint clamped to cap",
  clamped.breakdown.find((b) => b.attribute === "Sprint")!.targetStat,
  95,
);

// Over-budget detection.
const over = evaluateBuild(
  "Finisher",
  {
    Definicion: 99,
    Sprint: 99,
    Posicionamiento: 99,
  },
  {},
  null,
  40,
);
console.log(
  `Over-budget probe: spent=${over.totalApSpent} overBy=${over.overBy} isValid=${over.isValid}`,
);
check("Over-budget isValid", over.isValid, over.totalApSpent <= MAX_AP);
check("Over-budget remaining clamped", over.remainingAp, Math.max(0, MAX_AP - over.totalApSpent));

console.log("--- Arquetipos y PlayStyles ---");
check("Finisher default height", getArchetype("Finisher")!.default_height, 180);
check("Boss min height", getArchetype("Boss")!.min_height, 180);
check(
  "clamp 160 into Boss range",
  clamp(160, getArchetype("Boss")!.min_height, getArchetype("Boss")!.max_height),
  180,
);
check(
  "Finisher signature_playstyle_plus",
  getArchetype("Finisher")!.signature_playstyle_plus,
  "Low Driven Shot",
);
check("Target inspired_by", getArchetype("Target")!.inspired_by, "Zlatan Ibrahimovic");
check(
  "Finisher specializations length",
  getArchetype("Finisher")!.specializations.length,
  3,
);

console.log("--- Maestrías (bonos pasivos, sin coste AP) ---");

check("11 maestrías cargadas", ARCHETYPE_MASTERIES.length, 11);

check(
  "Bonus Finisher activo",
  calculateMasteryBonuses(ARCHETYPE_MASTERIES, { Finisher: true }),
  { Compostura: 1, Definicion: 2 },
);
check(
  "Bonus acumulado Finisher + Magician",
  calculateMasteryBonuses(ARCHETYPE_MASTERIES, { Finisher: true, Magician: true }),
  { Compostura: 1, Definicion: 2, Efecto: 1, Aceleracion: 2 },
);

// Masteries never cost AP: base build stays at 0.
const withMasteries = evaluateBuild("Finisher", {}, { Finisher: true }, null, 40);
check("Maestrías no consumen AP", withMasteries.totalApSpent, 0);
check("Build remainingAp con maestrías", withMasteries.remainingAp, MAX_AP);

// Final stat = min(99, targetStat + masteryBonus).
const comp = withMasteries.breakdown.find((b) => b.attribute === "Compostura")!;
const defi = withMasteries.breakdown.find((b) => b.attribute === "Definicion")!;
check("Compostura base 75 + 1", [comp.targetStat, comp.masteryBonus, comp.statTotal], [75, 1, 76]);
check("Definicion base 75 + 2", [defi.targetStat, defi.masteryBonus, defi.statTotal], [75, 2, 77]);

// Mastery bonus is capped at 99 and does not reduce AP cost.
const capped = evaluateBuild("Finisher", { Definicion: 99 }, { Finisher: true }, null, 40);
const defiCapped = capped.breakdown.find((b) => b.attribute === "Definicion")!;
check("Definicion cap 99 + 2 => 99", defiCapped.statTotal, 99);
check(
  "AP de Definicion sin cambios por maestría",
  defiCapped.apCost,
  calculateSingleAttributeCost(75, 99, attr("Definicion").cost_tier),
);

// Malformed source row handled without inventing data.
const recycler = ARCHETYPE_MASTERIES.find((m) => m.archetype === "Recycler")!;
check("Recycler bonus_1 = 1", recycler.bonus_1, 1);
check("Recycler stat_2 conservado", recycler.stat_2, "Pase Corto");

console.log("--- Estrellas (SM/WF) ---");
check("Finisher base skills", getStars("Finisher")!.base_skills, 3);
check("Finisher base weak foot", getStars("Finisher")!.base_weak_foot, 3);
check("Boss max skills", getStars("Boss")!.max_skills, 4);
check("Magician base skills", getStars("Magician")!.base_skills, 4);
check("Recycler base skills", getStars("Recycler")!.base_skills, 2);

console.log("--- Coste de estrellas (AP compartido) ---");
const finStars = getStars("Finisher")!;

// Base selection => 0 AP.
check(
  "Estrellas en base => 0 AP",
  getStarsCost(finStars, finStars.base_skills, finStars.base_weak_foot),
  { skillsCost: 0, weakFootCost: 0, totalStarsCost: 0 },
);

// 5★ skills (15+25) + 4★ weak foot (35) = 75 AP.
check(
  "Finisher 5★SM / 4★WF => 75 AP",
  getStarsCost(finStars, 5, 4),
  { skillsCost: 40, weakFootCost: 35, totalStarsCost: 75 },
);

// Recycler starts at 2★ skills: 10+15+25 = 50 to reach 5★.
check(
  "Recycler 2->5★ skills => 50 AP",
  getStarsCost(getStars("Recycler")!, 5, getStars("Recycler")!.base_weak_foot).skillsCost,
  50,
);

// Shared budget: stats + stars.
const starsOnly = evaluateBuild("Finisher", {}, {}, { skills: 5, weakFoot: 4 }, 40);
check("Solo estrellas: totalApSpent", starsOnly.totalApSpent, 75);
check("Solo estrellas: statsApCost", starsOnly.statsApCost, 0);
check("Solo estrellas: totalStarsCost", starsOnly.totalStarsCost, 75);
check("Solo estrellas: remainingAp", starsOnly.remainingAp, MAX_AP - 75);
check("Solo estrellas: isValid", starsOnly.isValid, true);

// Stats + stars share the same 962 budget.
const combined = evaluateBuild("Finisher", { Sprint: 92 }, {}, { skills: 5, weakFoot: 4 }, 40);
check("Stats+estrellas: totalApSpent", combined.totalApSpent, 181 + 75);
check("Stats+estrellas: remainingAp", combined.remainingAp, MAX_AP - (181 + 75));

// Stars default to base when no selection is provided.
check(
  "Sin selección de estrellas => 0",
  evaluateBuild("Finisher", { Sprint: 92 }, {}, null, 40).totalStarsCost,
  0,
);

// Over-budget: maxing everything must flag invalid.
const overStars = evaluateBuild(
  "Finisher",
  { Sprint: 96, Aceleracion: 94, Definicion: 99 },
  {},
  { skills: 5, weakFoot: 5 },
  40,
);
check("Over-budget (stats+estrellas) isValid", overStars.isValid, overStars.totalApSpent <= MAX_AP);
check(
  "Over-budget remainingAp sin clampear",
  overStars.remainingAp,
  MAX_AP - overStars.totalApSpent,
);

console.log("--- Niveles (presupuesto dinámico) ---");
check("Nivel 1 => 100 AP", getMaxApForLevel(1), 100);
check("Nivel 5 => 146 AP", getMaxApForLevel(5), 146);
check("Nivel 20 => 397 AP", getMaxApForLevel(20), 397);
check("Nivel 40 => 962 AP", getMaxApForLevel(40), 962);
check("Nivel fuera de rango se clampea", getMaxApForLevel(999), 962);

// Level 1 budget is 100 AP: Sprint->92 (181 AP) must overflow.
const lvl1 = evaluateBuild("Finisher", { Sprint: 92 });
check("Nivel 1: maxAp", lvl1.maxAp, 100);
check("Nivel 1: level", lvl1.level, 1);
check("Nivel 1: sobregasto => isValid false", lvl1.isValid, false);
check("Nivel 1: overBy", lvl1.overBy, 181 - 100);
check("Nivel 1: remainingAp negativo", lvl1.remainingAp, 100 - 181);

console.log("--- Tabla de costes marginales (casos testigo) ---");
check("Caso testigo 75->90 Cheapest = 65", calculateAttributeUpgradeCost(75, 90, "Cheapest"), 65);
check("Caso testigo 75->90 Most Expensive = 177", calculateAttributeUpgradeCost(75, 90, "Most Expensive"), 177);
check("Caso testigo 75->99 Most Expensive = 467", calculateAttributeUpgradeCost(75, 99, "Most Expensive"), 467);
check("Punto individual 90 Cheapest = 8", getSinglePointCost(90, "Cheapest"), 8);
check("Punto individual 99 Most Expensive = 50", getSinglePointCost(99, "Most Expensive"), 50);
check("Alias coincide", calculateSingleAttributeCost(75, 90, "Cheapest"), 65);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
