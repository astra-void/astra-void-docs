import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * A meter is two frames: a track, and a fill whose `w-{fraction}` is the value.
 * Fractions lower to the scale component of `Size`, so `w-2/3` reads as "two
 * thirds of the track" with no math on your side. The fill is a plain child —
 * no list layout — so it sits at the track's origin by default.
 */
export function StatBars() {
  return (
    <frame className="flex flex-col gap-3 w-96 h-20 p-4 rounded-lg bg-slate-900">
      <frame className="flex items-center gap-3 w-full h-4 bg-transparent">
        <textlabel
          className="bg-transparent w-10 h-4 text-left text-slate-400 text-xs font-semibold"
          Text="HP"
        />
        <frame className="w-72 h-2 rounded-full bg-slate-800">
          <frame className="w-2/3 h-full rounded-full bg-emerald-500" />
        </frame>
      </frame>

      <frame className="flex items-center gap-3 w-full h-4 bg-transparent">
        <textlabel
          className="bg-transparent w-10 h-4 text-left text-slate-400 text-xs font-semibold"
          Text="MP"
        />
        <frame className="w-72 h-2 rounded-full bg-slate-800">
          <frame className="w-1/4 h-full rounded-full bg-sky-500" />
        </frame>
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={80} width={384}>
      <StatBars />
    </VelaStage>
  ),
  title: "Stat bars",
} as const;
