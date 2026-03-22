import { Combobox } from "@lattice-ui/combobox";
import { React } from "@lattice-ui/core";
import { PortalProvider } from "@lattice-ui/layer";

type Props = {
  playerGui: PlayerGui;
};

function ComboboxDemo() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("alpha");

  return (
    <Combobox.Root onOpenChange={setOpen} onValueChange={setValue} value={value}>
      <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 220)}>
        <Combobox.Trigger asChild>
          <textbutton
            AutoButtonColor={false}
            BackgroundColor3={Color3.fromRGB(34, 41, 54)}
            BorderSizePixel={0}
            Size={UDim2.fromOffset(320, 40)}
            Text=""
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <Combobox.Value asChild placeholder="Select option">
              <textlabel
                BackgroundTransparency={1}
                Position={UDim2.fromOffset(12, 0)}
                Size={UDim2.fromOffset(280, 40)}
                TextColor3={Color3.fromRGB(236, 240, 248)}
                TextSize={14}
                TextXAlignment={Enum.TextXAlignment.Left}
              />
            </Combobox.Value>
          </textbutton>
        </Combobox.Trigger>

        <Combobox.Input asChild placeholder="Type alpha, beta, gamma">
          <textbox
            BackgroundColor3={Color3.fromRGB(22, 28, 39)}
            BorderSizePixel={0}
            Position={UDim2.fromOffset(0, 52)}
            Size={UDim2.fromOffset(320, 36)}
            TextColor3={Color3.fromRGB(236, 240, 248)}
            TextSize={14}
            TextXAlignment={Enum.TextXAlignment.Left}
          >
            <uicorner CornerRadius={new UDim(0, 8)} />
            <uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />
          </textbox>
        </Combobox.Input>

        <Combobox.Portal>
          <Combobox.Content asChild offset={new Vector2(0, 8)} placement="bottom">
            <frame BackgroundColor3={Color3.fromRGB(22, 28, 39)} BorderSizePixel={0} Size={UDim2.fromOffset(320, 118)}>
              <uicorner CornerRadius={new UDim(0, 8)} />
              <uipadding PaddingLeft={new UDim(0, 8)} PaddingRight={new UDim(0, 8)} PaddingTop={new UDim(0, 8)} PaddingBottom={new UDim(0, 8)} />
              <uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 4)} />

              {[
                ["alpha", "Alpha"],
                ["beta", "Beta"],
                ["gamma", "Gamma"],
              ].map(([itemValue, label]) => (
                <Combobox.Item asChild key={itemValue} textValue={label} value={itemValue}>
                  <textbutton
                    AutoButtonColor={false}
                    BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                    BorderSizePixel={0}
                    Size={UDim2.fromOffset(304, 30)}
                    Text={label}
                    TextColor3={Color3.fromRGB(236, 240, 248)}
                    TextSize={14}
                    TextXAlignment={Enum.TextXAlignment.Left}
                  >
                    <uicorner CornerRadius={new UDim(0, 6)} />
                    <uipadding PaddingLeft={new UDim(0, 10)} />
                  </textbutton>
                </Combobox.Item>
              ))}
            </frame>
          </Combobox.Content>
        </Combobox.Portal>

        <textlabel
          BackgroundTransparency={1}
          Position={UDim2.fromOffset(0, 104)}
          Size={UDim2.fromOffset(320, 20)}
          Text={`open=${tostring(open)} value=${value}`}
          TextColor3={Color3.fromRGB(172, 181, 196)}
          TextSize={13}
          TextXAlignment={Enum.TextXAlignment.Left}
        />
      </frame>
    </Combobox.Root>
  );
}

export function ComboboxExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <ComboboxDemo />
    </PortalProvider>
  );
}
