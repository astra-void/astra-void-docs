/**
 * Stage for the docs' Vela examples: a page-colored backdrop with a fixed-size
 * area in the middle for the example itself, so a snippet reads as a component
 * in a UI rather than as a full-bleed scene.
 *
 * Deliberately free of `className` — the stage is docs furniture, and every
 * class in a preview should belong to the example being documented.
 *
 * The docs site mirrors its light/dark toggle onto `PlayerGui.LoomTheme` (a
 * loom-preview extension property); the backdrop follows it so an example sits
 * on the same color as the page around it. Defaults to dark outside the docs.
 */
import React from "@rbxts/react";

type VelaStageProps = {
  /** Fixed pixel size of the centered example area. */
  width: number;
  height: number;
  children: React.ReactNode;
};

const BACKDROP = {
  light: Color3.fromRGB(246, 249, 252),
  dark: Color3.fromRGB(18, 21, 26),
} as const;

function usePlayerGui() {
  const players = game.GetService("Players");
  const localPlayer = players.LocalPlayer;

  if (!localPlayer) {
    error("LocalPlayer is required for the Vela example stage.");
  }

  const playerGui = localPlayer.WaitForChild("PlayerGui");
  if (!playerGui.IsA("PlayerGui")) {
    error("PlayerGui is required for the Vela example stage.");
  }

  return playerGui;
}

function useDocTheme() {
  const playerGui = usePlayerGui();

  const readThemeName = React.useCallback(() => {
    const value = (playerGui as unknown as { LoomTheme?: unknown }).LoomTheme;
    return value === "light" ? "light" : "dark";
  }, [playerGui]);

  const [themeName, setThemeName] = React.useState<"light" | "dark">(readThemeName);

  React.useEffect(() => {
    // `LoomTheme` is a loom extension property, so widen the signal accessor.
    const gui = playerGui as unknown as {
      GetPropertyChangedSignal(property: string): RBXScriptSignal;
    };
    const connection = gui.GetPropertyChangedSignal("LoomTheme").Connect(() => {
      setThemeName(readThemeName());
    });
    setThemeName(readThemeName());
    return () => connection.Disconnect();
  }, [playerGui, readThemeName]);

  return themeName;
}

export function VelaStage(props: VelaStageProps) {
  const theme = useDocTheme();

  return (
    <frame BackgroundColor3={BACKDROP[theme]} BorderSizePixel={0} Size={UDim2.fromScale(1, 1)}>
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
