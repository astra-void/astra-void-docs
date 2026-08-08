import React from "@rbxts/react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The track's colour is the only thing this file's recipe decides between the
 * two states — the thumb's travel is Lattice's, which is why the on and off
 * rows differ in fill but never in geometry.
 */
export function Switches() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <frame className="flex-row items-center gap-3 w-full h-fit">
        <Switch />
        <Label Text="Off" />
      </frame>
      <frame className="flex-row items-center gap-3 w-full h-fit">
        <Switch defaultChecked />
        <Label Text="On" />
      </frame>
      <frame className="flex-row items-center gap-3 w-full h-fit">
        <Switch defaultChecked disabled />
        <Label Text="Disabled" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={76} mode={MODE} width={260}>
      <Switches />
    </FacetStage>
  ),
  title: "Switch",
} as const;
