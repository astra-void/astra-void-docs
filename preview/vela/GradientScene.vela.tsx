import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * The three gradient shapes: two stops, three stops (`via-*`), and a vertical
 * direction. Each swatch is a `UIGradient` child over a background the compiler
 * forces to white so the stops read exactly as the theme defines them.
 */
export function Gradients() {
  return (
    <frame className="flex gap-3 justify-center items-center w-96 h-24 p-4 rounded-lg bg-slate-900">
      <frame className="w-24 h-16 rounded-md bg-gradient-to-r from-sky-500 to-indigo-600" />
      <frame className="w-24 h-16 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
      <frame className="w-24 h-16 rounded-md bg-gradient-to-t from-emerald-500 to-teal-400" />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={96} width={384}>
      <Gradients />
    </VelaStage>
  ),
  title: "Gradients",
} as const;
