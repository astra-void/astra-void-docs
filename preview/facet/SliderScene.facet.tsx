import React from "@rbxts/react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The thumb overhangs the track because it is `size-4` on an `h-2` bar and
 * rides the track directly rather than being laid out inside it — the geometry
 * that only Studio can confirm, and the reason the track carries no `flex-*`.
 */
export function Sliders() {
  return (
    <frame className="flex-col gap-4 w-full h-fit">
      <frame className="flex-col gap-2 w-full h-fit">
        <Label Text="Master volume" />
        <Slider defaultValue={70} />
      </frame>
      <frame className="flex-col gap-2 w-full h-fit">
        <Label Text="Sensitivity — stepped by 10" />
        <Slider defaultValue={40} step={10} />
      </frame>
      <frame className="flex-col gap-2 w-full h-fit">
        <Label Text="Disabled" />
        <Slider defaultValue={25} disabled />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={148} mode={MODE} width={320}>
      <Sliders />
    </FacetStage>
  ),
  title: "Slider",
} as const;
