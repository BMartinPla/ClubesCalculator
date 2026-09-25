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
    <div className="rounded-md border border-line bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span title={title} className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        <span
          className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold ${
            cost > 0 ? "bg-pitch/15 text-pitch" : "text-muted"
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
                title={allowed ? `${title}: ${n}` : `${title} out of range (${min}–${max})`}
                className={`text-lg leading-none transition ${
                  filled ? "text-gold" : "text-white/15"
                } ${allowed ? "hover:scale-110 hover:text-amber-300" : "cursor-not-allowed opacity-30"}`}
              >
                ★
              </button>
            );
          })}
        </div>
        <span className="font-mono text-sm font-extrabold text-white">{value}/5</span>
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
    <div className="panel flex flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">Skill Moves & Weak Foot</h2>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Costs AP
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <StarRow
          label="Skill Moves"
          title="Skill Moves"
          value={skills}
          min={minSkills}
          max={maxSkills}
          cost={skillsCost}
          onChange={onSkills}
        />
        <StarRow
          label="Weak Foot"
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