import { COST_TIERS_TABLE } from "@/data/costTiers";
import { getArchetypeAttributes } from "@/data/archetypeAttributes";
import { ARCHETYPE_MASTERIES } from "@/data/archetypeMasteries";
import { getStars } from "@/data/archetypeStars";
import { CATEGORY_ORDER } from "@/data/categories";
import { getMaxApForLevel, MAX_LEVEL, MIN_LEVEL } from "@/data/levelProgression";
import type {
  ArchetypeMastery,
  ArchetypeStarsConfig,
  AttributeBreakdown,
  BuildResult,
  CategoryName,
  CostTier,
  MasteriesState,
  StarsSelection,
} from "@/types";

/** Maximum AP budget at the highest level (Level 40). */
export const MAX_AP = getMaxApForLevel(MAX_LEVEL);

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** AP price of a single point at a given stat value, per cost tier. */
export function getPointCost(pt: number, tier: CostTier): number {
  const range = COST_TIERS_TABLE.find(
    (r) => pt >= Number(r.min) && pt <= Number(r.max),
  );
  return range ? Number(range.rates[tier]) : 0;
}

/**
 * Cost to move one attribute from `fromStat` to `toStat`.
 *
 * Strictly marginal: iterates every intermediate point and adds that point's
 * tier rate. Direct multiplication like (target - base) * rate is forbidden.
 * If `toStat <= fromStat` the cost is exactly 0.
 */
export function calculateSingleAttributeCost(
  fromStat: number,
  toStat: number,
  tier: CostTier,
): number {
  if (toStat <= fromStat) return 0;

  let cost = 0;
  for (let pt = fromStat + 1; pt <= toStat; pt++) {
    cost += getPointCost(pt, tier);
  }
  return cost;
}

/**
 * Total passive bonus per stat contributed by the active masteries.
 * Masteries do NOT consume AP.
 */
export function calculateMasteryBonuses(
  masteries: ArchetypeMastery[],
  activeMasteries: MasteriesState,
): Record<string, number> {
  const bonuses: Record<string, number> = {};

  for (const m of masteries) {
    if (activeMasteries[m.archetype]) {
      bonuses[m.stat_1] = (bonuses[m.stat_1] || 0) + Number(m.bonus_1);
      bonuses[m.stat_2] = (bonuses[m.stat_2] || 0) + Number(m.bonus_2);
    }
  }

  return bonuses;
}

/**
 * Marginal AP cost of upgrading skill-moves / weak-foot stars.
 * Each star level adds its own threshold cost on top of the previous ones.
 */
export function getStarsCost(
  config: ArchetypeStarsConfig,
  targetSkills: number,
  targetWeakFoot: number,
): { skillsCost: number; weakFootCost: number; totalStarsCost: number } {
  let skillsCost = 0;
  let weakFootCost = 0;

  // Filigranas (Skill Moves)
  if (targetSkills >= 3 && config.base_skills < 3)
    skillsCost += Number(config.cost_skills_3);
  if (targetSkills >= 4 && config.base_skills < 4)
    skillsCost += Number(config.cost_skills_4);
  if (targetSkills >= 5 && config.base_skills < 5)
    skillsCost += Number(config.cost_skills_5);

  // Pierna Mala (Weak Foot)
  if (targetWeakFoot >= 3 && config.base_weak_foot < 3)
    weakFootCost += Number(config.cost_wf_3);
  if (targetWeakFoot >= 4 && config.base_weak_foot < 4)
    weakFootCost += Number(config.cost_wf_4);
  if (targetWeakFoot >= 5 && config.base_weak_foot < 5)
    weakFootCost += Number(config.cost_wf_5);

  return {
    skillsCost,
    weakFootCost,
    totalStarsCost: skillsCost + weakFootCost,
  };
}

