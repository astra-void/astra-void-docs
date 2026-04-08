import React from "@rbxts/react";
import { Textarea } from "@lattice-ui/textarea";

export function TextareaExample() {
  const [value, setValue] = React.useState("First line\nSecond line");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(460, 260)}>
      <Textarea.Root onValueChange={setValue} value={value}>
        <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 220)}>
          <uilistlayout
            FillDirection={Enum.FillDirection.Vertical}
            Padding={new UDim(0, 6)}
          />

          <Textarea.Label asChild>
            <textbutton
              AutoButtonColor={false}
              BackgroundTransparency={1}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(420, 22)}
              Text="Notes"
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={14}
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          </Textarea.Label>

          <Textarea.Input asChild>
            <textbox
              BackgroundColor3={Color3.fromRGB(34, 41, 54)}
              BorderSizePixel={0}
              Size={UDim2.fromOffset(420, 110)}
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={14}
              TextWrapped={true}
              TextXAlignment={Enum.TextXAlignment.Left}
              TextYAlignment={Enum.TextYAlignment.Top}
            >
              <uicorner CornerRadius={new UDim(0, 8)} />
              <uipadding
                PaddingBottom={new UDim(0, 8)}
                PaddingLeft={new UDim(0, 10)}
                PaddingRight={new UDim(0, 10)}
                PaddingTop={new UDim(0, 8)}
              />
            </textbox>
          </Textarea.Input>

          <Textarea.Description asChild>
            <textlabel
              BackgroundTransparency={1}
              Size={UDim2.fromOffset(420, 18)}
              Text="Textarea keeps the same labeled field shell as TextField while supporting multi-line input."
              TextColor3={Color3.fromRGB(172, 181, 196)}
              TextSize={13}
              TextWrapped={true}
              TextXAlignment={Enum.TextXAlignment.Left}
            />
          </Textarea.Description>
        </frame>
      </Textarea.Root>
    </frame>
  );
}
