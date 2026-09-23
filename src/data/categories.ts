import type { CategoryName } from "@/types";

export const CATEGORY_ORDER: CategoryName[] = [
  "Pace",
  "Shooting",
  "Passing",
  "Dribbling",
  "Defending",
  "Physical",
  "Goalkeeping",
];

export const CATEGORY_LABELS: Record<CategoryName, string> = {
  Pace: "Ritmo",
  Shooting: "Tiro",
  Passing: "Pase",
  Dribbling: "Regate",
  Defending: "Defensa",
  Physical: "Físico",
  Goalkeeping: "Portería",
};

export const CATEGORY_ICONS: Record<CategoryName, string> = {
  Pace: "⚡",
  Shooting: "🎯",
  Passing: "🎩",
  Dribbling: "🪄",
  Defending: "🛡️",
  Physical: "💪",
  Goalkeeping: "🧤",
};
