import * as React from "react";
import { Slider } from "@lattice-ui/slider";

export function SliderExample() {
  const [value, setValue] = React.useState(42);

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 160)}>
      <Slider.Root
        max={100}
        min={0}
        onValueChange={setValue}
        step={1}
        value={value}
      >
        <Slider.Track asChild>
          <frame
            BackgroundColor3={Color3.fromRGB(34, 41, 54)}
            BorderSizePixel={0}
            Position={UDim2.fromOffset(0, 24)}
            Size={UDim2.fromOffset(320, 12)}
          >
            <uicorner CornerRadius={new UDim(0, 6)} />
            <Slider.Range asChild>
              <frame
                BackgroundColor3={Color3.fromRGB(53, 104, 196)}
                BorderSizePixel={0}
              >
                <uicorner CornerRadius={new UDim(0, 6)} />
              </frame>
            </Slider.Range>
            <Slider.Thumb asChild>
              <textbutton
                AutoButtonColor={false}
                BackgroundColor3={Color3.fromRGB(240, 244, 250)}
                BorderSizePixel={0}
                Size={UDim2.fromOffset(18, 18)}
                Text=""
              >
                <uicorner CornerRadius={new UDim(1, 0)} />
              </textbutton>
            </Slider.Thumb>
          </frame>
        </Slider.Track>
      </Slider.Root>

      <textlabel
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 56)}
        Size={UDim2.fromOffset(320, 20)}
        Text={`Value: ${math.floor(value)}`}
        TextColor3={Color3.fromRGB(172, 181, 196)}
        TextSize={13}
        TextXAlignment={Enum.TextXAlignment.Left}
      />
    </frame>
  );
}
