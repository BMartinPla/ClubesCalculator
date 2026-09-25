import { ARCHETYPES } from "@/data/archetypes";
import { getArchetypeAttributes } from "@/data/archetypeAttributes";
import { calculateAttributeUpgradeCost } from "@/lib/buildEngine";
import type { CostTier } from "@/types";

export type AnimationThreshold = 71 | 85;

export interface AttributeCostDetail {
  attribute: string;
  base: number;
  cap: number;
  /** Allocated stat needed (already accounts for mastery bonus). */
  target: number;
  cost: number;
  possible: boolean;
  reason?: string;
}

export interface ArchetypeOptimization {
  archetype: string;
  totalCost: number;
  isPossible: boolean;
  details: AttributeCostDetail[];
  impossibleAttributes: string[];
}

export interface AnimationOptimizationResult {
  threshold: AnimationThreshold;
  results: ArchetypeOptimization[];
  best: ArchetypeOptimization | null;
}

/**
 * Cost of bringing a set of attributes up to an animation threshold on a given
 * archetype. Mastery bonuses are passive: they count toward the threshold but
 * never cost AP.
 */
export function evaluateArchetypeForThreshold(
  archetype: string,
  selectedAttributes: string[],
  threshold: AnimationThreshold,
  masteryBonus: Record<string, number> = {},
): ArchetypeOptimization {
  const byName = new Map(
    getArchetypeAttributes(archetype).map((a) => [a.attribute, a]),
  );

  const details: AttributeCostDetail[] = [];
  const impossibleAttributes: string[] = [];
  let totalCost = 0;

  for (const name of selectedAttributes) {
    const item = byName.get(name);

    if (!item) {
      details.push({
        attribute: name,
        base: 0,
        cap: 0,
        target: threshold,
        cost: 0,
        possible: false,
        reason: "This archetype does not have this attribute",
      });
      impossibleAttributes.push(name);
      continue;
    }

    const bonus = masteryBonus[name] ?? 0;
    const base = Number(item.base_stat);
    const cap = Number(item.cap_stat);

    // Already reaches the threshold with the base (+ passive mastery).
    if (base + bonus >= threshold) {
      details.push({ attribute: name, base, cap, target: base, cost: 0, possible: true });
      continue;
    }

    // Cap (+ passive mastery) can never reach the threshold.
    if (cap + bonus < threshold) {
      details.push({
        attribute: name,
        base,
        cap,
        target: cap,
        cost: 0,
        possible: false,
        reason: `Tope ${cap}${bonus > 0 ? ` (+${bonus} M)` : ""} < ${threshold}`,
      });
      impossibleAttributes.push(name);
      continue;
    }

    // Allocated target so that target + passive bonus === threshold.
    const target = threshold - bonus;
    const cost = calculateAttributeUpgradeCost(base, target, item.cost_tier as CostTier);
    totalCost += cost;
    details.push({ attribute: name, base, cap, target, cost, possible: true });
  }

  return {
    archetype,
    totalCost,
    isPossible: impossibleAttributes.length === 0,
    details,
    impossibleAttributes,
  };
}

/**
 * Ranks every archetype by the cheapest AP cost to reach an animation
 * threshold for the selected attributes. Viable archetypes (reachable caps)
 * come first, sorted by ascending cost.
 */
export function optimizeForAnimationThreshold(
  selectedAttributes: string[],
  threshold: AnimationThreshold,
  masteryBonus: Record<string, number> = {},
): AnimationOptimizationResult {
  const results = ARCHETYPES.map((a) =>
    evaluateArchetypeForThreshold(a.name, selectedAttributes, threshold, masteryBonus),
  );

  results.sort((a, b) => {
    if (a.isPossible !== b.isPossible) return a.isPossible ? -1 : 1;
    if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
    return a.impossibleAttributes.length - b.impossibleAttributes.length;
  });

  return {
    threshold,
    results,
    best: results.find((r) => r.isPossible) ?? null,
  };
}

/**
 * Slider targets (allocated stats) needed to apply a threshold on an archetype.
 * Attributes already meeting the threshold are skipped; the rest are set to
 * `min(threshold - bonus, cap)`.
 */
export function buildThresholdTargets(
  archetype: string,
  selectedAttributes: string[],
  threshold: AnimationThreshold,
  masteryBonus: Record<string, number> = {},
): Record<string, number> {
  const byName = new Map(
    getArchetypeAttributes(archetype).map((a) => [a.attribute, a]),
  );

  const targets: Record<string, number> = {};
  for (const name of selectedAttributes) {
    const item = byName.get(name);
    if (!item) continue;

    const bonus = masteryBonus[name] ?? 0;
    const base = Number(item.base_stat);
    const cap = Number(item.cap_stat);

    if (base + bonus >= threshold) continue;
    targets[name] = Math.min(cap, Math.max(base, threshold - bonus));
  }
  return targets;
}

/** Canonical 29 field attributes, grouped by category in display order. */
export function getCanonicalAttributesByCategory(): { category: string; attributes: string[] }[] {
  const first = getArchetypeAttributes(ARCHETYPES[0].name);
  const order = ["Pace", "Scoring", "Passing", "Ball Control", "Defending", "Physical"];
  const byCategory = new Map<string, string[]>();
  for (const item of first) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item.attribute);
    byCategory.set(item.category, list);
  }
  return order
    .filter((c) => byCategory.has(c))
    .map((category) => ({ category, attributes: byCategory.get(category)! }));
}
