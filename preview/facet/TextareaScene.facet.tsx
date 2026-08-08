import React from "@rbxts/react";
import {
  Textarea,
  TextareaDescription,
  TextareaInput,
  TextareaLabel,
} from "../ui/textarea";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The input recipe declares no height at all, which everywhere else in the
 * registry would collapse the box. Here Lattice owns `Size.Y` and grows it
 * between `minRows` and `maxRows` as the text wraps — type into it and watch.
 */
export function ReportBox() {
  return (
    <Textarea defaultValue="They kept blocking the shop door." maxRows={5} minRows={3}>
      <TextareaLabel Text="What happened?" />
      <TextareaInput />
      <TextareaDescription Text="A moderator reads this — keep it to what you saw." />
    </Textarea>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={168} mode={MODE} width={320}>
      <ReportBox />
    </FacetStage>
  ),
  title: "Textarea",
} as const;
