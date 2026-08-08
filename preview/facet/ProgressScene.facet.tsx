import React from "@rbxts/react";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * Two determinate bars and the indeterminate sweep. The indicator's width is
 * Lattice's — this file only says the track is `bg-secondary` and the fill is
 * `bg-primary`.
 */
export function Progresses() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <Label Text="Downloading map" />
      <Progress value={30} />
      <Label Text="Loading assets" />
      <Progress value={72} />
      <Label Text="Joining server" />
      <Progress indeterminate />
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={124} mode={MODE} width={320}>
      <Progresses />
    </FacetStage>
  ),
  title: "Progress",
} as const;
