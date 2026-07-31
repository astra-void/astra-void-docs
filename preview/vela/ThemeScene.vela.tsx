import React from "@rbxts/react";
import { VelaStage } from "./VelaStage";

/**
 * Compiled against the config next to this file (`ThemeScene.config.json`),
 * which extends the built-in theme with a `brand` palette, a `surface` color, a
 * `card` radius and a `gutter` spacing key. Because it extends rather than
 * replaces, `text-slate-400` still resolves alongside them.
 */
export function ThemedCard() {
  return (
    <frame className="flex flex-col justify-center gap-3 w-72 h-28 p-gutter rounded-card bg-surface border border-brand-700">
      <textlabel
        className="bg-transparent w-full h-5 text-left text-slate-100 text-sm font-semibold"
        Text="Season pass"
      />
      <textbutton
        className="w-24 h-9 rounded-card bg-brand-500 text-white text-sm"
        Text="Claim"
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <VelaStage height={112} width={288}>
      <ThemedCard />
    </VelaStage>
  ),
  title: "Theme",
} as const;
