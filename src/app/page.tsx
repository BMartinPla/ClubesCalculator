"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ArchetypeDropdown from "@/components/ArchetypeDropdown";
import AnimationThresholdModal from "@/components/AnimationThresholdModal";
import BudgetBar from "@/components/BudgetBar";
import CategorySection from "@/components/CategorySection";
import ExportBuildModal from "@/components/ExportBuildModal";
import MasteriesModal from "@/components/MasteriesModal";
import PhysicalControls from "@/components/PhysicalControls";
import PlaystylesCard from "@/components/PlaystylesCard";
import SkillControls from "@/components/SkillControls";
import { ARCHETYPES, DEFAULT_ARCHETYPE, getArchetype } from "@/data/archetypes";
import { ARCHETYPE_MASTERIES, getMastery } from "@/data/archetypeMasteries";
import { getStars } from "@/data/archetypeStars";
import { CATEGORY_ORDER } from "@/data/categories";
import { MIN_LEVEL, MAX_LEVEL } from "@/data/levelProgression";
import { evaluateBuild } from "@/lib/buildEngine";
import type { AnimationThreshold } from "@/lib/animationOptimizer";
import type { Archetype, CategoryName, MasteriesState } from "@/types";

const FALLBACK_ARCHETYPE = getArchetype(DEFAULT_ARCHETYPE) as Archetype;

function clampLevel(level: number): number {
  if (!Number.isFinite(level)) return MIN_LEVEL;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.floor(level)));
}

const resolveArchetype = (name: string): Archetype =>
  getArchetype(name) ?? FALLBACK_ARCHETYPE;

const baseStars = (name: string) => {
  const s = getStars(name);
  return {
    skills: s?.base_skills ?? 1,
    weakFoot: s?.base_weak_foot ?? 1,
  };
};

const basePhysical = (name: string) => {
  const a = getArchetype(name);
  return {
    height: a?.default_height ?? 180,
    weight: a?.default_weight ?? 80,
  };
};

/** Categories present for a given archetype, in canonical display order. */
function categoriesFor(archetype: string): CategoryName[] {
  const build = evaluateBuild(archetype);
  const present = new Set(build.breakdown.map((b) => b.category));
  return CATEGORY_ORDER.filter((c) => present.has(c));
}

/** Parse `stats=Aceleracion:80,Sprint:90` into a record. */
function parseStatsParam(raw: string | null): Record<string, number> {
  if (!raw) return {};
  const out: Record<string, number> = {};
  for (const pair of raw.split(",")) {
    const [name, value] = pair.split(":");
    if (!name) continue;
    const num = Number.parseInt(value ?? "", 10);
    if (Number.isFinite(num)) out[name] = num;
  }
  return out;
}

/** Parse `m=Finisher,Magician` into a masteries state. */
function parseMasteriesParam(raw: string | null): MasteriesState {
  const out: MasteriesState = {};
  if (!raw) return out;
  for (const name of raw.split(",")) {
    const trimmed = name.trim();
    if (trimmed) out[trimmed] = true;
  }
  return out;
}

