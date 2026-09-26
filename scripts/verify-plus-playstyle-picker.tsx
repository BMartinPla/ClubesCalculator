import * as React from "react";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import PlayStylesPanel from "../src/components/PlayStylesPanel";
import PlayStylePlusPickerModal from "../src/components/PlayStylePlusPickerModal";
import { getArchetype } from "../src/data/archetypes";
import { getPlayStyleByName } from "../src/data/playstyles";
import { ARCHETYPES } from "../src/data/archetypes";
import { evaluateBuild } from "../src/lib/buildEngine";
import { estimatePlayStyleRequirements } from "../src/lib/playstyleRequirements";
import { getPlayStylePlusRequirements } from "../src/data/playstylePlusRequirements";

Object.assign(globalThis, { React });

const archetype = getArchetype("Finisher");
if (!archetype) throw new Error("Finisher archetype is missing");

const markup = renderToStaticMarkup(
  React.createElement(PlayStylesPanel, {
    level: 40,
    archetype,
    statTotals: {},
    selection: [],
    onOpenPicker: () => undefined,
    onClear: () => undefined,
    onOpenPlusPicker: () => undefined,
    selectedPlusId: null,
  }),
);

if (!markup.includes('aria-label="Choose a PlayStyle+"')) {
  throw new Error("PlayStyle+ is not exposed as an accessible picker control");
}

const pickerMarkup = renderToStaticMarkup(
  React.createElement(PlayStylePlusPickerModal, {
    open: true,
    onClose: () => undefined,
    archetype,
    breakdown: evaluateBuild("Finisher").breakdown,
    availableAp: 962,
    selectedId: "low_driven_shot",
    onSelect: () => undefined,
  }),
);

for (const entry of ARCHETYPES) {
  for (const specialization of entry.specializations) {
    const playStyle = getPlayStyleByName(specialization);
    if (!playStyle) {
      throw new Error(`${entry.name} specialization ${specialization} is missing from PlayStyles`);
    }
    const plusRequirements = getPlayStylePlusRequirements(entry.name, playStyle.id);
    if (!plusRequirements || plusRequirements.length !== 3) {
      throw new Error(`${entry.name} ${specialization}+ is missing its three gold stat requirements`);
    }
    if (!existsSync(resolve(process.cwd(), "public", playStyle.iconplus.slice(1)))) {
      throw new Error(`${entry.name} specialization ${specialization} has no gold icon file`);
    }
  }
}

for (const specialization of archetype.specializations) {
  const playStyle = getPlayStyleByName(specialization);
  if (!playStyle) throw new Error(`Specialization ${specialization} is missing from PlayStyles`);
  if (!pickerMarkup.includes(playStyle.name)) {
    throw new Error(`PlayStyle+ picker does not include ${playStyle.name}`);
  }
  if (!pickerMarkup.includes(playStyle.iconplus)) {
    throw new Error(`PlayStyle+ picker does not include gold icon ${playStyle.iconplus}`);
  }
}

for (const name of ["Finisher", "Creator", "Shot Stopper"]) {
  const currentArchetype = ARCHETYPES.find((entry) => entry.name === name);
  if (!currentArchetype) throw new Error(`${name} archetype is missing`);
  const component = React.createElement(PlayStylePlusPickerModal, {
    open: true,
    onClose: () => undefined,
    archetype: currentArchetype,
    breakdown: evaluateBuild(name).breakdown,
    availableAp: 962,
    selectedId: null,
    onSelect: () => undefined,
  });
  const html = renderToStaticMarkup(component);
  for (const specialization of currentArchetype.specializations) {
    const playStyle = getPlayStyleByName(specialization)!;
    if (!html.includes(playStyle.name) || !html.includes(playStyle.iconplus)) {
      throw new Error(`${name} picker is missing ${specialization} or its gold icon`);
    }
  }
}

if (!pickerMarkup.includes("Estimated additional cost:")) {
  throw new Error("PlayStyle+ picker does not show the estimated AP cost");
}
if (!pickerMarkup.includes("Finishing") || !pickerMarkup.includes("→")) {
  throw new Error("PlayStyle+ picker does not show the required stat thresholds");
}

const chipShot = getPlayStyleByName("Chip Shot");
if (!chipShot) throw new Error("Chip Shot specialization is missing");
const chipShotPlusRequirements = getPlayStylePlusRequirements("Finisher", chipShot.id);
if (!chipShotPlusRequirements) throw new Error("Finisher Chip Shot+ requirements are missing");
if (
  chipShotPlusRequirements.map(({ attributeId, min }) => `${attributeId}:${min}`).join(",") !==
  "ball_control:90,composure:92,reactions:90"
) {
  throw new Error("Finisher Chip Shot+ must use its own gold thresholds, not regular PlayStyle requirements");
}
const chipShotEstimate = estimatePlayStyleRequirements(
  { ...chipShot, requirements: chipShotPlusRequirements },
  evaluateBuild("Finisher").breakdown,
);
const chipShotAp = chipShotEstimate.reduce((sum, requirement) => sum + requirement.apCost, 0);
if (chipShotAp <= 0 || !pickerMarkup.includes(`Estimated additional cost: ${chipShotAp} AP`)) {
  throw new Error("PlayStyle+ AP estimate does not match its stat requirements");
}
for (const threshold of ["Ball Control", "Composure", "Reactions"]) {
  if (!pickerMarkup.includes(threshold)) throw new Error(`PlayStyle+ picker is missing ${threshold}`);
}
if (!pickerMarkup.includes("→ 92") || !pickerMarkup.includes("→ 90")) {
  throw new Error("PlayStyle+ picker is not displaying the gold requirement thresholds");
}

const capBlockedStyle = getPlayStyleByName("Bruiser");
if (!capBlockedStyle) throw new Error("Bruiser PlayStyle is missing");
const capBlocked = estimatePlayStyleRequirements(
  capBlockedStyle,
  evaluateBuild("Shot Stopper").breakdown,
);
if (capBlocked.every((requirement) => requirement.reachable)) {
  throw new Error("PlayStyle+ estimate should flag requirements above the archetype cap");
}

console.log("PASS archetype specializations resolve to gold icons; modal filters correctly and estimates attainable AP costs");
