import React from "@rbxts/react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * Single on top, multiple below. The pressed surface is `bg-accent` and the
 * label flips to `text-accent-foreground` — two classes on two different
 * instances, because nothing inherits.
 */
export function ToggleGroups() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <ToggleGroup type="single" defaultValue="grid">
        <ToggleGroupItem value="list" Text="List" />
        <ToggleGroupItem value="grid" Text="Grid" />
        <ToggleGroupItem value="map" Text="Map" />
      </ToggleGroup>
      <ToggleGroup type="multiple" defaultValue={["bold", "italic"]}>
        <ToggleGroupItem value="bold" Text="Bold" />
        <ToggleGroupItem value="italic" Text="Italic" />
        <ToggleGroupItem value="under" Text="Underline" />
      </ToggleGroup>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={84} mode={MODE} width={340}>
      <ToggleGroups />
    </FacetStage>
  ),
  title: "Toggle group",
} as const;
