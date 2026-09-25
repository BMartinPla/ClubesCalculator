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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-3">
        <span
          title={title}
          className="text-[11px] font-bold uppercase tracking-wider text-zinc-400"
        >
          {label}
        </span>
        <span
          className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ${
            cost > 0 ? "bg-emerald-500/10 text-emerald-300" : "bg-white/[0.03] text-zinc-600"
          }`}
        >
          +{cost} AP
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
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
                className={`text-lg leading-none transition ${
                  filled ? "text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]" : "text-zinc-700"
                } ${allowed ? "hover:scale-110 hover:text-amber-300" : "cursor-not-allowed opacity-30"}`}
              >
                {filled ? "★" : "☆"}
              </button>
            );
          })}
        </div>
        <span className="font-mono text-sm font-black text-zinc-100">{value}/5</span>
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
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-zinc-100">Estrellas</h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Consume AP
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <StarRow
          label="Filigranas"
          title="Skill Moves"
          value={skills}
          min={minSkills}
          max={maxSkills}
          cost={skillsCost}
          onChange={onSkills}
        />
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
    </div>
  );
}