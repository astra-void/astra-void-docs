import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

export function LeaveDialog() {
  return (
    <frame className="flex flex-col gap-3 w-96 h-40 p-4 rounded-xl bg-slate-900 border border-slate-700">
      <textlabel
        className="w-full h-6 text-left text-slate-100 text-lg font-semibold"
        Text="Leave match?"
      />
      <textlabel
        className="w-full h-10 text-left text-slate-400 text-sm text-wrap"
        Text="You will lose your streak bonus and any unclaimed round rewards."
      />
      <frame className="flex justify-end items-center gap-2 w-full h-9">
        <textbutton
          className="w-24 h-9 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm"
          Text="Cancel"
        />
        <textbutton
          className="w-24 h-9 rounded-md bg-rose-600 text-white text-sm font-semibold"
          Text="Leave"
        />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={160} width={384}>
      <LeaveDialog />
    </VelaStage>
  ),
  title: "Dialog",
} as const;
