import React from "@rbxts/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The chevron is a `▾` rotated 180° when its item is open — no icon font
 * exists on Roblox, so it is a `textlabel` like every other glyph in the
 * registry.
 */
export function Faq() {
  return (
    <Accordion type="single" collapsible defaultValue="saves">
      <AccordionItem value="saves">
        <AccordionTrigger Text="Where is my progress stored?" />
        <AccordionContent Text="On the server, keyed to your account — nothing is kept on the client." />
      </AccordionItem>
      <AccordionItem value="trade">
        <AccordionTrigger Text="Can I trade with other players?" />
        <AccordionContent Text="Only inside a safe zone, and both of you have to confirm." />
      </AccordionItem>
    </Accordion>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={168} mode={MODE} width={360}>
      <Faq />
    </FacetStage>
  ),
  title: "Accordion",
} as const;
