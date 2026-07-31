import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * A leaderboard as a column of rows. Roblox has no `justify-between`-style
 * distribution in the browser renderer yet, so the score column is pushed to
 * the edge with fixed widths instead: rank + avatar + name + score plus the
 * gaps add up to exactly the row's inner width.
 */
export function Leaderboard() {
  return (
    <frame className="flex flex-col gap-2 w-96 h-37 p-3 rounded-lg bg-slate-900 border border-slate-800">
      <frame className="flex items-center gap-3 w-full h-9 px-3 rounded-md bg-slate-800">
        <textlabel
          className="bg-transparent w-5 h-5 text-amber-400 text-sm font-semibold"
          Text="1"
        />
        <frame className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500" />
        <textlabel
          className="bg-transparent w-48 h-5 text-left text-slate-100 text-sm"
          Text="astra"
        />
        <textlabel
          className="bg-transparent w-16 h-5 text-right text-amber-400 text-sm font-semibold"
          Text="2,410"
        />
      </frame>

      <frame className="flex items-center gap-3 w-full h-9 px-3 rounded-md bg-slate-800">
        <textlabel
          className="bg-transparent w-5 h-5 text-slate-500 text-sm font-semibold"
          Text="2"
        />
        <frame className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
        <textlabel
          className="bg-transparent w-48 h-5 text-left text-slate-100 text-sm"
          Text="void_walker"
        />
        <textlabel
          className="bg-transparent w-16 h-5 text-right text-slate-300 text-sm"
          Text="1,984"
        />
      </frame>

      <frame className="flex items-center gap-3 w-full h-9 px-3 rounded-md bg-slate-800">
        <textlabel
          className="bg-transparent w-5 h-5 text-slate-500 text-sm font-semibold"
          Text="3"
        />
        <frame className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-orange-500" />
        <textlabel
          className="bg-transparent w-48 h-5 text-left text-slate-100 text-sm"
          Text="bloom"
        />
        <textlabel
          className="bg-transparent w-16 h-5 text-right text-slate-300 text-sm"
          Text="1,730"
        />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={148} width={384}>
      <Leaderboard />
    </VelaStage>
  ),
  title: "List rows",
} as const;
