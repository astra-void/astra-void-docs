import * as React from "react";
import { computePopper } from "@lattice-ui/popper";

export function PopperExample() {
  const result = computePopper({
    anchorPosition: new Vector2(180, 60),
    anchorSize: new Vector2(160, 40),
    contentSize: new Vector2(220, 120),
    viewportSize: new Vector2(800, 600),
    placement: "bottom",
    offset: new Vector2(0, 8),
    padding: 12,
  });

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 220)}>
      <frame
        BackgroundColor3={Color3.fromRGB(53, 104, 196)}
        BorderSizePixel={0}
        Position={UDim2.fromOffset(180, 60)}
        Size={UDim2.fromOffset(160, 40)}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </frame>
      <frame
        BackgroundColor3={Color3.fromRGB(34, 41, 54)}
        BorderSizePixel={0}
        Position={result.position}
        Size={UDim2.fromOffset(220, 120)}
      >
        <uicorner CornerRadius={new UDim(0, 10)} />
      </frame>
      <textlabel
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 0)}
        Size={UDim2.fromOffset(400, 42)}
        Text={`Resolved placement: ${result.placement} | x=${result.position.X.Offset} y=${result.position.Y.Offset}`}
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        TextWrapped={true}
        TextXAlignment={Enum.TextXAlignment.Left}
        TextYAlignment={Enum.TextYAlignment.Top}
      />
    </frame>
  );
}
