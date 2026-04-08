import React from "@rbxts/react";
import { Toast, useToast } from "@lattice-ui/toast";

function ToastDemo() {
  const toast = useToast();

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 220)}>
      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(53, 104, 196)}
        BorderSizePixel={0}
        Size={UDim2.fromOffset(160, 38)}
        Text="Enqueue toast"
        TextColor3={Color3.fromRGB(240, 244, 250)}
        TextSize={14}
        Event={{
          Activated: () => {
            toast.enqueue({
              title: "Saved",
              description: "Preferences were updated.",
            });
          },
        }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>

      <frame
        BackgroundTransparency={1}
        Position={UDim2.fromOffset(0, 56)}
        Size={UDim2.fromOffset(320, 140)}
      >
        <Toast.Viewport />
      </frame>
    </frame>
  );
}

export function ToastExample() {
  return (
    <Toast.Provider defaultDurationMs={3000} maxVisible={3}>
      <ToastDemo />
    </Toast.Provider>
  );
}
