import React from "@rbxts/react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The four states the recipe distinguishes. Only the first is uncontrolled and
 * clickable in the ordinary sense — the rest are seeded so the preview shows
 * what each looks like without anyone having to reach them.
 */
export function Checkboxes() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Checkbox />
        <Label Text="Remember me" />
      </frame>
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Checkbox defaultChecked />
        <Label Text="Checked" />
      </frame>
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Checkbox defaultChecked="indeterminate" />
        <Label Text="Indeterminate" />
      </frame>
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Checkbox defaultChecked disabled />
        <Label Text="Disabled" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={104} mode={MODE} width={220}>
      <Checkboxes />
    </FacetStage>
  ),
  title: "Checkbox",
} as const;
