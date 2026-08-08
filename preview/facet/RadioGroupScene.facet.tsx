import React from "@rbxts/react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The item is only the dial — Facet ships no `RadioGroupLabel`, so the row is
 * a frame the consumer writes, the same way shadcn pairs an item with a
 * `<Label>`.
 */
export function Difficulty() {
  return (
    <RadioGroup defaultValue="normal">
      <frame className="flex-row items-center gap-2 w-fit h-fit">
        <RadioGroupItem value="easy" />
        <Label Text="Casual" />
      </frame>
      <frame className="flex-row items-center gap-2 w-fit h-fit">
        <RadioGroupItem value="normal" />
        <Label Text="Normal" />
      </frame>
      <frame className="flex-row items-center gap-2 w-fit h-fit">
        <RadioGroupItem value="hard" />
        <Label Text="Hardcore" />
      </frame>
    </RadioGroup>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={76} mode={MODE} width={220}>
      <Difficulty />
    </FacetStage>
  ),
  title: "Radio group",
} as const;
