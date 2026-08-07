import React from "@rbxts/react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function Alerts() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <Alert>
        <AlertTitle Text="Loadout saved" />
        <AlertDescription Text="Your changes are stored on the server and will follow you between places." />
      </Alert>
      <Alert variant="destructive">
        <AlertTitle variant="destructive" Text="Kicked" />
        <AlertDescription
          variant="destructive"
          Text="You were removed from the server for being idle."
        />
      </Alert>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={188} mode={MODE} width={380}>
      <Alerts />
    </FacetStage>
  ),
  title: "Alert",
} as const;
