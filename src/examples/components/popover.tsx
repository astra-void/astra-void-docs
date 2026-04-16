import { PortalProvider } from "@lattice-ui/layer";
import { Popover } from "@lattice-ui/popover";
import React from "@rbxts/react";

type Props = {
	playerGui: PlayerGui;
};

function PopoverDemo() {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover.Root onOpenChange={setOpen} open={open}>
			<Popover.Trigger asChild>
				<textbutton
					AutoButtonColor={false}
					BackgroundColor3={Color3.fromRGB(53, 104, 196)}
					BorderSizePixel={0}
					Size={UDim2.fromOffset(190, 40)}
					Text="Toggle popover"
					TextColor3={Color3.fromRGB(240, 244, 250)}
					TextSize={14}
				>
					<uicorner CornerRadius={new UDim(0, 8)} />
				</textbutton>
			</Popover.Trigger>

			<Popover.Portal>
				<Popover.Content asChild offset={new Vector2(0, 8)} placement="bottom">
					<frame
						BackgroundColor3={Color3.fromRGB(34, 41, 54)}
						BorderSizePixel={0}
						Size={UDim2.fromOffset(280, 146)}
					>
						<uicorner CornerRadius={new UDim(0, 10)} />
						<textlabel
							BackgroundTransparency={1}
							Position={UDim2.fromOffset(14, 14)}
							Size={UDim2.fromOffset(252, 54)}
							Text="Use Popover when the surface should stay anchored to the trigger instead of taking over the whole interaction mode."
							TextColor3={Color3.fromRGB(236, 240, 248)}
							TextSize={14}
							TextWrapped={true}
							TextXAlignment={Enum.TextXAlignment.Left}
							TextYAlignment={Enum.TextYAlignment.Top}
						/>
						<Popover.Close asChild>
							<textbutton
								AutoButtonColor={false}
								BackgroundColor3={Color3.fromRGB(60, 76, 104)}
								BorderSizePixel={0}
								Position={UDim2.fromOffset(14, 96)}
								Size={UDim2.fromOffset(100, 32)}
								Text="Close"
								TextColor3={Color3.fromRGB(236, 240, 248)}
								TextSize={14}
							>
								<uicorner CornerRadius={new UDim(0, 8)} />
							</textbutton>
						</Popover.Close>
					</frame>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}

export function PopoverExample(props: Props) {
	return (
		<PortalProvider container={props.playerGui}>
			<PopoverDemo />
		</PortalProvider>
	);
}
