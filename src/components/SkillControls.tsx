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
    <div className="rounded-lg border border-line bg-[#0b110e] p-3">
      <div className="flex items-center justify-between gap-3">
        <span title={title} className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </span>
        <span
          className={`data-number rounded-md px-2 py-1 text-[10px] font-bold ${
            cost > 0 ? "bg-pitch/10 text-pitch" : "bg-white/[0.04] text-muted"
          }`}
        >
          +{cost} AP
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-0.5">
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
                aria-pressed={n === value}
                title={allowed ? `${title}: ${n}` : `${title} out of range (${min}–${max})`}
                className={`focus-ring flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none transition ${
                  filled
                    ? "text-gold drop-shadow-[0_0_6px_rgba(243,201,105,.35)]"
                    : allowed
                      ? "text-white/35"
                      : "text-white/15"
                } ${allowed ? "hover:scale-110 hover:bg-white/[0.04] hover:text-amber-300" : "cursor-not-allowed"}`}
              >
                ★
              </button>
            );
          })}
        </div>
        <span className="data-number text-sm font-extrabold text-white">
          {value}
          <span className="text-muted">/5</span>
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
    <div className="panel flex flex-col p-3.5">
      <div className="panel-head">
        <h2 className="panel-title">Skill Moves & Weak Foot</h2>
        <span className="panel-kicker">Costs AP</span>
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
