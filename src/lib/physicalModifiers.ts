import { getArchetype } from "@/data/archetypes";

/**
 * Height/weight -> stat modifiers, ported from the ProLeague builder.
 * The delta between the current and the archetype's base value is converted to
 * a magnitude (1 per `step` units) and applied to the affected attributes.
 */

/** Web stat id -> our attribute name. */
const ATTR: Record<string, string> = {
  acceleration: "Aceleracion",
  agility: "Agilidad",
  balance: "Balance",
  jumping: "Salto",
  sprint_speed: "Sprint",
  strength: "Fuerza",
  gk_diving: "GK_Estirada",
  gk_handling: "GK_Paradas",
  gk_reflexes: "GK_Reflejos",
};

/**
 * Magnitude of a difference: first unit counts as 1, then +1 every `step`
 * units beyond that (matches the web's `qe`).
 */
export function physicalStepMagnitude(
  current: number,
  base: number,
  step: number,
): number {
  const r = Number(current) - Number(base);
  if (r === 0 || !Number.isFinite(r)) return 0;
  const sign = r > 0 ? 1 : -1;
  const a = Math.abs(r);
  let o = 1;
  if (a > 1) o += Math.floor((a - 1) / step);
  return o * sign;
}

export function isGoalkeeperRole(role: string | undefined): boolean {
  return /arquer/i.test(role ?? "");
}

/**
 * Stat modifiers for a given archetype at the given height/weight.
 * Returns a sparse map of our attribute names -> delta (only non-zero).
 */
export function getPhysicalModifiers(
  archetypeName: string,
  heightCm: number,
  weightKg: number,
): Record<string, number> {
  const arch = getArchetype(archetypeName);
  const baseH = arch?.default_height ?? 180;
  const baseW = arch?.default_weight ?? 75;
  const gk = isGoalkeeperRole(arch?.role);

  const deltas: Record<string, number> = {};
  const add = (id: string, v: number) => {
    const name = ATTR[id];
    if (!name) return;
    deltas[name] = (deltas[name] ?? 0) + v;
  };

  const h = physicalStepMagnitude(heightCm, baseH, 4);
  const w = physicalStepMagnitude(weightKg, baseW, 8);

  if (h !== 0) {
    if (gk) {
      add("gk_diving", h);
      add("gk_handling", -h);
      add("gk_reflexes", h);
      add("acceleration", -h);
      add("sprint_speed", h);
      add("strength", h);
    } else {
      add("acceleration", -h);
      add("agility", -h);
      add("balance", -h);
      add("jumping", h);
      add("sprint_speed", h);
      add("strength", h);
    }
  }

  if (w !== 0) {
    if (gk) {
      add("gk_diving", -w);
      add("gk_handling", w);
      add("gk_reflexes", -w);
      add("acceleration", -w);
      add("sprint_speed", -w);
      add("strength", w);
    } else {
      add("acceleration", -w);
      add("agility", -w);
      add("balance", w);
      add("jumping", w);
      add("sprint_speed", -w);
      add("strength", w);
    }
  }

  for (const key of Object.keys(deltas)) if (deltas[key] === 0) delete deltas[key];
  return deltas;
}

/** Modifier for a single attribute name. */
export function getPhysicalModifier(
  archetypeName: string,
  heightCm: number,
  weightKg: number,
  attribute: string,
): number {
  return getPhysicalModifiers(archetypeName, heightCm, weightKg)[attribute] ?? 0;
}
