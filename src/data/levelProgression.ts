// Official Pro Clubs level progression: AP granted at each level.
// Level 1 starts with 100 AP; level 40 reaches the 962 AP total budget.

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 40;

/**
 * AP granted when reaching each level (index 0 = Level 1 = base 100).
 * Order follows the official progression table:
 * L1=100 · L2-4=+9 · L5=+19 · L6-9=+10 · L10=+38 · L11-14=+13 · L15=+25 ·
 * L16-19=+13 · L20=+44 · L21-24=+19 · L25=+38 · L26-29=+25 · L30=+63 ·
 * L31-34=+25 · L35=+38 · L36-39=+25 · L40=+50.
 */
export const LEVEL_AP_GAIN: readonly number[] = [
  100, // 1
  9, 9, 9, // 2-4
  19, // 5
  10, 10, 10, 10, // 6-9
  38, // 10
  13, 13, 13, 13, // 11-14
  25, // 15
  13, 13, 13, 13, // 16-19
  44, // 20
  19, 19, 19, 19, // 21-24
  38, // 25
  25, 25, 25, 25, // 26-29
  63, // 30
  25, 25, 25, 25, // 31-34
  38, // 35
  25, 25, 25, 25, // 36-39
  50, // 40
];

/** Cumulative AP budget for each level (index 0 = Level 1). */
export const LEVEL_AP_CUMULATIVE: readonly number[] = LEVEL_AP_GAIN.reduce<
  number[]
>((acc, gain) => {
  acc.push((acc[acc.length - 1] ?? 0) + gain);
  return acc;
}, []);

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_LEVEL;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level)));
}

/** Maximum AP budget available at the given Pro level (1..40). */
export function getMaxApForLevel(level: number): number {
  return LEVEL_AP_CUMULATIVE[clampLevel(level) - 1];
}

/** "Level 40 (962 AP)" */
export function getLevelLabel(level: number): string {
  const lvl = clampLevel(level);
  return `Level ${lvl} (${getMaxApForLevel(lvl)} AP)`;
}

/** Every level with its AP budget, from 1 to 40. */
export const LEVEL_OPTIONS: readonly { level: number; maxAp: number }[] =
  LEVEL_AP_CUMULATIVE.map((maxAp, index) => ({ level: index + 1, maxAp }));
