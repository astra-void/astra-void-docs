import * as React from "react";
import { TextField } from "@lattice-ui/text-field";

export function TextFieldExample() {
  const [value, setValue] = React.useState("player-one");
  const invalid = value.size() < 3;

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(460, 220)}>
      <TextField.Root invalid={invalid} onValueChange={setValue} value={value}>
        <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 180)}>
          <uilistlayout
            FillDirection={Enum.FillDirection.Vertical}
            Padding={new UDim(0, 6)}
          />

          <TextField.Label asChild>
            <textbutton
              AutoButtonColor={false}
              BackgroundTransparency={1}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(420, 22)}
              Text="Display name"
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={14}
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          </TextField.Label>

          <TextField.Input asChild>
            <textbox
              BackgroundColor3={Color3.fromRGB(34, 41, 54)}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(420, 38)}
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={14}
              TextXAlignment={Enum.TextXAlignment.Left}
            >
              <uicorner CornerRadius={new UDim(0, 8)} />
              <uipadding
                PaddingLeft={new UDim(0, 10)}
                PaddingRight={new UDim(0, 10)}
              />
            </textbox>
          </TextField.Input>

          <TextField.Description asChild>
            <textlabel
              BackgroundTransparency={1}
              Size={UDim2.fromOffset(420, 18)}
              Text="Use onValueCommit when saves should happen on commit rather than every keystroke."
              TextColor3={Color3.fromRGB(172, 181, 196)}
              TextSize={13}
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          </TextField.Description>

          <TextField.Message asChild>
            <textlabel
              BackgroundTransparency={1}
              Size={UDim2.fromOffset(420, 18)}
              Text={
                invalid ? "Must be at least 3 characters." : "Ready to save."
              }
              TextColor3={
                invalid
                  ? Color3.fromRGB(210, 102, 102)
                  : Color3.fromRGB(172, 181, 196)
              }
              TextSize={13}
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          </TextField.Message>
        </frame>
      </TextField.Root>
    </frame>
  );
}
