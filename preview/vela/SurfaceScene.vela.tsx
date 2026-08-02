import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

export function Swatches() {
  return (
    <frame className="flex gap-3 justify-center items-center w-96 h-24 p-4 rounded-lg bg-slate-900">
      <frame className="w-16 h-16 rounded-md bg-slate-700" />
      <frame className="w-16 h-16 rounded-md bg-slate-800 border-2 border-sky-500" />
      <frame className="w-16 h-16 rounded-full bg-emerald-500" />
      <frame className="w-16 h-16 rounded-md bg-gradient-to-b from-sky-500 to-indigo-600" />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={96} width={384}>
      <Swatches />
    </VelaStage>
  ),
  title: "Surfaces",
} as const;
