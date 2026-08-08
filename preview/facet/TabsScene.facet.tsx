import React from "@rbxts/react";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * `defaultValue` is not optional here in practice: the mirrored state cannot
 * see the primitive's own first-enabled-trigger fallback, so without one the
 * list renders with nothing styled as selected.
 */
export function LoadoutTabs() {
  return (
    <Tabs defaultValue="gear">
      <TabsList>
        <TabsTrigger value="gear" Text="Gear" />
        <TabsTrigger value="stats" Text="Stats" />
        <TabsTrigger value="locked" Text="Locked" disabled />
      </TabsList>
      <TabsContent value="gear">
        <Label Text="Iron pickaxe, rope, two torches." />
      </TabsContent>
      <TabsContent value="stats">
        <Label Text="14 runs, 3 deaths, 1,204 coins." />
      </TabsContent>
    </Tabs>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={80} mode={MODE} width={340}>
      <LoadoutTabs />
    </FacetStage>
  ),
  title: "Tabs",
} as const;
