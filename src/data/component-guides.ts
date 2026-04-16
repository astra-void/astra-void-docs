export type ComponentGuideLink = {
	label: string;
	href: string;
	description: string;
};

export const componentGuideLinks: Record<string, ComponentGuideLink[]> = {
	checkbox: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Switch vs Checkbox and see when indeterminate state matters.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review controlled/uncontrolled transitions and disabled item behavior before wiring forms.",
		},
	],
	combobox: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Select vs Combobox vs Radio Group before committing to typed filtering.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review PortalProvider, focus, disabled items, and controlled/uncontrolled transitions.",
		},
	],
	dialog: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Dialog vs Popover when deciding whether a surface should own interaction mode.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review PortalProvider, overlay stacking, and focus restoration before shipping dialogs.",
		},
	],
	focus: [
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review focus ownership, trapped scopes, and restoreFocus expectations.",
		},
	],
	layer: [
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review PortalProvider placement, stacking rules, and dismissable layer coordination.",
		},
	],
	popover: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Dialog vs Popover when deciding between lightweight anchors and full overlays.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review PortalProvider, stacking, and focus limits before using anchored overlays.",
		},
	],
	"radio-group": [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Select vs Combobox vs Radio Group for visible single-choice workflows.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review disabled item behavior and controlled ownership before wiring form state.",
		},
	],
	select: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Select vs Combobox vs Radio Group for compact single-choice workflows.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review PortalProvider, disabled items, and controlled/uncontrolled transitions before composing lists.",
		},
	],
	switch: [
		{
			label: "Choosing between controls",
			href: "/components/choosing-controls/",
			description:
				"Compare Switch vs Checkbox for immediate settings vs selection membership.",
		},
		{
			label: "Overlay and state pitfalls",
			href: "/components/implementation-pitfalls/",
			description:
				"Review controlled/uncontrolled transitions before synchronizing switch state with settings models.",
		},
	],
};
