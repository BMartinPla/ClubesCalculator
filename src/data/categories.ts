import type { CategoryName } from "@/types";

export const CATEGORY_ORDER: CategoryName[] = [
  "Pace",
  "Scoring",
  "Passing",
  "Ball Control",
  "Defending",
  "Physical",
  "Goalkeeping",
];

export const CATEGORY_LABELS: Record<CategoryName, string> = {
  Pace: "Ritmo",
  Scoring: "Tiro",
  Passing: "Pase",
  "Ball Control": "Regate",
  Defending: "Defensa",
  Physical: "Físico",
  Goalkeeping: "Portería",
};

export const CATEGORY_ICONS: Record<CategoryName, string> = {
  Pace: "⚡",
  Scoring: "🎯",
  Passing: "🎩",
  "Ball Control": "🪄",
  Defending: "🛡️",
  Physical: "💪",
  Goalkeeping: "🧤",
};