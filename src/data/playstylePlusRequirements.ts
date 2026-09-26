import type { PlayStyleRequirement } from "@/types";

/** Gold specialization thresholds published by the ProLeague Clubs Builder. */
const REQUIREMENTS: Record<string, Record<string, PlayStyleRequirement[]>> = {
  Finisher: {
    chip_shot: [{ attributeId: "ball_control", min: 90 }, { attributeId: "composure", min: 92 }, { attributeId: "reactions", min: 90 }],
    relentless: [{ attributeId: "agility", min: 90 }, { attributeId: "stamina", min: 92 }, { attributeId: "aggression", min: 90 }],
    game_changer: [{ attributeId: "att_position", min: 90 }, { attributeId: "finishing", min: 90 }, { attributeId: "curve", min: 92 }],
  },
  Target: {
    acrobatic: [{ attributeId: "agility", min: 90 }, { attributeId: "jumping", min: 92 }, { attributeId: "volleys", min: 90 }],
    incisive_pass: [{ attributeId: "vision", min: 90 }, { attributeId: "long_passing", min: 90 }, { attributeId: "short_passing", min: 92 }],
    enforcer: [{ attributeId: "sprint_speed", min: 92 }, { attributeId: "strength", min: 90 }, { attributeId: "att_position", min: 90 }],
  },
  Magician: {
    first_touch: [{ attributeId: "acceleration", min: 90 }, { attributeId: "composure", min: 90 }, { attributeId: "ball_control", min: 92 }],
    power_shot: [{ attributeId: "finishing", min: 90 }, { attributeId: "shot_power", min: 92 }, { attributeId: "long_shots", min: 90 }],
    incisive_pass: [{ attributeId: "att_position", min: 90 }, { attributeId: "vision", min: 90 }, { attributeId: "long_passing", min: 92 }],
  },
  Spark: {
    quick_step: [{ attributeId: "sprint_speed", min: 90 }, { attributeId: "acceleration", min: 90 }, { attributeId: "agility", min: 92 }],
    whipped_pass: [{ attributeId: "att_position", min: 90 }, { attributeId: "crossing", min: 92 }, { attributeId: "long_passing", min: 90 }],
    chip_shot: [{ attributeId: "reactions", min: 90 }, { attributeId: "ball_control", min: 90 }, { attributeId: "finishing", min: 92 }],
  },
  Creator: {
    whipped_pass: [{ attributeId: "vision", min: 92 }, { attributeId: "crossing", min: 90 }, { attributeId: "long_passing", min: 90 }],
    dead_ball: [{ attributeId: "crossing", min: 92 }, { attributeId: "fk_accuracy", min: 90 }, { attributeId: "shot_power", min: 90 }],
    power_shot: [{ attributeId: "finishing", min: 90 }, { attributeId: "shot_power", min: 92 }, { attributeId: "long_shots", min: 90 }],
  },
  Maestro: {
    technical: [{ attributeId: "balance", min: 90 }, { attributeId: "vision", min: 92 }, { attributeId: "dribbling", min: 90 }],
    first_touch: [{ attributeId: "composure", min: 92 }, { attributeId: "ball_control", min: 90 }, { attributeId: "finishing", min: 90 }],
    relentless: [{ attributeId: "agility", min: 92 }, { attributeId: "stamina", min: 90 }, { attributeId: "aggression", min: 90 }],
  },
  Disruptor: {
    intercept: [{ attributeId: "balance", min: 90 }, { attributeId: "reactions", min: 90 }, { attributeId: "interceptions", min: 92 }],
    slide_tackle: [{ attributeId: "sprint_speed", min: 90 }, { attributeId: "strength", min: 92 }, { attributeId: "sliding_tackle", min: 90 }],
    bruiser: [{ attributeId: "ball_control", min: 90 }, { attributeId: "dribbling", min: 90 }, { attributeId: "short_passing", min: 92 }],
  },
  Recycler: {
    pinged_pass: [{ attributeId: "strength", min: 90 }, { attributeId: "long_passing", min: 90 }, { attributeId: "short_passing", min: 92 }],
    enforcer: [{ attributeId: "sprint_speed", min: 90 }, { attributeId: "balance", min: 92 }, { attributeId: "strength", min: 90 }],
    anticipate: [{ attributeId: "interceptions", min: 90 }, { attributeId: "def_aware", min: 90 }, { attributeId: "standing_tackle", min: 92 }],
  },
  Boss: {
    slide_tackle: [{ attributeId: "strength", min: 90 }, { attributeId: "aggression", min: 90 }, { attributeId: "sliding_tackle", min: 92 }],
    press_proven: [{ attributeId: "composure", min: 92 }, { attributeId: "vision", min: 90 }, { attributeId: "ball_control", min: 90 }],
    block: [{ attributeId: "def_aware", min: 92 }, { attributeId: "reactions", min: 90 }, { attributeId: "agility", min: 90 }],
  },
  Progressor: {
    jockey: [{ attributeId: "long_passing", min: 90 }, { attributeId: "def_aware", min: 90 }, { attributeId: "standing_tackle", min: 92 }],
    pinged_pass: [{ attributeId: "dribbling", min: 92 }, { attributeId: "long_passing", min: 90 }, { attributeId: "short_passing", min: 90 }],
    quick_step: [{ attributeId: "acceleration", min: 92 }, { attributeId: "sprint_speed", min: 90 }, { attributeId: "sliding_tackle", min: 90 }],
  },
  Marauder: {
    slide_tackle: [{ attributeId: "sprint_speed", min: 92 }, { attributeId: "aggression", min: 90 }, { attributeId: "sliding_tackle", min: 90 }],
    rapid: [{ attributeId: "dribbling", min: 90 }, { attributeId: "sprint_speed", min: 92 }, { attributeId: "acceleration", min: 90 }],
    bruiser: [{ attributeId: "strength", min: 92 }, { attributeId: "aggression", min: 90 }, { attributeId: "def_aware", min: 90 }],
  },
  "Shot Stopper": {
    gk_cross_claimer: [{ attributeId: "jumping", min: 90 }, { attributeId: "gk_handling", min: 92 }, { attributeId: "gk_positioning", min: 90 }],
    gk_rush_out: [{ attributeId: "acceleration", min: 90 }, { attributeId: "agility", min: 90 }, { attributeId: "gk_reflexes", min: 92 }],
    gk_deflector: [{ attributeId: "strength", min: 90 }, { attributeId: "gk_diving", min: 92 }, { attributeId: "gk_positioning", min: 90 }],
  },
  "Sweeper Keeper": {
    gk_far_throw: [{ attributeId: "vision", min: 90 }, { attributeId: "gk_diving", min: 92 }, { attributeId: "gk_kicking", min: 90 }],
    long_ball_pass: [{ attributeId: "long_passing", min: 90 }, { attributeId: "gk_kicking", min: 92 }, { attributeId: "gk_reflexes", min: 90 }],
    press_proven: [{ attributeId: "gk_positioning", min: 92 }, { attributeId: "short_passing", min: 90 }, { attributeId: "composure", min: 90 }],
  },
};

export function getPlayStylePlusRequirements(
  archetypeName: string,
  playStyleId: string,
): PlayStyleRequirement[] | undefined {
  return REQUIREMENTS[archetypeName]?.[playStyleId];
}