/**
 * Evaluate a full build from an archetype and the user's chosen stats.
 *
 * No physical (height/weight) modifiers are applied: each attribute's effective
 * base is exactly its native `base_stat` and its cap is exactly `cap_stat`.
 * AP is charged on the allocated attribute points (base_stat -> targetStat) AND
 * on the skill-moves / weak-foot star upgrades, sharing the same 962 AP budget.
 * Active masteries add a flat, AP-free bonus on top of each stat, capped at 99.
 */
export function evaluateBuild(
  archetypeName: string,
  userStats: Record<string, number> = {},
  activeMasteries: MasteriesState = {},
  stars: StarsSelection | null = null,
  level: number = MIN_LEVEL,
): BuildResult {
  const level_ = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level) || MIN_LEVEL));
  const maxAp = getMaxApForLevel(level_);
  const attributes = getArchetypeAttributes(archetypeName);
  const masteryBonuses = calculateMasteryBonuses(
    ARCHETYPE_MASTERIES,
    activeMasteries,
  );
  const byCategory = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, 0]),
  ) as Record<CategoryName, number>;

  // Stars configuration + selection for the active archetype.
  const starsConfig = getStars(archetypeName);
  const targetSkills = stars?.skills ?? starsConfig?.base_skills ?? 0;
  const targetWeakFoot = stars?.weakFoot ?? starsConfig?.base_weak_foot ?? 0;
  const { skillsCost, weakFootCost, totalStarsCost } = starsConfig
    ? getStarsCost(starsConfig, targetSkills, targetWeakFoot)
    : { skillsCost: 0, weakFootCost: 0, totalStarsCost: 0 };

  const errors: string[] = [];
  const breakdown: AttributeBreakdown[] = [];
  let statsApCost = 0;

  for (const item of attributes) {
    const effectiveBase = Number(item.base_stat);
    const effectiveCap = Number(item.cap_stat);
    const category = item.category as CategoryName;

    const requested = userStats[item.attribute] ?? effectiveBase;
    const targetStat = clamp(requested, effectiveBase, effectiveCap);

    // AP is charged strictly on the allocated points (base -> target).
    const apCost =
      targetStat > effectiveBase
        ? calculateSingleAttributeCost(
            effectiveBase,
            targetStat,
            item.cost_tier,
          )
        : 0;

    const masteryBonus = masteryBonuses[item.attribute] ?? 0;
    const statTotal = Math.min(99, targetStat + masteryBonus);

    statsApCost += apCost;
    byCategory[category] = (byCategory[category] ?? 0) + apCost;

    breakdown.push({
      category,
      attribute: item.attribute,
      baseStat: effectiveBase,
      capStat: effectiveCap,
      costTier: item.cost_tier,
      targetStat,
      apCost,
      masteryBonus,
      statTotal,
    });
  }

  // Single shared budget: stats + stars, capped by the active level.
  const totalApSpent = statsApCost + totalStarsCost;
  const remainingAp = maxAp - totalApSpent;
  const isBudgetExceeded = totalApSpent > maxAp;
  const overBy = Math.max(0, totalApSpent - maxAp);

  if (isBudgetExceeded) {
    errors.push(`Presupuesto excedido en ${overBy} AP (máximo ${maxAp} AP).`);
  }

  return {
    archetype: archetypeName,
    level: level_,
    maxAp,
    totalApSpent,
    statsApCost,
    skillsCost,
    weakFootCost,
    totalStarsCost,
    remainingAp,
    overBy,
    isBudgetExceeded,
    isValid: totalApSpent <= maxAp,
    errors,
    breakdown,
    byCategory,
    masteryBonuses,
  };
}

export type BudgetStatus = "ok" | "warn" | "over";

/** Threshold ratio after which the header switches from green to amber. */
export const BUDGET_WARN_RATIO = 0.9;

export function getBudgetStatus(spent: number, maxAp: number = MAX_AP): BudgetStatus {
  if (spent > maxAp) return "over";
  if (spent >= BUDGET_WARN_RATIO * maxAp) return "warn";
  return "ok";
}