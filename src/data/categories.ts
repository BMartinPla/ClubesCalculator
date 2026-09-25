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
  Pace: "Pace",
  Scoring: "Scoring",
  Passing: "Passing",
  "Ball Control": "Ball Control",
  Defending: "Defending",
  Physical: "Physical",
  Goalkeeping: "Goalkeeping",
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

export interface CategoryAccent {
  text: string;
  border: string;
  bg: string;
  bar: string;
  dot: string;
}

/** Per-category color language used across the whole UI. */
export const CATEGORY_ACCENTS: Record<CategoryName, CategoryAccent> = {
  Pace: {
    text: "text-cyan-300",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    bar: "bg-cyan-400",
    dot: "bg-cyan-400",
  },
  Scoring: {
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
  },
  Passing: {
    text: "text-sky-300",
    border: "border-sky-500/30",
    bg: "bg-sky-500/10",
    bar: "bg-sky-400",
    dot: "bg-sky-400",
  },
  "Ball Control": {
    text: "text-violet-300",
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    bar: "bg-violet-400",
    dot: "bg-violet-400",
  },
  Defending: {
    text: "text-amber-300",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
  },
  Physical: {
    text: "text-rose-300",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    bar: "bg-rose-400",
    dot: "bg-rose-400",
  },
  Goalkeeping: {
    text: "text-teal-300",
    border: "border-teal-500/30",
    bg: "bg-teal-500/10",
    bar: "bg-teal-400",
    dot: "bg-teal-400",
  },
};