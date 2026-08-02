import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

export function Toolbar() {
  return (
    <frame className="flex flex-col gap-3 w-96 h-36 p-4 rounded-lg bg-slate-900 border border-slate-800">
      <frame className="flex items-center gap-3 w-full h-10 px-3 rounded-md bg-slate-800">
        <textlabel
          className="w-52 h-5 text-left text-slate-100 text-sm"
          Text="Inventory"
        />
        <textbutton className="w-16 h-7 rounded-md bg-sky-500 text-white text-sm" Text="Close" />
      </frame>

      <frame className="flex justify-center items-center gap-3 w-full h-14 p-2 rounded-md bg-slate-800">
        <frame className="w-14 h-10 rounded bg-slate-700 border border-slate-600" />
        <frame className="w-14 h-10 rounded bg-slate-700 border border-slate-600" />
        <frame className="w-14 h-10 rounded bg-slate-700 border border-slate-600" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={144} width={384}>
      <Toolbar />
    </VelaStage>
  ),
  title: "Layout",
} as const;
