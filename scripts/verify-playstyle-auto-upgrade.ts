import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PlayStylePickerModal from "../src/components/PlayStylePickerModal";
import PlayStylePlusPickerModal from "../src/components/PlayStylePlusPickerModal";
import { getPlayStyle, getPlayStyleByName } from "../src/data/playstyles";
import { ARCHETYPES } from "../src/data/archetypes";
import { getPlayStylePlusRequirements } from "../src/data/playstylePlusRequirements";
import { evaluateBuild } from "../src/lib/buildEngine";
import {
  canApplyPlayStyleAutoUpgrade,
  planPlayStyleAutoUpgrade,
} from "../src/lib/playstyleRequirements";

Object.assign(globalThis, { React });

const baseline = evaluateBuild("Finisher", {}, { Finisher: true }, { skills: 3, weakFoot: 3 }, 40);
const chipShotPlusRequirements = getPlayStylePlusRequirements("Finisher", "chip_shot");
if (!chipShotPlusRequirements) throw new Error("Finisher Chip Shot+ requirements are missing");

const plusPlan = planPlayStyleAutoUpgrade(chipShotPlusRequirements, baseline.breakdown);
if (!plusPlan.reachable) throw new Error("Finisher Chip Shot+ requirements should be reachable");
if (plusPlan.targetStats.Compostura !== 91) {
  throw new Error("Auto-upgrade should account for Finisher's +1 Composure mastery");
}
for (const attribute of ["Control Balon", "Compostura", "Reacciones"]) {
  if (!plusPlan.targetStats[attribute]) {
    throw new Error(`PlayStyle+ selection did not prepare ${attribute}`);
  }
}

const upgraded = evaluateBuild(
  "Finisher",
  plusPlan.targetStats,
  { Finisher: true },
  { skills: 3, weakFoot: 3 },
  40,
);
if (upgraded.totalApSpent - baseline.totalApSpent !== plusPlan.apCost) {
  throw new Error("Auto-upgrade AP cost should match the evaluated build's incremental AP");
}
for (const requirement of chipShotPlusRequirements) {
  const attribute = baseline.breakdown.find(
    (entry) => entry.attribute === ({
      ball_control: "Control Balon",
      composure: "Compostura",
      reactions: "Reacciones",
    } as Record<string, string>)[requirement.attributeId],
  );
  if (!attribute) throw new Error(`Missing ${requirement.attributeId} breakdown`);
  const final = upgraded.breakdown.find((entry) => entry.attribute === attribute.attribute)!;
  if (final.statTotal < requirement.min) {
    throw new Error(`${requirement.attributeId} was not upgraded to the PlayStyle+ threshold`);
  }
}

const finesseShot = getPlayStyle("finesse_shot");
if (!finesseShot) throw new Error("Finesse Shot is missing");
const regularPlan = planPlayStyleAutoUpgrade(finesseShot.requirements, baseline.breakdown);
if (!regularPlan.reachable || regularPlan.apCost <= 0) {
  throw new Error("Regular PlayStyle requirements should produce an affordable upgrade plan");
}
if (canApplyPlayStyleAutoUpgrade(regularPlan, regularPlan.apCost - 1)) {
  throw new Error("Auto-upgrade should be rejected when remaining AP is one point too low");
}
if (!canApplyPlayStyleAutoUpgrade(regularPlan, regularPlan.apCost)) {
  throw new Error("Auto-upgrade should be allowed when remaining AP exactly covers its cost");
}

for (const entry of ARCHETYPES) {
  const baseBuild = evaluateBuild(entry.name, {}, {}, null, 40);
  for (const name of entry.specializations) {
    const style = getPlayStyleByName(name);
    const requirements = style && getPlayStylePlusRequirements(entry.name, style.id);
    if (!requirements) throw new Error(`${entry.name} ${name}+ requirements are missing`);
    if (!planPlayStyleAutoUpgrade(requirements, baseBuild.breakdown).reachable) {
      throw new Error(`${entry.name} ${name}+ requirements exceed the archetype's stat caps`);
    }
  }
}

const impossiblePlan = planPlayStyleAutoUpgrade(
  [{ attributeId: "gk_reflexes", min: 90 }],
  baseline.breakdown,
);
if (impossiblePlan.reachable) {
  throw new Error("A requirement missing from the archetype breakdown must not be reachable");
}

const alreadyMetPlan = planPlayStyleAutoUpgrade(
  [{ attributeId: "finishing", min: 75 }],
  evaluateBuild("Finisher", { Definicion: 90 }, {}, null, 1).breakdown,
);
if (!canApplyPlayStyleAutoUpgrade(alreadyMetPlan, 0) || alreadyMetPlan.apCost !== 0) {
  throw new Error("Already-met PlayStyle requirements should be selectable with no AP left");
}

const normalPicker = renderToStaticMarkup(
  React.createElement(PlayStylePickerModal, {
    open: true,
    onClose: () => undefined,
    statTotals: {},
    breakdown: evaluateBuild("Finisher", {}, {}, null, 1).breakdown,
    availableAp: 0,
    selectedIds: [],
    onSelect: () => undefined,
  }),
);
const normalStyle = getPlayStyle("chip_shot")!;
const normalButtonStart = normalPicker.lastIndexOf("<button", normalPicker.indexOf(normalStyle.icon));
const normalButton = normalPicker.slice(normalButtonStart, normalPicker.indexOf("</button>", normalButtonStart));
if (!normalButton.includes("disabled")) {
  throw new Error("Regular PlayStyle options requiring unavailable AP must be disabled");
}

const archetype = { name: "Finisher", specializations: ["Chip Shot"] } as Parameters<
  typeof PlayStylePlusPickerModal
>[0]["archetype"];
const plusPicker = renderToStaticMarkup(
  React.createElement(PlayStylePlusPickerModal, {
    open: true,
    onClose: () => undefined,
    archetype,
    breakdown: baseline.breakdown,
    availableAp: 0,
    selectedId: null,
    onSelect: () => undefined,
  }),
);
const unequippedChipShot = getPlayStyleByName("Chip Shot")!;
const plusButtonStart = plusPicker.lastIndexOf("<button", plusPicker.indexOf(unequippedChipShot.name + " +"));
const plusButton = plusPicker.slice(plusButtonStart, plusPicker.indexOf("</button>", plusButtonStart));
if (!plusButton.includes("disabled")) {
  throw new Error("PlayStyle+ options requiring unavailable AP must be disabled");
}

console.log("PASS normal and gold requirements produce exact, mastery-aware auto-upgrade AP plans");
