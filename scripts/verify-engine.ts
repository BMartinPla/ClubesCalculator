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
import { ARCHETYPES, getArchetype } from "../src/data/archetypes";
import { getArchetypeAttributes } from "../src/data/archetypeAttributes";
import { ARCHETYPE_MASTERIES } from "../src/data/archetypeMasteries";
import { getStars } from "../src/data/archetypeStars";
import { getMaxApForLevel } from "../src/data/levelProgression";
import {
  optimizeForAnimationThreshold,
  evaluateArchetypeForThreshold,
  buildThresholdTargets,
} from "../src/lib/animationOptimizer";

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

console.log("--- Dataset (13 arquetipos, desde proleague.tools) ---");
check("13 arquetipos", ARCHETYPES.length, 13);
check("13 maestrías", ARCHETYPE_MASTERIES.length, 13);
check(
  "Incluye porteros",
  ["Shot Stopper", "Sweeper Keeper"].every((n) => ARCHETYPES.some((a) => a.name === n)),
  true,
);
check("Finisher Aceleracion", [attr("Aceleracion").base_stat, attr("Aceleracion").cap_stat, attr("Aceleracion").cost_tier], [75, 95, "Expensive"]);
check("Finisher Sprint", [attr("Sprint").base_stat, attr("Sprint").cap_stat, attr("Sprint").cost_tier], [70, 95, "Cheapest"]);
check("Finisher Definicion", [attr("Definicion").base_stat, attr("Definicion").cap_stat, attr("Definicion").cost_tier], [75, 99, "Most Expensive"]);

console.log("--- Coste marginal (casos testigo) ---");
check("75->90 Cheapest = 65", calculateAttributeUpgradeCost(75, 90, "Cheapest"), 65);
check("75->90 Most Expensive = 177", calculateAttributeUpgradeCost(75, 90, "Most Expensive"), 177);
check("75->99 Most Expensive = 467", calculateAttributeUpgradeCost(75, 99, "Most Expensive"), 467);
check("Punto individual 99 ME = 50", getSinglePointCost(99, "Most Expensive"), 50);
check("Alias coincide", calculateSingleAttributeCost(75, 90, "Cheapest"), 65);

console.log("--- evaluateBuild ---");
const base = evaluateBuild("Finisher", {}, {}, null, 40);
check("Base build 0 AP", base.totalApSpent, 0);
check("Base build remainingAp", base.remainingAp, MAX_AP);

// Sprint -> cap (95) costs what the data says (marginal, no magic numbers).
const sprintCost = calculateAttributeUpgradeCost(
  attr("Sprint").base_stat,
  attr("Sprint").cap_stat,
  attr("Sprint").cost_tier,
);
const build = evaluateBuild("Finisher", { Sprint: attr("Sprint").cap_stat }, {}, null, 40);
check("Sprint a tope = coste marginal", build.breakdown.find((b) => b.attribute === "Sprint")!.apCost, sprintCost);
check("Build totalApSpent", build.totalApSpent, sprintCost);
check("Build isValid", build.isValid, true);

const clamped = evaluateBuild("Finisher", { Sprint: 999 }, {}, null, 40);
check("Sprint clamp a cap", clamped.breakdown.find((b) => b.attribute === "Sprint")!.targetStat, attr("Sprint").cap_stat);

console.log("--- Niveles ---");
check("Nivel 1 => 100 AP", getMaxApForLevel(1), 100);
check("Nivel 40 => 962 AP", getMaxApForLevel(40), 962);
const lvl1 = evaluateBuild("Finisher", { Definicion: 99 });
check("Nivel 1 maxAp", lvl1.maxAp, 100);
check("Nivel 1 sobregasto", lvl1.isValid, false);

console.log("--- Maestrías (pasivas) ---");
check(
  "Bonus Finisher",
  calculateMasteryBonuses(ARCHETYPE_MASTERIES, { Finisher: true }),
  { Definicion: 2, Compostura: 1 },
);
const withM = evaluateBuild("Finisher", {}, { Finisher: true }, null, 40);
check("Maestrías no cuestan AP", withM.totalApSpent, 0);
check(
  "statTotal con maestría",
  withM.breakdown.find((b) => b.attribute === "Definicion")!.statTotal,
  Math.min(99, attr("Definicion").base_stat + 2),
);

console.log("--- Estrellas ---");
const finStars = getStars("Finisher")!;
check("Finisher base 3SM/3WF", [finStars.base_skills, finStars.base_weak_foot], [3, 3]);
check(
  "Finisher 5SM/5WF = 125 AP",
  getStarsCost(finStars, 5, 5),
  { skillsCost: 40, weakFootCost: 85, totalStarsCost: 125 },
);
const bossStars = getStars("Boss")!;
check("Boss max 3SM/4WF", [bossStars.max_skills, bossStars.max_weak_foot], [3, 4]);
const disStars = getStars("Disruptor")!;
check("Disruptor base 2SM/3WF", [disStars.base_skills, disStars.base_weak_foot], [2, 3]);

console.log("--- Optimizador de animaciones ---");
const opt71 = optimizeForAnimationThreshold(["Aceleracion"], 71, {});
check("Optimizador 13 resultados", opt71.results.length, 13);
check("Optimizador best 0 AP (base >= 71)", opt71.best?.totalCost, 0);
check(
  "Targets Spark Centros@85 en rango",
  (() => {
    const t = buildThresholdTargets("Spark", ["Centros"], 85, {})["Centros"];
    const a = getArchetypeAttributes("Spark").find((x) => x.attribute === "Centros")!;
    return t >= a.base_stat && t <= a.cap_stat;
  })(),
  true,
);
check(
  "Maestría pasiva cubre umbral => 0 AP",
  evaluateArchetypeForThreshold("Finisher", ["Centros"], 71, { Centros: 20 }).totalCost,
  0,
);

console.log("--- Altura/peso por arquetipo ---");
check("Finisher rango altura", [getArchetype("Finisher")!.min_height, getArchetype("Finisher")!.max_height], [164, 190]);
check("Boss default peso", getArchetype("Boss")!.default_weight, 90);
check("clamp altura Boss", clamp(150, getArchetype("Boss")!.min_height, getArchetype("Boss")!.max_height), 180);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
