import { Tabs } from "@lattice-ui/tabs";
import React from "@rbxts/react";

export function TabsExample() {
	const [value, setValue] = React.useState("overview");

	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromOffset(520, 240)}>
			<Tabs.Root onValueChange={setValue} value={value}>
				<Tabs.List asChild>
					<frame BackgroundTransparency={1} Size={UDim2.fromOffset(360, 40)}>
						<uilistlayout
							FillDirection={Enum.FillDirection.Horizontal}
							Padding={new UDim(0, 8)}
						/>
						{(["overview", "activity", "settings"] as const).map((tab) => (
							<Tabs.Trigger asChild key={tab} value={tab}>
								<textbutton
									AutoButtonColor={false}
									BackgroundColor3={
										value === tab
											? Color3.fromRGB(53, 104, 196)
											: Color3.fromRGB(34, 41, 54)
									}
									BorderSizePixel={0}
									Size={UDim2.fromOffset(112, 36)}
									Text={tab}
									TextColor3={Color3.fromRGB(236, 240, 248)}
									TextSize={14}
								>
									<uicorner CornerRadius={new UDim(0, 8)} />
								</textbutton>
							</Tabs.Trigger>
						))}
					</frame>
				</Tabs.List>

				{(["overview", "activity", "settings"] as const).map((tab) => (
					<Tabs.Content
						asChild
						forceMount={tab === "overview"}
						key={tab}
						value={tab}
					>
						<frame
							BackgroundColor3={Color3.fromRGB(34, 41, 54)}
							BorderSizePixel={0}
							Position={UDim2.fromOffset(0, 56)}
							Size={UDim2.fromOffset(360, 110)}
						>
							<uicorner CornerRadius={new UDim(0, 10)} />
							<textlabel
								BackgroundTransparency={1}
								Position={UDim2.fromOffset(14, 14)}
								Size={UDim2.fromOffset(320, 32)}
								Text={`${tab} content`}
								TextColor3={Color3.fromRGB(236, 240, 248)}
								TextSize={14}
								TextXAlignment={Enum.TextXAlignment.Left}
							/>
						</frame>
					</Tabs.Content>
				))}
			</Tabs.Root>
		</frame>
	);
}
