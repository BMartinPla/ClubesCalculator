"use client";

interface SkillControlsProps {
  skills: number;
  minSkills: number;
  maxSkills: number;
  weakFoot: number;
  minWeakFoot: number;
  maxWeakFoot: number;
  skillsCost: number;
  weakFootCost: number;
  onSkills: (value: number) => void;
  onWeakFoot: (value: number) => void;
}

function StarRow({
  label,
  title,
  value,
  min,
  max,
  cost,
  onChange,
}: {
  label: string;
  title: string;
  value: number;
  min: number;
  max: number;
  cost: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span
          title={title}
          className="text-[10px] font-bold uppercase tracking-wider text-zinc-500"
        >
          {label}
        </span>
        <span
          className={`font-mono text-[11px] font-bold ${
            cost > 0 ? "text-emerald-400" : "text-zinc-600"
          }`}
        >
          (+{cost} AP)
        </span>
      </div>
      <div className="mt-1 flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const allowed = n >= min && n <= max;
          const filled = n <= value;
          return (
            <button
              key={n}
              type="button"
              disabled={!allowed}
              onClick={() => onChange(n)}
              aria-label={`${title}: ${n}`}
              title={allowed ? `${title}: ${n}` : `${title} fuera de rango (${min}–${max})`}
              className={`text-sm leading-none transition ${
                filled ? "text-amber-400" : "text-zinc-700"
              } ${allowed ? "hover:text-amber-300" : "cursor-not-allowed opacity-30"}`}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
        <span className="ml-1 font-mono text-[11px] font-bold text-zinc-400">
          {value}/5
        </span>
      </div>
    </div>
  );
}

export default function SkillControls({
  skills,
  minSkills,
  maxSkills,
  weakFoot,
  minWeakFoot,
  maxWeakFoot,
  skillsCost,
  weakFootCost,
  onSkills,
  onWeakFoot,
}: SkillControlsProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2.5">
      <StarRow
        label="Filigranas"
        title="Skill Moves"
        value={skills}
        min={minSkills}
        max={maxSkills}
        cost={skillsCost}
        onChange={onSkills}
      />
      <div className="h-10 w-px shrink-0 bg-zinc-800" aria-hidden="true" />
      <StarRow
        label="Pierna Mala"
        title="Weak Foot"
        value={weakFoot}
        min={minWeakFoot}
        max={maxWeakFoot}
        cost={weakFootCost}
        onChange={onWeakFoot}
      />
    </div>
  );
}