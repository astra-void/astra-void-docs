import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * The landing-page hero: one card that exercises most of the utility families
 * at once — column layout, gap, padding, radius, border, gradients, fractions,
 * typography — and still lowers entirely on the static path. Every visible
 * pixel comes from a class on this page; nothing is styled by hand.
 */
export function QuestCard() {
  return (
    <frame className="flex flex-col gap-3 w-96 h-34 p-4 rounded-xl bg-slate-900 border border-slate-800">
      <frame className="flex items-center gap-3 w-full h-9 bg-transparent">
        <frame className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600" />
        <frame className="flex flex-col gap-1 w-64 h-9 bg-transparent">
          <textlabel
            className="bg-transparent w-full h-5 text-left text-slate-100 text-base font-semibold"
            Text="Quest complete"
          />
          <textlabel
            className="bg-transparent w-full h-3 text-left text-slate-400 text-xs"
            Text="Deliver 12 sunpetal blooms"
          />
        </frame>
      </frame>

      <frame className="w-full h-2 rounded-full bg-slate-800">
        <frame className="w-3/4 h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
      </frame>

      <frame className="flex justify-end items-center gap-2 w-full h-9 bg-transparent">
        <textbutton
          className="w-24 h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm"
          Text="Dismiss"
        />
        <textbutton
          className="w-28 h-9 rounded-md bg-emerald-500 text-white text-sm font-semibold"
          Text="Claim reward"
        />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={136} width={384}>
      <QuestCard />
    </VelaStage>
  ),
  title: "Hero",
} as const;
