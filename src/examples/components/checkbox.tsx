import { Checkbox, type CheckedState } from "@lattice-ui/checkbox";
import React from "@rbxts/react";

function toIndicator(value: CheckedState) {
  if (value === "indeterminate") {
    return "-";
  }

  return value ? "x" : "";
}

export function CheckboxExample() {
  const [checked, setChecked] = React.useState<CheckedState>("indeterminate");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 180)}>
      <Checkbox.Root asChild checked={checked} onCheckedChange={setChecked}>
        <textbutton
          AutoButtonColor={false}
          BackgroundColor3={Color3.fromRGB(34, 41, 54)}
          BorderSizePixel={0}
          Size={UDim2.fromOffset(320, 44)}
          Text=""
        >
          <uicorner CornerRadius={new UDim(0, 8)} />
          <frame
            BackgroundColor3={Color3.fromRGB(22, 28, 39)}
            BorderSizePixel={0}
            Position={UDim2.fromOffset(10, 10)}
            Size={UDim2.fromOffset(24, 24)}
          >
            <uicorner CornerRadius={new UDim(0, 6)} />
            <Checkbox.Indicator asChild forceMount>
              <textlabel
                BackgroundTransparency={1}
                Size={UDim2.fromScale(1, 1)}
                Text={toIndicator(checked)}
                TextColor3={Color3.fromRGB(236, 240, 248)}
                TextSize={16}
              />
            </Checkbox.Indicator>
          </frame>
          <textlabel
            BackgroundTransparency={1}
            Position={UDim2.fromOffset(48, 0)}
            Size={UDim2.fromOffset(250, 44)}
            Text={`Checkbox state: ${tostring(checked)}`}
            TextColor3={Color3.fromRGB(236, 240, 248)}
            TextSize={14}
            TextXAlignment={Enum.TextXAlignment.Left}
          />
        </textbutton>
      </Checkbox.Root>

      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(60, 76, 104)}
        BorderSizePixel={0}
        Position={UDim2.fromOffset(0, 62)}
        Size={UDim2.fromOffset(210, 34)}
        Text="Reset to indeterminate"
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        Event={{ Activated: () => setChecked("indeterminate") }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>
    </frame>
  );
}
