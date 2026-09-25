"use client";

interface PhysicalControlsProps {
  heightCm: number;
  weightKg: number;
  minHeight: number;
  maxHeight: number;
  defaultHeight: number;
  minWeight: number;
  maxWeight: number;
  defaultWeight: number;
  onHeight: (value: number) => void;
  onWeight: (value: number) => void;
  deltas?: Record<string, number>;
}

/** 178 cm -> 5'10" */
const toFeetInches = (cm: number): string => {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}'${inches}"`;
};

/** 70 kg -> 154 lbs */
const toPounds = (kg: number): string => `${Math.round(kg * 2.2046226)} lbs`;

function Control({
  id,
  label,
  unit,
  altText,
  value,
  min,
  max,
  defaultValue,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  altText: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-md border border-line bg-black/20 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-muted">
          {label}
        </label>
        <span className="font-mono text-base font-extrabold text-white">
          {value}
          <span className="ml-0.5 text-xs font-medium text-muted">{unit}</span>
          <span className="ml-2 text-[11px] font-medium text-muted">{altText}</span>
        </span>
      </div>
      <div className="mt-2">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ap-range"
          aria-valuetext={`${value} ${unit}`}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-muted">
        <span>
          Allowed <span className="font-mono text-zinc-300">{min}–{max}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          className="text-muted underline-offset-2 hover:text-pitch hover:underline"
        >
          Base {defaultValue}
        </button>
      </div>
    </div>
  );
}

export default function PhysicalControls({
  heightCm,
  weightKg,
  minHeight,
  maxHeight,
  defaultHeight,
  minWeight,
  maxWeight,
  defaultWeight,
  onHeight,
  onWeight,
  deltas = {},
}: PhysicalControlsProps) {
  const entries = Object.entries(deltas).filter(([, v]) => v !== 0);
  const positives = entries.filter(([, v]) => v > 0);
  const negatives = entries.filter(([, v]) => v < 0);

  return (
    <div className="panel flex h-full flex-col p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">Physical</h2>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
          Height & Weight
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <Control
          id="height"
          label="Height"
          unit="cm"
          altText={`/ ${toFeetInches(heightCm)}`}
          value={heightCm}
          min={minHeight}
          max={maxHeight}
          defaultValue={defaultHeight}
          onChange={onHeight}
        />
        <Control
          id="weight"
          label="Weight"
          unit="kg"
          altText={`/ ${toPounds(weightKg)}`}
          value={weightKg}
          min={minWeight}
          max={maxWeight}
          defaultValue={defaultWeight}
          onChange={onWeight}
        />
      </div>

      <div className="mt-3 rounded-md border border-line bg-black/20 p-2.5">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
          Affected stats
        </p>
        {entries.length === 0 ? (
          <p className="text-[11px] text-muted">
            No height/weight modifiers at base values.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {[...positives, ...negatives].map(([stat, v]) => (
              <span
                key={stat}
                className={`chip ${
                  v > 0 ? "bg-pitch/15 text-pitch" : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {stat}
                <span className="font-mono">
                  {v > 0 ? "+" : ""}
                  {v}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}