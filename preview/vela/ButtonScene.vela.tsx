import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * Three button tones from the same four families: sizing, radius, background,
 * typography. The secondary button adds a `UIStroke` through `border`, which is
 * the whole difference between the filled and outlined looks.
 */
export function Buttons() {
  return (
    <frame className="flex gap-3 justify-center items-center w-96 h-20 p-4 rounded-lg bg-slate-900">
      <textbutton
        className="w-28 h-10 rounded-md bg-sky-500 text-white text-sm font-semibold"
        Text="Play"
      />
      <textbutton
        className="w-28 h-10 rounded-md bg-slate-800 border border-slate-600 text-slate-100 text-sm"
        Text="Options"
      />
      <textbutton
        className="w-28 h-10 rounded-md bg-rose-600 text-white text-sm font-semibold"
        Text="Leave"
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={80} width={384}>
      <Buttons />
    </VelaStage>
  ),
  title: "Buttons",
} as const;
