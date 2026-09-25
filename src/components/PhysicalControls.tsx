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
  const pct = ((value - min) / Math.max(1, max - min)) * 100;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
        <span className="font-mono text-base font-black text-zinc-100">
          {value}
          <span className="ml-0.5 text-xs font-medium text-zinc-500">{unit}</span>
          <span className="ml-2 text-[11px] font-medium text-zinc-500">{altText}</span>
        </span>
      </div>
      <div className="relative mt-2">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ap-range relative"
          aria-valuetext={`${value} ${unit}`}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-zinc-600">
        <span>
          Permitido <span className="font-mono text-zinc-400">{min}–{max}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(defaultValue)}
          className="text-zinc-500 underline-offset-2 hover:text-emerald-400 hover:underline"
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
}: PhysicalControlsProps) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-zinc-100">Físico</h2>
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Altura y peso del arquetipo
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <Control
          id="height"
          label="Altura"
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
          label="Peso"
          unit="kg"
          altText={`/ ${toPounds(weightKg)}`}
          value={weightKg}
          min={minWeight}
          max={maxWeight}
          defaultValue={defaultWeight}
          onChange={onWeight}
        />
      </div>
    </div>
  );
}
