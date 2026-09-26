import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import BuildSummaryCard from "../src/components/BuildSummaryCard";
import { getArchetype } from "../src/data/archetypes";
import { getPlayStyle } from "../src/data/playstyles";
import { evaluateBuild } from "../src/lib/buildEngine";
import type { PlayStyleDef } from "../src/types";

const archetype = getArchetype("Finisher");
if (!archetype) throw new Error("Finisher archetype is missing");
Object.assign(globalThis, { React });

const selectedPlayStyleIds = ["finesse_shot", "rapid"];
const markup = renderToStaticMarkup(
  React.createElement(BuildSummaryCard, {
    archetype,
    build: evaluateBuild("Finisher"),
    keyAttributes: [],
    activeMasteries: [],
    totalMasteriesCount: 13,
    skills: 3,
    weakFoot: 3,
    selectedPlayStyleIds,
  }),
);

for (const id of selectedPlayStyleIds) {
  const playStyle = getPlayStyle(id);
  if (!playStyle) throw new Error(`PlayStyle ${id} is missing from the dataset`);
  if (!markup.includes(playStyle.name)) {
    throw new Error(`Export image preview does not include ${playStyle.name}`);
  }
  if (!markup.includes(playStyle.icon)) {
    throw new Error(`Export image preview does not include icon ${playStyle.icon}`);
  }
}

const signature = getPlayStyle("low_driven_shot") as PlayStyleDef;
if (!markup.includes(signature.iconplus)) {
  throw new Error(`Export image preview does not include PlayStyle+ icon ${signature.iconplus}`);
}

console.log("PASS equipped PlayStyles names and icons appear in export image markup");
