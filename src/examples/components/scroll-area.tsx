import { ScrollArea } from "@lattice-ui/scroll-area";

export function ScrollAreaExample() {
	return (
		<frame BackgroundTransparency={1} Size={UDim2.fromOffset(560, 260)}>
			<ScrollArea.Root>
				<frame BackgroundTransparency={1} Size={UDim2.fromOffset(420, 200)}>
					<ScrollArea.Viewport asChild>
						<scrollingframe
							AutomaticCanvasSize={Enum.AutomaticSize.None}
							BackgroundColor3={Color3.fromRGB(34, 41, 54)}
							BorderSizePixel={0}
							CanvasSize={UDim2.fromOffset(760, 420)}
							ScrollBarImageTransparency={1}
							ScrollBarThickness={0}
							ScrollingDirection={Enum.ScrollingDirection.XY}
							Size={UDim2.fromOffset(380, 160)}
						>
							<frame
								BackgroundColor3={Color3.fromRGB(53, 104, 196)}
								BorderSizePixel={0}
								Position={UDim2.fromOffset(24, 24)}
								Size={UDim2.fromOffset(220, 90)}
							/>
							<frame
								BackgroundColor3={Color3.fromRGB(173, 80, 80)}
								BorderSizePixel={0}
								Position={UDim2.fromOffset(520, 260)}
								Size={UDim2.fromOffset(180, 100)}
							/>
						</scrollingframe>
					</ScrollArea.Viewport>

					<ScrollArea.Scrollbar asChild orientation="vertical">
						<frame
							BackgroundColor3={Color3.fromRGB(60, 76, 104)}
							BorderSizePixel={0}
							Position={UDim2.fromOffset(384, 0)}
							Size={UDim2.fromOffset(8, 160)}
						>
							<ScrollArea.Thumb asChild orientation="vertical">
								<frame
									BackgroundColor3={Color3.fromRGB(172, 181, 196)}
									BorderSizePixel={0}
									Size={UDim2.fromScale(1, 1)}
								>
									<uicorner CornerRadius={new UDim(1, 0)} />
								</frame>
							</ScrollArea.Thumb>
						</frame>
					</ScrollArea.Scrollbar>

					<ScrollArea.Scrollbar asChild orientation="horizontal">
						<frame
							BackgroundColor3={Color3.fromRGB(60, 76, 104)}
							BorderSizePixel={0}
							Position={UDim2.fromOffset(0, 164)}
							Size={UDim2.fromOffset(380, 8)}
						>
							<ScrollArea.Thumb asChild orientation="horizontal">
								<frame
									BackgroundColor3={Color3.fromRGB(172, 181, 196)}
									BorderSizePixel={0}
									Size={UDim2.fromScale(1, 1)}
								>
									<uicorner CornerRadius={new UDim(1, 0)} />
								</frame>
							</ScrollArea.Thumb>
						</frame>
					</ScrollArea.Scrollbar>

					<ScrollArea.Corner asChild>
						<frame
							BackgroundColor3={Color3.fromRGB(60, 76, 104)}
							BorderSizePixel={0}
							Position={UDim2.fromOffset(384, 164)}
							Size={UDim2.fromOffset(8, 8)}
						/>
					</ScrollArea.Corner>
				</frame>
			</ScrollArea.Root>
		</frame>
	);
}
