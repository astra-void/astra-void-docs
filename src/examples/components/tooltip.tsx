import React from "@rbxts/react";
import { PortalProvider } from "@lattice-ui/layer";
import { Tooltip } from "@lattice-ui/tooltip";

type Props = {
  playerGui: PlayerGui;
};

function TooltipDemo() {
  return (
    <Tooltip.Provider delayDuration={500} skipDelayDuration={250}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <textbutton
            AutoButtonColor={false}
            BackgroundColor3={Color3.fromRGB(53, 104, 196)}
            BorderSizePixel={0}
            Size={UDim2.fromOffset(180, 40)}
            Text="Hover or focus me"
            TextColor3={Color3.fromRGB(240, 244, 250)}
            TextSize={14}
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
          </textbutton>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            asChild
            offset={new Vector2(0, 8)}
            placement="bottom"
          >
            <frame
              BackgroundColor3={Color3.fromRGB(22, 28, 39)}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(220, 74)}
            >
              <uicorner CornerRadius={new UDim(0, 8)} />
              <textlabel
                BackgroundTransparency={1}
                Position={UDim2.fromOffset(10, 10)}
                Size={UDim2.fromOffset(200, 48)}
                Text="Tooltips work best for short supplemental hints, not required instructions."
                TextColor3={Color3.fromRGB(236, 240, 248)}
                TextSize={13}
                TextWrapped={true}
                TextXAlignment={Enum.TextXAlignment.Left}
                TextYAlignment={Enum.TextYAlignment.Top}
              />
            </frame>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function TooltipExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <TooltipDemo />
    </PortalProvider>
  );
}
