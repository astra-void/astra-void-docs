import React from "@rbxts/react";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The height is on the **wrapper**, not on the `ScrollArea`. The root recipe is
 * `w-full h-full`, so the component fills whatever it is put inside — and a
 * `className` written here would be resolved at this call site and then
 * overwritten by that recipe. A scroll area that hugs its content has nothing
 * to scroll, so something above it has to state the size.
 */
export function ServerList() {
  const rows: string[] = [
    "Hollow Reach — 12/16",
    "Copper Flats — 9/16",
    "The Undercroft — 16/16",
    "Salt Marsh — 4/16",
    "Ironway Station — 11/16",
    "Quarry Nine — 2/16",
    "Long Pier — 15/16",
  ];

  return (
    <frame className="flex-col w-full h-32 rounded-md border border-border">
      <ScrollArea>
        <frame className="flex-col w-full h-fit p-3 gap-2">
          {rows.map((row, index) => (
            <frame className="flex-col w-full h-fit gap-2" key={row}>
              <Label Text={row} />
              {index < rows.size() - 1 ? <Separator /> : undefined}
            </frame>
          ))}
        </frame>
      </ScrollArea>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={128} mode={MODE} width={280}>
      <ServerList />
    </FacetStage>
  ),
  title: "Scroll area",
} as const;
