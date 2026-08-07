import React from "@rbxts/react";
import { Kbd } from "../ui/kbd";
import { Label } from "../ui/label";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * A single letter beside a word, which is the thing `size-fit` is doing here —
 * the caps are different widths because their contents are.
 */
export function Kbds() {
  return (
    <frame className="flex-col gap-2 w-full h-fit">
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Kbd Text="E" />
        <Label Text="Interact" />
      </frame>
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Kbd Text="Ctrl" />
        <Kbd Text="R" />
        <Label Text="Reset character" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={56} mode={MODE} width={280}>
      <Kbds />
    </FacetStage>
  ),
  title: "Kbd",
} as const;
