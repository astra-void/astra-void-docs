import { ToggleGroup } from "@lattice-ui/toggle-group";
import React from "@rbxts/react";

export function ToggleGroupExample() {
	const [value, setValue] = React.useState<string | undefined>("alpha");

	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 160)}>
			<ToggleGroup.Root onValueChange={setValue} type="single" value={value}>
				<frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 40)}>
					<uilistlayout
						FillDirection={Enum.FillDirection.Horizontal}
						Padding={new UDim(0, 8)}
					/>
					{(["alpha", "beta", "gamma"] as const).map((itemValue) => (
						<ToggleGroup.Item asChild key={itemValue} value={itemValue}>
							<textbutton
								AutoButtonColor={false}
								BackgroundColor3={
									value === itemValue
										? Color3.fromRGB(53, 104, 196)
										: Color3.fromRGB(34, 41, 54)
								}
								BorderSizePixel={0}
								Size={UDim2.fromOffset(110, 36)}
								Text={itemValue}
								TextColor3={Color3.fromRGB(236, 240, 248)}
								TextSize={14}
							>
								<uicorner CornerRadius={new UDim(0, 8)} />
							</textbutton>
						</ToggleGroup.Item>
					))}
				</frame>
			</ToggleGroup.Root>
		</frame>
	);
}
