import { Menu } from "@lattice-ui/menu";
import * as React from "react";
import { PortalProvider } from "@lattice-ui/layer";

type Props = {
  playerGui: PlayerGui;
};

function MenuDemo() {
  const [lastAction, setLastAction] = React.useState("none");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 220)}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <textbutton
            AutoButtonColor={false}
            BackgroundColor3={Color3.fromRGB(53, 104, 196)}
            BorderSizePixel={0}
            Size={UDim2.fromOffset(180, 40)}
            Text="Open menu"
            TextColor3={Color3.fromRGB(240, 244, 250)}
            TextSize={14}
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
          </textbutton>
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Content asChild offset={new Vector2(0, 8)} placement="bottom">
            <frame
              BackgroundColor3={Color3.fromRGB(22, 28, 39)}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(220, 144)}
            >
              <uicorner CornerRadius={new UDim(0, 10)} />
              <uipadding
                PaddingLeft={new UDim(0, 8)}
                PaddingRight={new UDim(0, 8)}
                PaddingTop={new UDim(0, 8)}
                PaddingBottom={new UDim(0, 8)}
              />
              <uilistlayout
                FillDirection={Enum.FillDirection.Vertical}
                Padding={new UDim(0, 4)}
              />

              <Menu.Label asChild>
                <textlabel
                  BackgroundTransparency={1}
                  Size={UDim2.fromOffset(204, 18)}
                  Text="Actions"
                  TextColor3={Color3.fromRGB(172, 181, 196)}
                  TextSize={12}
                  TextXAlignment={Enum.TextXAlignment.Left}
                />
              </Menu.Label>

              <Menu.Item asChild onSelect={() => setLastAction("Duplicate")}>
                <textbutton
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Size={UDim2.fromOffset(204, 30)}
                  Text="Duplicate"
                  TextColor3={Color3.fromRGB(236, 240, 248)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Menu.Item>

              <Menu.Item asChild onSelect={() => setLastAction("Archive")}>
                <textbutton
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Size={UDim2.fromOffset(204, 30)}
                  Text="Archive"
                  TextColor3={Color3.fromRGB(236, 240, 248)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Menu.Item>

              <Menu.Separator asChild>
                <frame
                  BackgroundColor3={Color3.fromRGB(60, 76, 104)}
                  BorderSizePixel={0}
                  Size={UDim2.fromOffset(204, 1)}
                />
              </Menu.Separator>

              <Menu.Item asChild disabled={true}>
                <textbutton
                  Active={false}
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Selectable={false}
                  Size={UDim2.fromOffset(204, 30)}
                  Text="Delete (disabled)"
                  TextColor3={Color3.fromRGB(140, 148, 162)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Menu.Item>
            </frame>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>

      <textlabel
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 62)}
        Size={UDim2.fromOffset(220, 20)}
        Text={`Last action: ${lastAction}`}
        TextColor3={Color3.fromRGB(172, 181, 196)}
        TextSize={13}
        TextXAlignment={Enum.TextXAlignment.Left}
      />
    </frame>
  );
}

export function MenuExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <MenuDemo />
    </PortalProvider>
  );
}
