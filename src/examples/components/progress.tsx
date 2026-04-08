import { Progress } from "@lattice-ui/progress";
import * as React from "react";

export function ProgressExample() {
  const [value, setValue] = React.useState(40);

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 180)}>
      <Progress.Root max={100} value={value}>
        <frame
          BackgroundColor3={Color3.fromRGB(34, 41, 54)}
          BorderSizePixel={0}
          Size={UDim2.fromOffset(320, 14)}
        >
          <uicorner CornerRadius={new UDim(0, 7)} />
          <Progress.Indicator asChild>
            <frame
              BackgroundColor3={Color3.fromRGB(53, 104, 196)}
              BorderSizePixel={0}
              Size={UDim2.fromScale(1, 1)}
            >
              <uicorner CornerRadius={new UDim(0, 7)} />
            </frame>
          </Progress.Indicator>
        </frame>
      </Progress.Root>

      <Progress.Spinner asChild speedDegPerSecond={240} spinning={true}>
        <frame
          BackgroundTransparency={1}
          BorderSizePixel={0}
          Position={UDim2.fromOffset(0, 34)}
          Size={UDim2.fromOffset(24, 24)}
        >
          <uistroke
            Color={Color3.fromRGB(53, 104, 196)}
            Thickness={2}
            Transparency={0.35}
          />
          <frame
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(53, 104, 196)}
            BorderSizePixel={0}
            Position={UDim2.fromScale(0.5, 0.1)}
            Size={UDim2.fromOffset(4, 4)}
          >
            <uicorner CornerRadius={new UDim(1, 0)} />
          </frame>
        </frame>
      </Progress.Spinner>

      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(60, 76, 104)}
        BorderSizePixel={0}
        Position={UDim2.fromOffset(0, 78)}
        Size={UDim2.fromOffset(140, 34)}
        Text="Increase by 10"
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        Event={{
          Activated: () => setValue((current) => math.min(100, current + 10)),
        }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>
    </frame>
  );
}
