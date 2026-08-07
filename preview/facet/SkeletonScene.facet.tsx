import React from "@rbxts/react";
import { Skeleton } from "../ui/skeleton";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * Three identical `<Skeleton />`s in parents of different widths.
 *
 * Deliberately not `<Skeleton className="w-40" />` — a `className` written at a
 * Vela-compiled call site never reaches the component, so all three would come
 * out the same width and the preview would be a lie. `w-full` means "my
 * parent's width", so the parent is where the width is stated.
 */
export function Skeletons() {
  return (
    <frame className="flex-col gap-2 w-full h-fit">
      <frame className="w-full h-fit">
        <Skeleton />
      </frame>
      <frame className="w-40 h-fit">
        <Skeleton />
      </frame>
      <frame className="w-24 h-fit">
        <Skeleton />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={64} mode={MODE} width={260}>
      <Skeletons />
    </FacetStage>
  ),
  title: "Skeleton",
} as const;
