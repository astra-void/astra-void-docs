import React from "@rbxts/react";
import { Button } from "../ui/button";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

export function Buttons() {
  return (
    <frame className="flex-col gap-3 w-full h-fit">
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Button Text="Default" />
        <Button variant="secondary" Text="Secondary" />
        <Button variant="outline" Text="Outline" />
        <Button variant="destructive" Text="Destructive" />
      </frame>
      <frame className="flex-row items-center gap-2 w-full h-fit">
        <Button variant="ghost" Text="Ghost" />
        <Button size="sm" Text="Small" />
        <Button size="lg" Text="Large" />
        <Button disabled Text="Disabled" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={92} mode={MODE} width={440}>
      <Buttons />
    </FacetStage>
  ),
  title: "Button",
} as const;
