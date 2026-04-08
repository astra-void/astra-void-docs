import * as React from "react";
import { Dialog } from "@lattice-ui/dialog";
import { PortalProvider } from "@lattice-ui/layer";

type Props = {
  playerGui: PlayerGui;
};

function DialogDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger asChild>
        <textbutton
          AutoButtonColor={false}
          BackgroundColor3={Color3.fromRGB(53, 104, 196)}
          BorderSizePixel={0}
          Size={UDim2.fromOffset(180, 40)}
          Text={open ? "Dialog open" : "Open dialog"}
          TextColor3={Color3.fromRGB(240, 244, 250)}
          TextSize={14}
        >
          <uicorner CornerRadius={new UDim(0, 8)} />
        </textbutton>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Content trapFocus={true} restoreFocus={true}>
          <Dialog.Overlay />
          <frame
            AnchorPoint={new Vector2(0.5, 0.5)}
            BackgroundColor3={Color3.fromRGB(34, 41, 54)}
            BorderSizePixel={0}
            Position={UDim2.fromScale(0.5, 0.5)}
            Size={UDim2.fromOffset(360, 180)}
          >
            <uicorner CornerRadius={new UDim(0, 10)} />
            <textlabel
              BackgroundTransparency={1}
              Position={UDim2.fromOffset(18, 18)}
              Size={UDim2.fromOffset(320, 48)}
              Text="Dialog content owns the interaction mode and restores focus to the trigger on close."
              TextColor3={Color3.fromRGB(236, 240, 248)}
              TextSize={16}
              TextWrapped={true}
              TextXAlignment={Enum.TextXAlignment.Left}
              TextYAlignment={Enum.TextYAlignment.Top}
            />
            <Dialog.Close asChild>
              <textbutton
                AutoButtonColor={false}
                BackgroundColor3={Color3.fromRGB(53, 104, 196)}
                BorderSizePixel={0}
                Position={UDim2.fromOffset(18, 122)}
                Size={UDim2.fromOffset(120, 36)}
                Text="Close"
                TextColor3={Color3.fromRGB(240, 244, 250)}
                TextSize={14}
              >
                <uicorner CornerRadius={new UDim(0, 8)} />
              </textbutton>
            </Dialog.Close>
          </frame>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DialogExample(props: Props) {
  return (
    <PortalProvider container={props.playerGui}>
      <DialogDemo />
    </PortalProvider>
  );
}
