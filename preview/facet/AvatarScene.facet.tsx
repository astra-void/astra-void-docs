import React from "@rbxts/react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Label } from "../ui/label";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * Fallbacks only, and that is the preview being honest rather than a choice:
 * `AvatarImage` draws an `rbxassetid://` or `rbxthumb://` URL, and Loom has no
 * Roblox content pipeline to fetch one from. What this does show is the part
 * the file owns — the circle, and the initials centred inside it.
 *
 * Every circle is the same `size-10`, because that is the only size there is.
 * A `className` here would be resolved at this call site and then overwritten
 * by the root recipe's own `size-10 rounded-full`; a different size means
 * editing the copied file.
 */
export function Party() {
  return (
    <frame className="flex-col gap-2 w-full h-fit">
      <frame className="flex-row items-center gap-3 w-full h-fit">
        <Avatar>
          <AvatarFallback Text="NR" />
        </Avatar>
        <Label Text="Nimbus_Rider" />
      </frame>
      <frame className="flex-row items-center gap-3 w-full h-fit">
        <Avatar>
          <AvatarFallback Text="QB" />
        </Avatar>
        <Label Text="QuarryBoss" />
      </frame>
    </frame>
  );
}

export const preview = {
  render: () => (
    <FacetStage height={96} mode={MODE} width={240}>
      <Party />
    </FacetStage>
  ),
  title: "Avatar",
} as const;
