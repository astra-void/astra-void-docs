import { Accordion } from "@lattice-ui/accordion";
import * as React from "react";

export function AccordionExample() {
  const [value, setValue] = React.useState<string | string[]>("general");

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(720, 260)}>
      <Accordion.Root
        collapsible
        onValueChange={setValue}
        type="single"
        value={value}
      >
        <frame BackgroundTransparency={1} Size={UDim2.fromOffset(720, 220)}>
          <uilistlayout
            FillDirection={Enum.FillDirection.Vertical}
            Padding={new UDim(0, 10)}
          />

          {[
            [
              "general",
              "General settings stay visible inside the current layout.",
            ],
            [
              "privacy",
              "Privacy controls can expand without opening a separate screen.",
            ],
          ].map(([itemValue, description]) => (
            <Accordion.Item asChild key={itemValue} value={itemValue}>
              <frame
                BackgroundTransparency={1}
                Size={UDim2.fromOffset(720, 92)}
              >
                <Accordion.Header asChild>
                  <frame
                    BackgroundTransparency={1}
                    Size={UDim2.fromOffset(720, 36)}
                  >
                    <Accordion.Trigger asChild>
                      <textbutton
                        AutoButtonColor={false}
                        BackgroundColor3={Color3.fromRGB(34, 41, 54)}
                        BorderSizePixel={0}
                        Size={UDim2.fromOffset(720, 36)}
                        Text={itemValue}
                        TextColor3={Color3.fromRGB(236, 240, 248)}
                        TextSize={16}
                        TextXAlignment={Enum.TextXAlignment.Left}
                      >
                        <uicorner CornerRadius={new UDim(0, 8)} />
                        <uipadding PaddingLeft={new UDim(0, 12)} />
                      </textbutton>
                    </Accordion.Trigger>
                  </frame>
                </Accordion.Header>
                <Accordion.Content asChild>
                  <textlabel
                    BackgroundTransparency={1}
                    Position={UDim2.fromOffset(12, 48)}
                    Size={UDim2.fromOffset(690, 32)}
                    Text={description}
                    TextColor3={Color3.fromRGB(172, 181, 196)}
                    TextSize={14}
                    TextWrapped={true}
                    TextXAlignment={Enum.TextXAlignment.Left}
                    TextYAlignment={Enum.TextYAlignment.Top}
                  />
                </Accordion.Content>
              </frame>
            </Accordion.Item>
          ))}
        </frame>
      </Accordion.Root>
    </frame>
  );
}
