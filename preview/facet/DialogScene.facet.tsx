import { PortalProvider } from "@lattice-ui/react-layer";
import React from "@rbxts/react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { MODE } from "../facet-mode";
import { FacetStage } from "./FacetStage";

/**
 * The one scene that wraps itself in a provider, because the component demands
 * it: `Dialog.Portal` reads the `BasePlayerGui` it renders into from a strict
 * context, and without one the dialog throws the moment it opens rather than
 * rendering nowhere.
 *
 * In a real project this wrapper is written once, at the client entry — which
 * is the edit `facet add dialog` offers to make for you.
 */
function getPortalContainer() {
  const localPlayer = game.GetService("Players").LocalPlayer;
  if (!localPlayer) {
    error("[DialogScene] the preview needs a LocalPlayer to portal into.");
  }

  return localPlayer.WaitForChild("PlayerGui") as BasePlayerGui;
}

export function ConfirmDialog() {
  return (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button Text="Leave the run" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle Text="Leave the run?" />
          <DialogDescription Text="Your loot from this run is not banked yet. Leaving now drops it." />
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button size="sm" variant="outline" Text="Stay" />
          </DialogClose>
          <DialogClose asChild>
            <Button size="sm" variant="destructive" Text="Leave" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const preview = {
  render: () => (
    <PortalProvider container={getPortalContainer()}>
      <FacetStage height={40} mode={MODE} width={200}>
        <ConfirmDialog />
      </FacetStage>
    </PortalProvider>
  ),
  title: "Dialog",
} as const;
