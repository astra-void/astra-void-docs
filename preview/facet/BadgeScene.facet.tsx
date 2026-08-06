import React from "@rbxts/react";
import { Badge } from "../ui/badge";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function Badges() {
  return (
    <frame className="flex-row items-center gap-2 w-full h-fit">
      <Badge Text="Default" />
      <Badge variant="secondary" Text="Secondary" />
      <Badge variant="destructive" Text="Destructive" />
      <Badge variant="outline" Text="Outline" />
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={28} mode={MODE} width={400}>
      <Badges />
    </FacetStage>
  ),
  title: "Badge",
} as const;
