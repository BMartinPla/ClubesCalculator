import { calculateAttributeUpgradeCost } from "@/lib/buildEngine";
import { ATTRIBUTE_ID_TO_INTERNAL } from "@/lib/attributeNames";
import type { AttributeBreakdown, PlayStyleDef, PlayStyleRequirement } from "@/types";

export interface PlayStyleRequirementEstimate {
  attributeId: string;
  min: number;
  current: number;
  met: boolean;
  reachable: boolean;
  apCost: number;
}

export interface PlayStyleAutoUpgradePlan {
  /** Only attributes that need an AP-funded increase, keyed by internal attribute name. */
  targetStats: Record<string, number>;
  apCost: number;
  reachable: boolean;
}

export function canApplyPlayStyleAutoUpgrade(
  plan: PlayStyleAutoUpgradePlan,
  availableAp: number,
): boolean {
  return plan.reachable && plan.apCost <= availableAp;
}

/** Plan the smallest stat increases that satisfy requirements, without spending AP. */
export function planPlayStyleAutoUpgrade(
  requirements: PlayStyleRequirement[],
  breakdown: AttributeBreakdown[],
): PlayStyleAutoUpgradePlan {
  const upgrades = new Map<
    string,
    { entry: AttributeBreakdown; targetStat: number }
  >();
  let reachable = true;

  for (const requirement of requirements) {
    const attribute = ATTRIBUTE_ID_TO_INTERNAL[requirement.attributeId] ?? requirement.attributeId;
    const entry = breakdown.find((item) => item.attribute === attribute);
    if (!entry) {
      reachable = false;
      continue;
    }

    const passiveBonus = entry.masteryBonus + entry.physicalModifier;
    const neededTarget = Math.ceil(requirement.min - passiveBonus);
    if (requirement.min > Math.min(99, entry.capStat + passiveBonus)) {
      reachable = false;
    }

    const targetStat = Math.max(
      entry.targetStat,
      Math.max(entry.baseStat, Math.min(entry.capStat, neededTarget)),
    );
    const existing = upgrades.get(attribute);
    upgrades.set(attribute, {
      entry,
      targetStat: Math.max(existing?.targetStat ?? entry.targetStat, targetStat),
    });
  }

  const targetStats: Record<string, number> = {};
  let apCost = 0;
  for (const [attribute, upgrade] of upgrades) {
    if (upgrade.targetStat <= upgrade.entry.targetStat) continue;
    targetStats[attribute] = upgrade.targetStat;
    apCost += calculateAttributeUpgradeCost(
      upgrade.entry.targetStat,
      upgrade.targetStat,
      upgrade.entry.costTier,
    );
  }

  return { targetStats, apCost, reachable };
}

/** Estimate the additional AP needed to reach every requirement in a PlayStyle. */
export function estimatePlayStyleRequirements(
  playStyle: PlayStyleDef,
  breakdown: AttributeBreakdown[],
): PlayStyleRequirementEstimate[] {
  return playStyle.requirements.map((requirement) => {
    const attribute = ATTRIBUTE_ID_TO_INTERNAL[requirement.attributeId] ?? requirement.attributeId;
    const entry = breakdown.find((item) => item.attribute === attribute);
    const current = entry?.statTotal ?? 0;

    if (!entry) {
      return { ...requirement, current, met: false, reachable: false, apCost: 0 };
    }

    const met = current >= requirement.min;
    const passiveBonus = entry.masteryBonus + entry.physicalModifier;
    const targetStat = Math.max(
      entry.targetStat,
      Math.ceil(requirement.min - passiveBonus),
    );
    const reachable = requirement.min <= Math.min(99, entry.capStat + passiveBonus);

    return {
      ...requirement,
      current,
      met,
      reachable,
      apCost:
        met || !reachable
          ? 0
          : calculateAttributeUpgradeCost(entry.targetStat, targetStat, entry.costTier),
    };
  });
}
