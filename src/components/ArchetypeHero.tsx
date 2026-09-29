"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { MAX_LEVEL, getMaxApForLevel } from "@/data/levelProgression";
import { getArchetypeIcon } from "@/data/playstyles";
import type { Archetype } from "@/types";

interface ArchetypeHeroProps {
  archetypes: Archetype[];
  /** Name of the archetype currently driving the builder. */
  selected: string;
  /** Existing archetype-change flow from the builder. */
  onSelect: (name: string) => void;
  /** Pro level (drives the AP budget). */
  level: number;
  onLevelChange: (level: number) => void;
}

/** Matches Tailwind's `lg` breakpoint, where the hero becomes an accordion. */
const DESKTOP_QUERY = "(min-width: 1024px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const matches = (query: string) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ArchetypeHero({
  archetypes,
  selected,
  onSelect,
  level,
  onLevelChange,
}: ArchetypeHeroProps) {
  const [preview, setPreview] = useState(selected);
  const listRef = useRef<HTMLUListElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPointer = useRef<string>("mouse");
  const didMount = useRef(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoverTimer = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  // Small hover-intent delay: sweeping the cursor across the row doesn't make
  // every card it crosses open and close, so the accordion moves calmly.
  const previewOnHover = (name: string) => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setPreview(name), 90);
  };

  useEffect(() => clearHoverTimer, []);

  const activeIndex = Math.max(
    0,
    archetypes.findIndex((a) => a.name === selected),
  );

  // Whenever the builder's archetype changes (dropdown, URL hydration, reset,
  // animation optimizer…), the hero follows it.
  useEffect(() => {
    setPreview(selected);
  }, [selected]);

  // On the mobile carousel, keep the active card in view without moving the page.
  useEffect(() => {
    const list = listRef.current;
    const card = cardRefs.current[activeIndex]?.parentElement;
    const firstRun = !didMount.current;
    didMount.current = true;
    if (!list || !card || matches(DESKTOP_QUERY)) return;
    list.scrollTo({
      left: card.offsetLeft - list.offsetLeft - 16,
      behavior: firstRun || matches(REDUCED_MOTION_QUERY) ? "auto" : "smooth",
    });
  }, [activeIndex]);

  const resetPreview = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
    const list = listRef.current;
    if (list && list.contains(document.activeElement)) return;
    setPreview(selected);
  }, [selected]);

  const choose = useCallback(
    (name: string) => {
      setPreview(name);
      // Re-picking the active archetype would wipe the build; ignore it here.
      if (name !== selected) onSelect(name);
    },
    [onSelect, selected],
  );

  const handleClick = (name: string) => {
    // On touch devices with the desktop accordion, the first tap expands the
    // card and the second one selects it (there is no hover to preview with).
    if (
      lastPointer.current === "touch" &&
      preview !== name &&
      matches(DESKTOP_QUERY)
    ) {
      setPreview(name);
      return;
    }
    choose(name);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLUListElement>) => {
    const current = cardRefs.current.findIndex((el) => el === document.activeElement);
    if (current === -1) return;
    let next = current;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % archetypes.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + archetypes.length) % archetypes.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = archetypes.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    cardRefs.current[next]?.focus();
  };

  const previewIndex = archetypes.findIndex((a) => a.name === preview);
  const tabbableIndex = previewIndex === -1 ? activeIndex : previewIndex;

  return (
    <section
      aria-labelledby="archetype-hero-title"
      className="panel relative mb-4 overflow-hidden p-3.5 sm:p-4 lg:p-5"
    >
      {/* Soft pitch glow behind the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-brand/[0.06] blur-3xl"
      />

      <div className="relative mb-3.5 lg:mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="panel-title text-brand">FC 27 Clubs · Archetypes</p>
            <h2
              id="archetype-hero-title"
              className="mt-1.5 text-lg font-extrabold uppercase leading-tight tracking-[0.04em] text-white sm:text-2xl"
            >
              Pick your archetype
            </h2>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2.5">
            {/* Pro level (moved here from the header) */}
            <label className="flex items-center gap-2 rounded-lg border border-line bg-surface/80 px-2.5 py-2 transition-colors focus-within:border-brand/60 hover:border-line-strong sm:px-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                <span className="sm:hidden">Lvl</span>
                <span className="hidden sm:inline">Level</span>
              </span>
              <select
                value={level}
                onChange={(e) => onLevelChange(Number(e.target.value))}
                aria-label="Pro level"
                className="cursor-pointer bg-transparent text-sm font-extrabold text-pitch focus:outline-none"
              >
                {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-panel text-white">
                    {lvl} · {getMaxApForLevel(lvl)} AP
                  </option>
                ))}
              </select>
            </label>
            <p className="hidden text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:block">
              <span className="hidden lg:inline">Hover or focus to preview · click / Enter to select</span>
              <span className="lg:hidden">Swipe to browse · tap to select</span>
            </p>
          </div>
        </div>

        <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted">
          13 roles, each with its own attribute base, stars and signature
          PlayStyle+. Choosing one loads its default build below.
        </p>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:hidden">
          Swipe to browse · tap to select
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        Active archetype: {selected}
      </p>

      <ul
        ref={listRef}
        role="list"
        aria-label="Archetypes"
        onKeyDown={handleKeyDown}
        onMouseLeave={resetPreview}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setPreview(selected);
          }
        }}
        className="relative -mx-3.5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-3.5 pb-2 [scrollbar-width:thin] sm:-mx-4 sm:px-4 lg:mx-0 lg:h-[292px] lg:snap-none lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {archetypes.map((a, index) => {
          const isActive = a.name === selected;
          const isExpanded = a.name === preview;
          const icon = getArchetypeIcon(a.name);
          const number = String(index + 1).padStart(2, "0");

          return (
            <li
              key={a.id}
              className="archetype-hero-item h-[228px] w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[36%] lg:h-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-0"
              style={{ ["--grow" as string]: isExpanded ? 8 : 1 }}
            >
              <button
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                type="button"
                data-expanded={isExpanded}
                data-active={isActive}
                tabIndex={index === tabbableIndex ? 0 : -1}
                aria-pressed={isActive}
                aria-label={`${a.name}, ${a.role}, ${a.primary_position}. Signature PlayStyle+: ${a.signature_playstyle_plus}.${
                  isActive ? " Current archetype." : " Select to load this archetype."
                }`}
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onMouseEnter={() => previewOnHover(a.name)}
                onMouseLeave={clearHoverTimer}
                onFocus={() => {
                  clearHoverTimer();
                  setPreview(a.name);
                }}
                onClick={() => handleClick(a.name)}
                className={`group relative flex h-full w-full overflow-hidden rounded-xl border text-left outline-none transition-[border-color,box-shadow,background-color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1310] ${
                  isActive
                    ? "border-brand/60 bg-[#121b12] shadow-[0_0_0_1px_rgba(186,250,76,0.18),0_14px_34px_rgba(0,0,0,0.35)]"
                    : "border-line bg-[#0b110e] hover:border-line-strong"
                }`}
              >
                {/* Pitch texture: mowing stripes + centre circle */}
                <span
                  aria-hidden="true"
                  className="archetype-hero-pitch pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-700 ease-out group-data-[expanded=true]:opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/[0.05]"
                />

                {/* Archetype artwork (scraped icon) */}
                {icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={icon}
                    alt=""
                    width={170}
                    height={162}
                    loading="lazy"
                    decoding="async"
                    className="archetype-hero-art pointer-events-none select-none object-contain"
                  />
                )}

                {/* Legibility gradient */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070b09] via-[#070b09]/60 to-transparent"
                />

                {/* Collapsed rail (desktop accordion only) */}
                <span
                  aria-hidden="true"
                  className="archetype-hero-rail pointer-events-none absolute inset-0 hidden flex-col items-center justify-between py-3.5 lg:flex"
                >
                  {icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={icon}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 shrink-0 object-contain opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  ) : (
                    <span className="h-7 w-7" />
                  )}
                  <span
                    className={`archetype-hero-vertical min-h-0 flex-1 overflow-hidden py-3 text-[13px] font-extrabold uppercase tracking-[0.14em] ${
                      isActive ? "text-brand" : "text-zinc-200"
                    }`}
                  >
                    {a.name}
                  </span>
                  <span className="data-number text-[10px] font-medium text-muted">{number}</span>
                </span>

                {/* Expanded content (always visible on the mobile carousel) */}
                <span
                  aria-hidden="true"
                  className="archetype-hero-content relative flex h-full w-full flex-col justify-between p-4 lg:min-w-[19rem] lg:p-5"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="flex items-center gap-2">
                      {icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={icon}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 shrink-0 rounded-lg border border-line bg-[#0a100d]/90 object-contain p-1"
                        />
                      )}
                      <span className="data-number text-[11px] font-medium text-muted">
                        {number} / {String(archetypes.length).padStart(2, "0")}
                      </span>
                    </span>
                    {isActive && (
                      <span className="chip bg-brand/15 text-brand">
                        <CheckIcon className="h-3 w-3" /> Active
                      </span>
                    )}
                  </span>

                  <span className="block">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="chip bg-white/[0.08] text-zinc-200">{a.primary_position}</span>
                      <span className="chip bg-gold/15 text-gold">★ {a.signature_playstyle_plus}+</span>
                    </span>
                    <span className="mt-2 block truncate text-2xl font-extrabold uppercase leading-none tracking-[0.03em] text-white lg:text-[1.75rem]">
                      {a.name}
                    </span>
                    <span className="mt-1.5 block truncate text-xs font-semibold text-zinc-300">
                      {a.role}
                    </span>

                    <span
                      className={`mt-3.5 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors ${
                        isActive
                          ? "border border-brand/40 bg-brand/10 text-brand"
                          : "bg-brand text-[#10150b] group-hover:bg-brand-hi"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5" /> Current build
                        </>
                      ) : (
                        <>
                          Select archetype <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
