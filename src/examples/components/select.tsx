import React from "@rbxts/react";
import { PortalProvider } from "@lattice-ui/layer";
import { Select } from "@lattice-ui/select";

type Props = {
  playerGui: PlayerGui;
};

function SelectDemo() {
  const [value, setValue] = React.useState("apac");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 220)}>
      <Select.Root onValueChange={setValue} value={value}>
        <Select.Trigger asChild>
          <textbutton
            AutoButtonColor={false}
            BackgroundColor3={Color3.fromRGB(34, 41, 54)}
            BorderSizePixel={0}
            Size={UDim2.fromOffset(320, 40)}
            Text=""
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <Select.Value asChild placeholder="Pick a region">
              <textlabel
                BackgroundTransparency={1}
                Position={UDim2.fromOffset(12, 0)}
                Size={UDim2.fromOffset(280, 40)}
                TextColor3={Color3.fromRGB(236, 240, 248)}
                TextSize={14}
                TextXAlignment={Enum.TextXAlignment.Left}
              />
            </Select.Value>
          </textbutton>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content asChild offset={new Vector2(0, 8)} placement="bottom">
            <frame
              BackgroundColor3={Color3.fromRGB(22, 28, 39)}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(320, 126)}
            >
              <uicorner CornerRadius={new UDim(0, 8)} />
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

              <Select.Item asChild textValue="Asia Pacific" value="apac">
                <textbutton
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Size={UDim2.fromOffset(304, 30)}
                  Text="Asia Pacific"
                  TextColor3={Color3.fromRGB(236, 240, 248)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Select.Item>

              <Select.Item
                asChild
                disabled={true}
                textValue="North America"
                value="na"
              >
                <textbutton
                  Active={false}
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Selectable={false}
                  Size={UDim2.fromOffset(304, 30)}
                  Text="North America (disabled)"
                  TextColor3={Color3.fromRGB(140, 148, 162)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Select.Item>

              <Select.Item asChild textValue="Europe" value="eu">
                <textbutton
                  AutoButtonColor={false}
                  BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                  BorderSizePixel={0}
                  Size={UDim2.fromOffset(304, 30)}
                  Text="Europe"
                  TextColor3={Color3.fromRGB(236, 240, 248)}
                  TextSize={14}
                  TextXAlignment={Enum.TextXAlignment.Left}
                >
                  <uicorner CornerRadius={new UDim(0, 6)} />
                  <uipadding PaddingLeft={new UDim(0, 10)} />
                </textbutton>
              </Select.Item>
            </frame>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <textlabel
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 62)}
        Size={UDim2.fromOffset(320, 20)}
        Text={`Selected: ${value}`}
        TextColor3={Color3.fromRGB(172, 181, 196)}
        TextSize={13}
        TextXAlignment={Enum.TextXAlignment.Left}
      />
    </frame>
  );
}

export function SelectExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <SelectDemo />
    </PortalProvider>
  );
}
