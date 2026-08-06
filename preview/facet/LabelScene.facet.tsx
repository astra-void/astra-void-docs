import React from "@rbxts/react";
import { Label } from "../ui/label";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function Labels() {
  return (
    <frame className="flex-col gap-2 w-full h-fit">
      <Label Text="Display name" />
      {/* A second colour is a second component, not a `className` on this one:
          a class written here is lowered at the call site and then overwritten
          by the component's own recipe. See the Vela note in the guide. */}
      <textlabel
        className="size-fit text-xs font-normal text-muted-foreground"
        BackgroundTransparency={1}
        Text="Shown to other players."
      />
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={44} mode={MODE} width={320}>
      <Labels />
    </FacetStage>
  ),
  title: "Label",
} as const;
