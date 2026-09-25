export type CostTier = "Cheapest" | "Cheap" | "Expensive" | "Most Expensive";

export type CategoryName =
  | "Pace"
  | "Scoring"
  | "Passing"
  | "Ball Control"
  | "Defending"
  | "Physical"
  | "Goalkeeping";

/** A cost bracket mapping a stat range to the AP price per point for each tier. */
export interface CostTierRange {
  min: number;
  max: number;
  rates: Record<CostTier, number>;
}

/** Metadata for a single Pro Clubs archetype. */
export interface Archetype {
  id: number;
  name: string;
  role: string;
  primary_position: string;
  signature_playstyle_plus: string;
  specializations: string[];
  inspired_by: string;
  min_height: number;
  max_height: number;
  default_height: number;
  min_weight: number;
  max_weight: number;
  default_weight: number;
  base_ap: number;
}

/** A single attribute row of an archetype with its cost tier (raw CSV shape). */
export interface ArchetypeAttribute {
  archetype: string;
  category: string;
  attribute: string;
  base_stat: number;
  cap_stat: number;
  cost_tier: CostTier;
}

/** Fixed max-level mastery bonus unlocked by an archetype. */
export interface ArchetypeMastery {
  archetype: string;
  stat_1: string;
  bonus_1: number;
  stat_2: string;
  bonus_2: number;
}

/** Skill-moves / weak-foot starting values and upgrade costs per archetype. */
export interface ArchetypeStars {
  archetype: string;
  base_skills: number;
  max_skills: number;
  cost_skills_3: number;
  cost_skills_4: number;
  cost_skills_5: number;
  base_weak_foot: number;
  max_weak_foot: number;
  cost_wf_3: number;
  cost_wf_4: number;
  cost_wf_5: number;
}

/** Alias used by the star-cost engine function. */
export type ArchetypeStarsConfig = ArchetypeStars;

/** Selected skill-moves / weak-foot values for a build. */
export interface StarsSelection {
  skills: number;
  weakFoot: number;
}

/** Simple on/off state per archetype mastery: { [archetypeName]: boolean }. */
export type MasteriesState = Record<string, boolean>;

/** A stat requirement to use a PlayStyle. */
export interface PlayStyleRequirement {
  attributeId: string;
  min: number;
}

/** A PlayStyle (silver) with its icon, PlayStyle+ icon and requirements. */
export interface PlayStyleDef {
  id: string;
  name: string;
  category: string;
  /** Regular (silver) icon path. */
  icon: string;
  /** PlayStyle+ (gold) icon path. */
  iconplus: string;
  requirements: PlayStyleRequirement[];
}

/** Per-attribute cost breakdown produced by the engine. */
export interface AttributeBreakdown {
  category: CategoryName;
  attribute: string;
  baseStat: number;
  capStat: number;
  costTier: CostTier;
  /** Stat allocated with AP (slider value), bounded by baseStat..capStat. */
  targetStat: number;
  apCost: number;
  /** Passive bonus contributed by active masteries (does not cost AP). */
  masteryBonus: number;
  /** Height/weight delta applied to this attribute (does not cost AP). */
  physicalModifier: number;
  /** Final visible stat: min(99, targetStat + masteryBonus). */
  statTotal: number;
}

/** Full result of evaluating a build. */
export interface BuildResult {
  archetype: string;
  /** Active Pro level (1..40). */
  level: number;
  /** AP budget for the active level. */
  maxAp: number;
  /** Total AP = stats AP + stars AP. */
  totalApSpent: number;
  /** AP spent on attribute sliders only. */
  statsApCost: number;
  /** AP spent on skill-moves upgrades. */
  skillsCost: number;
  /** AP spent on weak-foot upgrades. */
  weakFootCost: number;
  /** skillsCost + weakFootCost. */
  totalStarsCost: number;
  remainingAp: number;
  overBy: number;
  isBudgetExceeded: boolean;
  isValid: boolean;
  errors: string[];
  breakdown: AttributeBreakdown[];
  byCategory: Record<CategoryName, number>;
  masteryBonuses: Record<string, number>;
}

/** Serialisable build state used for URL sharing. */
export interface BuildState {
  archetype: string;
  targetStats: Record<string, number>;
}