import { RadioGroup } from "@lattice-ui/radio-group";
import React from "@rbxts/react";

const OPTIONS = [
  { value: "file", disabled: false },
  { value: "edit", disabled: true },
  { value: "view", disabled: false },
] as const;

export function RadioGroupExample() {
  const [value, setValue] = React.useState("file");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 200)}>
      <RadioGroup.Root onValueChange={setValue} value={value}>
        <frame BackgroundTransparency={1} Size={UDim2.fromOffset(320, 126)}>
          <uilistlayout
            FillDirection={Enum.FillDirection.Vertical}
            Padding={new UDim(0, 6)}
          />

          {OPTIONS.map((option) => (
            <RadioGroup.Item
              asChild
              disabled={option.disabled}
              key={option.value}
              value={option.value}
            >
              <textbutton
                Active={!option.disabled}
                AutoButtonColor={false}
                BackgroundColor3={
                  value === option.value
                    ? Color3.fromRGB(53, 104, 196)
                    : Color3.fromRGB(34, 41, 54)
                }
                BorderSizePixel={0}
                Selectable={!option.disabled}
                Size={UDim2.fromOffset(220, 34)}
                Text={
                  option.disabled ? `${option.value} (disabled)` : option.value
                }
                TextColor3={
                  option.disabled
                    ? Color3.fromRGB(140, 148, 162)
                    : Color3.fromRGB(236, 240, 248)
                }
                TextSize={14}
                TextXAlignment={Enum.TextXAlignment.Left}
              >
                <uicorner CornerRadius={new UDim(0, 8)} />
                <uipadding PaddingLeft={new UDim(0, 10)} />
              </textbutton>
            </RadioGroup.Item>
          ))}
        </frame>
      </RadioGroup.Root>

      <textlabel
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 138)}
        Size={UDim2.fromOffset(320, 20)}
        Text={`Selected: ${value}`}
        TextColor3={Color3.fromRGB(172, 181, 196)}
        TextSize={13}
        TextXAlignment={Enum.TextXAlignment.Left}
      />
    </frame>
  );
}
