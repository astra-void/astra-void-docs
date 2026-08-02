import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

export function Panel() {
  return (
    <frame className="flex flex-col gap-4 p-4 rounded-lg bg-slate-800 border border-slate-700 w-80 h-24">
      <textlabel
        className="w-full h-6 text-left text-slate-100 text-lg font-semibold"
        Text="Loadout"
      />
      <textlabel
        className="w-full h-5 text-left text-slate-400 text-sm"
        Text="Two slots remaining"
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={120} width={320}>
      <Panel />
    </VelaStage>
  ),
  title: "Panel",
} as const;
