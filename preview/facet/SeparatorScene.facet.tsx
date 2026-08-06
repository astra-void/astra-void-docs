import React from "@rbxts/react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function Separators() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <Label Text="Inventory" />
      <Separator />
      {/* A vertical separator takes its height from the row, so the row states
          one — `h-full` cannot measure a parent that is still hugging. */}
      <frame className="flex-row items-center gap-3 w-full h-5">
        <Label Text="Weapons" />
        <Separator orientation="vertical" />
        <Label Text="Armor" />
        <Separator orientation="vertical" />
        <Label Text="Potions" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={72} mode={MODE} width={320}>
      <Separators />
    </FacetStage>
  ),
  title: "Separator",
} as const;
