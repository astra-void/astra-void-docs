import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * Status pills: `rounded-full` on a fixed-size label, a dark shade of the
 * palette for the fill and a light one for the text. Roblox text labels center
 * their text by default, which is exactly what a pill wants.
 */
export function Badges() {
  return (
    <frame className="flex gap-2 justify-center items-center w-96 h-16 p-3 rounded-lg bg-slate-900">
      <textlabel
        className="w-20 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs"
        Text="Online"
      />
      <textlabel
        className="w-20 h-6 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-xs"
        Text="In match"
      />
      <textlabel
        className="w-20 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs"
        Text="Offline"
      />
      <textlabel
        className="w-20 h-6 rounded-full bg-rose-950 border border-rose-800 text-rose-400 text-xs"
        Text="Banned"
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={64} width={384}>
      <Badges />
    </VelaStage>
  ),
  title: "Badges",
} as const;
