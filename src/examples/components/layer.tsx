import * as React from "react";
import { DismissableLayer, PortalProvider, Presence } from "@lattice-ui/layer";

type Props = {
  playerGui: PlayerGui;
};

function LayerDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 220)}>
      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(60, 76, 104)}
        BorderSizePixel={0}
        Size={UDim2.fromOffset(180, 36)}
        Text={open ? "Hide layer" : "Show layer"}
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        Event={{ Activated: () => setOpen((value) => !value) }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>

      <Presence
        present={open}
        render={({ isPresent }) => (
          <DismissableLayer
            enabled={isPresent}
            onDismiss={() => setOpen(false)}
          >
            <frame
              AnchorPoint={new Vector2(0, 0)}
              BackgroundColor3={Color3.fromRGB(34, 41, 54)}
              BorderSizePixel={0}
              Position={UDim2.fromOffset(0, 54)}
              Size={UDim2.fromOffset(300, 120)}
            >
              <uicorner CornerRadius={new UDim(0, 10)} />
              <textlabel
                BackgroundTransparency={1}
                Position={UDim2.fromOffset(12, 12)}
                Size={UDim2.fromOffset(276, 52)}
                Text="DismissableLayer owns outside interaction. Presence keeps the subtree mounted while it exits."
                TextColor3={Color3.fromRGB(236, 240, 248)}
                TextSize={14}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
              />
            </frame>
          </DismissableLayer>
        )}
      />
    </frame>
  );
}

export function LayerExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <LayerDemo />
    </PortalProvider>
  );
}
