/**
 * Stage for the docs' Facet examples: a backdrop in the theme's own page color
 * with a fixed-size area in the middle for the example itself.
 *
 * Deliberately free of `className`, like the Vela stage — the stage is docs
 * furniture, and every class in a preview should belong to the component being
 * documented.
 *
 * The backdrop is stated as a literal rather than through `bg-background`
 * because it has to match the mode this scene was *lowered* for, and the stage
 * is copied into the gallery verbatim rather than compiled. `BACKDROP` carries
 * the same two values `facetTheme({ base: "zinc" }).background` resolves to:
 * zinc-950 in dark, white in light. The mode is passed in by the scene, which
 * knows which build it belongs to.
 */
import React from "@rbxts/react";
import { installVelaEnvironment } from "./loom-environment";

type FacetMode = "light" | "dark";

type FacetStageProps = {
  /** Which lowering this scene came from — picks the matching backdrop. */
  mode: FacetMode;
  /** Fixed pixel size of the centered example area. */
  width: number;
  height: number;
  children: React.ReactNode;
};

export const BACKDROP = {
  light: Color3.fromRGB(255, 255, 255),
  dark: Color3.fromRGB(9, 9, 11),
} as const;

export function FacetStage(props: FacetStageProps) {
  // Before anything Vela lowered renders: its runtime path reads the color
  // scheme off the player, and Loom's player has no attribute API.
  installVelaEnvironment(props.mode);

  return (
    <frame BackgroundColor3={BACKDROP[props.mode]} BorderSizePixel={0} Size={UDim2.fromScale(1, 1)}>
      <frame
        AnchorPoint={new Vector2(0.5, 0.5)}
        BackgroundTransparency={1}
        Position={UDim2.fromScale(0.5, 0.5)}
        Size={UDim2.fromOffset(props.width, props.height)}
      >
        {props.children}
      </frame>
    </frame>
  );
}
