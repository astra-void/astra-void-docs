import { React } from "@lattice-ui/core";
import { Switch } from "@lattice-ui/switch";

export function SwitchExample() {
  const [checked, setChecked] = React.useState(false);

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 150)}>
      <Switch.Root asChild checked={checked} onCheckedChange={setChecked}>
        <textbutton
          AutoButtonColor={false}
          BackgroundColor3={Color3.fromRGB(34, 41, 54)}
          BorderSizePixel={0}
          Size={UDim2.fromOffset(280, 44)}
          Text=""
        >
          <uicorner CornerRadius={new UDim(0, 8)} />
          <frame
            BackgroundColor3={checked ? Color3.fromRGB(53, 104, 196) : Color3.fromRGB(60, 76, 104)}
            BorderSizePixel={0}
            Position={UDim2.fromOffset(10, 10)}
            Size={UDim2.fromOffset(46, 24)}
          >
            <uicorner CornerRadius={new UDim(1, 0)} />
            <Switch.Thumb asChild>
              <frame
                BackgroundColor3={Color3.fromRGB(240, 244, 250)}
                BorderSizePixel={0}
                Position={checked ? UDim2.fromOffset(24, 2) : UDim2.fromOffset(2, 2)}
                Size={UDim2.fromOffset(20, 20)}
              >
                <uicorner CornerRadius={new UDim(1, 0)} />
              </frame>
            </Switch.Thumb>
          </frame>
          <textlabel
            BackgroundTransparency={1}
            Position={UDim2.fromOffset(68, 0)}
            Size={UDim2.fromOffset(180, 44)}
            Text={checked ? "Notifications on" : "Notifications off"}
            TextColor3={Color3.fromRGB(236, 240, 248)}
            TextSize={14}
            TextXAlignment={Enum.TextXAlignment.Left}
          />
        </textbutton>
      </Switch.Root>
    </frame>
  );
}
