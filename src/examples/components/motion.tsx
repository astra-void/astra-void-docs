import {
	createToggleResponseRecipe,
	MotionProvider,
	useResponseMotion,
} from "@lattice-ui/motion";
import React from "@rbxts/react";

export function MotionExample() {
	const [reduced, setReduced] = React.useState(false);

	return (
		<MotionProvider mode={reduced ? "none" : "full"}>
			<MotionPolicyDemo reduced={reduced} onReducedChange={setReduced} />
		</MotionProvider>
	);
}

function MotionPolicyDemo(props: {
	reduced: boolean;
	onReducedChange: (nextReduced: boolean) => void;
}) {
	const [enabled, setEnabled] = React.useState(false);
	const motionRef = useResponseMotion<TextButton>(
		enabled,
		{
			active: {
				BackgroundColor3: Color3.fromRGB(53, 104, 196),
				Position: UDim2.fromOffset(136, 0),
			},
			inactive: {
				BackgroundColor3: Color3.fromRGB(60, 76, 104),
				Position: UDim2.fromOffset(0, 0),
			},
		},
		createToggleResponseRecipe(),
	);

	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromOffset(440, 190)}>
			<frame
				BackgroundColor3={Color3.fromRGB(22, 28, 39)}
				BorderSizePixel={0}
				Size={UDim2.fromOffset(260, 44)}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
				<textbutton
					AutoButtonColor={false}
					BorderSizePixel={0}
					Size={UDim2.fromOffset(124, 44)}
					Text={enabled ? "Enabled" : "Disabled"}
					TextColor3={Color3.fromRGB(236, 240, 248)}
					TextSize={14}
					Event={{ Activated: () => setEnabled((value) => !value) }}
					ref={motionRef}
				>
					<uicorner CornerRadius={new UDim(0, 8)} />
				</textbutton>
			</frame>

			<textbutton
				AutoButtonColor={false}
				BackgroundColor3={Color3.fromRGB(34, 41, 54)}
				BorderSizePixel={0}
				Position={UDim2.fromOffset(0, 62)}
				Size={UDim2.fromOffset(260, 36)}
				Text={props.reduced ? "Reduced motion: on" : "Reduced motion: off"}
				TextColor3={Color3.fromRGB(236, 240, 248)}
				TextSize={14}
				Event={{ Activated: () => props.onReducedChange(!props.reduced) }}
			>
				<uicorner CornerRadius={new UDim(0, 8)} />
			</textbutton>

			<textlabel
				BackgroundTransparency={1}
				Position={UDim2.fromOffset(0, 118)}
				Size={UDim2.fromOffset(340, 44)}
				Text="MotionProvider owns policy. The control owns state; motion only settles the visual response."
				TextColor3={Color3.fromRGB(172, 181, 196)}
				TextSize={13}
				TextWrapped={true}
				TextXAlignment={Enum.TextXAlignment.Left}
				TextYAlignment={Enum.TextYAlignment.Top}
			/>
		</frame>
	);
}
