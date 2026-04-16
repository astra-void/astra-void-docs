import { FocusScope } from "@lattice-ui/focus";
import React from "@rbxts/react";

export function FocusExample() {
	const [active, setActive] = React.useState(true);

	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 180)}>
			<FocusScope active={active} restoreFocus={true} trapped={true}>
				<frame
					BackgroundColor3={Color3.fromRGB(34, 41, 54)}
					BorderSizePixel={0}
					Size={UDim2.fromOffset(320, 92)}
				>
					<uicorner CornerRadius={new UDim(0, 10)} />
					<textlabel
						BackgroundTransparency={1}
						Position={UDim2.fromOffset(12, 12)}
						Size={UDim2.fromOffset(290, 44)}
						Text="Active FocusScope keeps selection inside this region until the scope is released."
						TextColor3={Color3.fromRGB(236, 240, 248)}
						TextSize={14}
						TextWrapped={true}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextYAlignment={Enum.TextYAlignment.Top}
					/>
				</frame>
			</FocusScope>

			<textbutton
				AutoButtonColor={false}
				BackgroundColor3={Color3.fromRGB(60, 76, 104)}
				BorderSizePixel={0}
				Position={UDim2.fromOffset(0, 110)}
				Size={UDim2.fromOffset(200, 34)}
				Text={active ? "Release focus scope" : "Activate focus scope"}
				TextColor3={Color3.fromRGB(236, 240, 248)}
				TextSize={14}
				Event={{ Activated: () => setActive((value) => !value) }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>
		</frame>
	);
}
