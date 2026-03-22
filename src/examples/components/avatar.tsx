import { Avatar } from "@lattice-ui/avatar";
import { React } from "@lattice-ui/core";

export function AvatarExample() {
  const [broken, setBroken] = React.useState(false);
  const src = broken ? "rbxassetid://0" : "rbxasset://textures/ui/GuiImagePlaceholder.png";

  return (
    <frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 170)}>
      <Avatar.Root delayMs={250} src={src}>
        <frame BackgroundColor3={Color3.fromRGB(34, 41, 54)} BorderSizePixel={0} Size={UDim2.fromOffset(64, 64)}>
          <uicorner CornerRadius={new UDim(1, 0)} />
          <Avatar.Image asChild>
            <imagelabel BackgroundTransparency={1} BorderSizePixel={0} Size={UDim2.fromScale(1, 1)}>
              <uicorner CornerRadius={new UDim(1, 0)} />
            </imagelabel>
          </Avatar.Image>
          <Avatar.Fallback asChild>
            <textlabel
              BackgroundTransparency={1}
              BorderSizePixel={0}
              Size={UDim2.fromScale(1, 1)}
              Text="UI"
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={18}
            />
          </Avatar.Fallback>
        </frame>
      </Avatar.Root>

      <textbutton
        AutoButtonColor={false}
        BackgroundColor3={Color3.fromRGB(34, 41, 54)}
        BorderSizePixel={0}
        Position={UDim2.fromOffset(0, 84)}
        Size={UDim2.fromOffset(220, 36)}
        Text={broken ? "Use valid image" : "Use broken image"}
        TextColor3={Color3.fromRGB(236, 240, 248)}
        TextSize={14}
        Event={{
          Activated: () => setBroken((value) => !value),
        }}
      >
        <uicorner CornerRadius={new UDim(0, 8)} />
      </textbutton>
    </frame>
  );
}
