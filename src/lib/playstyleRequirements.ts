import { calculateAttributeUpgradeCost } from "@/lib/buildEngine";
import { ATTRIBUTE_ID_TO_INTERNAL } from "@/lib/attributeNames";
import type { AttributeBreakdown, PlayStyleDef } from "@/types";

export interface PlayStyleRequirementEstimate {
  attributeId: string;
  min: number;
  current: number;
  met: boolean;
  reachable: boolean;
  apCost: number;
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
