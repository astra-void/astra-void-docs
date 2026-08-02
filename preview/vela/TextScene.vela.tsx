import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

export function TextSamples() {
  return (
    <frame className="flex flex-col gap-2 w-80 h-32 p-4 rounded-lg bg-slate-900">
      <textlabel
        className="w-full h-7 text-left text-slate-100 text-2xl font-bold"
        Text="Match found"
      />
      <textlabel
        className="w-full h-5 text-left text-slate-300 text-base font-medium"
        Text="Ranked · Duo queue"
      />
      <textlabel
        className="w-full h-4 text-right text-slate-500 text-sm"
        Text="starting in 5s"
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={128} width={320}>
      <TextSamples />
    </VelaStage>
  ),
  title: "Text",
} as const;