export default function Page() {
  const initialStars = baseStars(DEFAULT_ARCHETYPE);
  const initialPhysical = basePhysical(DEFAULT_ARCHETYPE);

  const [archetype, setArchetype] = useState(DEFAULT_ARCHETYPE);
  const [targetStats, setTargetStats] = useState<Record<string, number>>({});
  const [masteries, setMasteries] = useState<MasteriesState>({});
  const [skills, setSkills] = useState(initialStars.skills);
  const [weakFoot, setWeakFoot] = useState(initialStars.weakFoot);
  const [height, setHeight] = useState(initialPhysical.height);
  const [weight, setWeight] = useState(initialPhysical.weight);
  const [level, setLevel] = useState(MIN_LEVEL);
  const [openCategories, setOpenCategories] = useState<Set<CategoryName>>(
    () => new Set(categoriesFor(DEFAULT_ARCHETYPE).slice(0, 1)),
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [masteriesOpen, setMasteriesOpen] = useState(false);
  const [animationsOpen, setAnimationsOpen] = useState(false);
  const [animationThreshold, setAnimationThreshold] = useState<AnimationThreshold>(71);
  const hydrated = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerH, setHeaderH] = useState(0);

  // Keep the fixed header height in state so the content can offset it.
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setHeaderH(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // --- Hydrate from URL (?archetype=&stats=&m=) --------------------------
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const params = new URLSearchParams(window.location.search);
    const archParam = params.get("archetype");
    const validArch =
      archParam && ARCHETYPES.some((a) => a.name === archParam)
        ? archParam
        : DEFAULT_ARCHETYPE;

    const base = baseStars(validArch);
    const phys = basePhysical(validArch);
    setArchetype(validArch);
    setSkills(base.skills);
    setWeakFoot(base.weakFoot);
    const hParam = Number.parseInt(params.get("h") ?? "", 10);
    const wParam = Number.parseInt(params.get("w") ?? "", 10);
    setHeight(Number.isFinite(hParam) ? hParam : phys.height);
    setWeight(Number.isFinite(wParam) ? wParam : phys.weight);
    setTargetStats(parseStatsParam(params.get("stats")));
    setMasteries(parseMasteriesParam(params.get("m")));
    const lvlParam = Number.parseInt(params.get("lvl") ?? "", 10);
    setLevel(Number.isFinite(lvlParam) ? clampLevel(lvlParam) : MIN_LEVEL);
    setOpenCategories(new Set(categoriesFor(validArch).slice(0, 1)));
  }, []);

  // --- Derived build -----------------------------------------------------
  const build = useMemo(
    () => evaluateBuild(archetype, targetStats, masteries, { skills, weakFoot }, level),
    [archetype, targetStats, masteries, skills, weakFoot, level],
  );

  const { breakdown } = build;

  const activeArchetype = useMemo(
    () => resolveArchetype(archetype),
    [archetype],
  );

  const categories = useMemo(() => categoriesFor(archetype), [archetype]);

  const activeMasteriesCount = useMemo(
    () => Object.values(masteries).filter(Boolean).length,
    [masteries],
  );

  const activeMasteryList = useMemo(
    () => ARCHETYPE_MASTERIES.filter((m) => masteries[m.archetype]),
    [masteries],
  );

  const keyAttributes = useMemo(() => {
    const m = getMastery(archetype);
    return m ? [m.stat_1, m.stat_2].filter(Boolean) : [];
  }, [archetype]);

  const stars = useMemo(() => getStars(archetype), [archetype]);
  const minSkills = stars?.base_skills ?? 1;
  const maxSkills = stars?.max_skills ?? 5;
  const minWeakFoot = stars?.base_weak_foot ?? 1;
  const maxWeakFoot = stars?.max_weak_foot ?? 5;

  const entriesByCategory = useMemo(() => {
    const map = new Map<CategoryName, typeof breakdown>();
    for (const entry of breakdown) {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [breakdown]);

  const baseByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of breakdown) map.set(entry.attribute, entry.baseStat);
    return map;
  }, [breakdown]);

  // --- Share URL ---------------------------------------------------------
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    params.set("archetype", archetype);
    params.set("lvl", String(level));
    params.set("h", String(height));
    params.set("w", String(weight));
    const raised = Object.entries(targetStats)
      .filter(([, v]) => Number.isFinite(v))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`);
    if (raised.length > 0) params.set("stats", raised.join(","));
    const activeMasteries = Object.entries(masteries)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort();
    if (activeMasteries.length > 0) params.set("m", activeMasteries.join(","));
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [archetype, targetStats, masteries, level, height, weight]);

  // Keep the address bar in sync with the current build.
  useEffect(() => {
    if (!hydrated.current || typeof window === "undefined") return;
    const search = shareUrl.slice(shareUrl.indexOf("?"));
    window.history.replaceState(null, "", search);
  }, [shareUrl]);

  // --- Handlers ----------------------------------------------------------
  const selectArchetype = useCallback((name: string) => {
    const base = baseStars(name);
    const phys = basePhysical(name);
    setArchetype(name);
    setTargetStats({});
    setSkills(base.skills);
    setWeakFoot(base.weakFoot);
    setHeight(phys.height);
    setWeight(phys.weight);
    setOpenCategories(new Set(categoriesFor(name).slice(0, 1)));
  }, []);

  const handleStatChange = useCallback(
    (attribute: string, value: number) => {
      setTargetStats((prev) => {
        const next = { ...prev };
        const base = baseByName.get(attribute);
        if (base !== undefined && value <= base) delete next[attribute];
        else next[attribute] = value;
        return next;
      });
    },
    [baseByName],
  );

  const toggleCategory = useCallback((category: CategoryName) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  // Reset build points + stars + physical to base. Masteries stay intact.
  const resetPoints = useCallback(() => {
    const base = baseStars(archetype);
    const phys = basePhysical(archetype);
    setTargetStats({});
    setSkills(base.skills);
    setWeakFoot(base.weakFoot);
    setHeight(phys.height);
    setWeight(phys.weight);
  }, [archetype]);

  const toggleMastery = useCallback((name: string) => {
    setMasteries((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const markAllMasteries = useCallback(() => {
    setMasteries(
      Object.fromEntries(ARCHETYPE_MASTERIES.map((m) => [m.archetype, true])),
    );
  }, []);

  const unmarkAllMasteries = useCallback(() => setMasteries({}), []);

  /** Apply an animation-threshold optimization to the build. */
  const applyThresholdOptimization = useCallback(
    (name: string, targets: Record<string, number>) => {
      const changing = name !== archetype;
      if (changing) {
        const base = baseStars(name);
        setArchetype(name);
        setSkills(base.skills);
        setWeakFoot(base.weakFoot);
        setOpenCategories(new Set(categoriesFor(name).slice(0, 1)));
      }
      setTargetStats((prev) =>
        changing ? { ...targets } : { ...prev, ...targets },
      );
    },
    [archetype],
  );

  const openAnimations = useCallback((threshold: AnimationThreshold) => {
    setAnimationThreshold(threshold);
    setAnimationsOpen(true);
  }, []);

  return (
    <>
      <BudgetBar
        ref={headerRef}
        archetypeName={archetype}
        spent={build.totalApSpent}
        maxAp={build.maxAp}
        statsApCost={build.statsApCost}
        starsApCost={build.totalStarsCost}
        level={level}
        shareUrl={shareUrl}
        onLevelChange={(lvl) => setLevel(clampLevel(lvl))}
        onReset={resetPoints}
        onExport={() => setExportOpen(true)}
      />

      <main
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"
        style={{ paddingTop: (headerH || 88) + 24 }}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(320px,380px)_1fr]">
          {/* ---- Sidebar: build configuration ---- */}
          <aside
            className="flex flex-col gap-4 lg:sticky lg:self-start"
            style={{ top: headerH + 16 }}
          >
            <ArchetypeDropdown
              archetypes={ARCHETYPES}
              selected={archetype}
              onSelect={selectArchetype}
            />

            <PlaystylesCard archetype={activeArchetype} />

            <SkillControls
              skills={skills}
              minSkills={minSkills}
              maxSkills={maxSkills}
              weakFoot={weakFoot}
              minWeakFoot={minWeakFoot}
              maxWeakFoot={maxWeakFoot}
              skillsCost={build.skillsCost}
              weakFootCost={build.weakFootCost}
              onSkills={setSkills}
              onWeakFoot={setWeakFoot}
            />

            <PhysicalControls
              heightCm={height}
              weightKg={weight}
              minHeight={activeArchetype.min_height}
              maxHeight={activeArchetype.max_height}
              defaultHeight={activeArchetype.default_height}
              minWeight={activeArchetype.min_weight}
              maxWeight={activeArchetype.max_weight}
              defaultWeight={activeArchetype.default_weight}
              onHeight={setHeight}
              onWeight={setWeight}
            />

            <button
              type="button"
              onClick={() => setMasteriesOpen(true)}
              className={`focus-ring flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                activeMasteriesCount > 0
                  ? "border-violet-500/40 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
                  : "border-white/[0.08] bg-zinc-900/70 text-zinc-300 hover:border-white/[0.14]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="text-base">🏆</span>
                Maestrías
              </span>
              <span className="rounded-md bg-zinc-950/60 px-2 py-0.5 text-[10px] font-bold">
                {activeMasteriesCount}/{ARCHETYPE_MASTERIES.length} activas
              </span>
            </button>

            <div className="panel p-4">
              <h2 className="mb-3 text-sm font-bold tracking-tight text-zinc-100">
                Optimizador de Animaciones
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openAnimations(71)}
                  className="focus-ring flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800"
                >
                  <span aria-hidden="true">⚡</span>
                  Animaciones Base
                  <span className="ml-auto rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    71
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openAnimations(85)}
                  className="focus-ring flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800"
                >
                  <span aria-hidden="true">⭐</span>
                  Animaciones Mejoradas
                  <span className="ml-auto rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                    85
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* ---- Attributes column ---- */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold tracking-tight text-zinc-200">
                Atributos
              </h2>
              <span className="text-[11px] text-zinc-500">
                {build.totalApSpent} / {build.maxAp} AP usados
              </span>
            </div>

            {categories.map((category) => (
              <CategorySection
                key={category}
                category={category}
                entries={entriesByCategory.get(category) ?? []}
                categoryAp={build.byCategory[category] ?? 0}
                isOpen={openCategories.has(category)}
                onToggle={() => toggleCategory(category)}
                onStatChange={handleStatChange}
              />
            ))}
          </div>
        </div>

        <footer className="mt-10 border-t border-white/[0.06] pt-5 text-[11px] leading-relaxed text-zinc-600">
          <p>
            Datos oficiales de arquetipos, atributos, maestrías y tiers de coste
            extraídos de <span className="font-mono text-zinc-500">raw-data/</span>.
            Presupuesto según nivel (100–962 AP). Herramienta no oficial, sin
            afiliación con EA SPORTS.
          </p>
        </footer>
      </main>

      <MasteriesModal
        open={masteriesOpen}
        onClose={() => setMasteriesOpen(false)}
        masteries={ARCHETYPE_MASTERIES}
        active={masteries}
        onToggle={toggleMastery}
        onMarkAll={markAllMasteries}
        onUnmarkAll={unmarkAllMasteries}
      />

      <ExportBuildModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        archetype={activeArchetype}
        build={build}
        keyAttributes={keyAttributes}
        activeMasteries={activeMasteryList}
        totalMasteriesCount={ARCHETYPE_MASTERIES.length}
        skills={skills}
        weakFoot={weakFoot}
        targetStats={targetStats}
        masteries={masteries}
      />

      <AnimationThresholdModal
        open={animationsOpen}
        onClose={() => setAnimationsOpen(false)}
        initialThreshold={animationThreshold}
        archetype={archetype}
        masteryBonus={build.masteryBonuses}
        onApply={applyThresholdOptimization}
      />
    </>
  );
}