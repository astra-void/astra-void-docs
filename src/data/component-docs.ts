export type PackageDocLink = {
  label: string;
  href: string;
};

export type PackageDocEntry = {
  name: string;
  description: string;
};

export type PackageDocPattern = {
  title: string;
  description: string;
};

export type PackageDocData = {
  installName: string;
  npm: string;
  whatItIsFor: string[];
  exports: string[];
  stateModel: string[];
  keyApi: PackageDocEntry[];
  compositionPatterns: PackageDocPattern[];
  cautions: string[];
  related: PackageDocLink[];
};

export const componentDocs: Record<string, PackageDocData> = {
  accordion: {
    installName: "accordion",
    npm: "@lattice-ui/accordion",
    whatItIsFor: [
      "Use `Accordion` when the screen needs progressive disclosure without leaving the current layout.",
      "It is a headless compound component, so you own the trigger visuals, spacing, and motion while the package owns open-state coordination.",
    ],
    exports: [
      "Accordion",
      "Accordion.Root",
      "Accordion.Item",
      "Accordion.Header",
      "Accordion.Trigger",
      "Accordion.Content",
    ],
    stateModel: [
      "`Accordion.Root` can be controlled with `value` or uncontrolled with `defaultValue`.",
      "`type` switches the value shape between a single string and an array of strings.",
      "Each item tracks `open` and `disabled` state through context, and `Accordion.Content` can stay mounted with `forceMount`.",
    ],
    keyApi: [
      {
        name: "Accordion.Root",
        description:
          "Use `type`, `value`, `defaultValue`, `onValueChange`, and `collapsible` to define the disclosure model for the entire group.",
      },
      {
        name: "Accordion.Item",
        description:
          "Each item needs a stable `value`; `disabled` removes that item from interaction without changing the rest of the group.",
      },
      {
        name: "Accordion.Content",
        description:
          "Use `forceMount` when you need persistent layout measurement or your own enter/exit animation handling.",
      },
    ],
    compositionPatterns: [
      {
        title: "FAQ or help content",
        description:
          "Model each answer as an `Accordion.Item` so the surrounding layout stays simple and only the disclosure behavior is shared.",
      },
      {
        title: "Settings sections",
        description:
          'Use `type="single"` when the UI should encourage one open section at a time, and `type="multiple"` for checklist-style review flows.',
      },
    ],
    cautions: [
      "Match the controlled `value` shape to `type`: a single string for `single`, an array for `multiple`.",
      "The package does not style or animate panels for you; provide your own trigger affordance and content transition treatment.",
    ],
    related: [
      { label: "Tabs", href: "/components/tabs/" },
      { label: "Dialog", href: "/components/dialog/" },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  avatar: {
    installName: "avatar",
    npm: "@lattice-ui/avatar",
    whatItIsFor: [
      "Use `Avatar` for profile chips, player lists, or presence surfaces where image loading and fallback timing need to stay consistent.",
      "The package separates image state from rendering, so you can fully own the Roblox instances used for the picture and the fallback.",
    ],
    exports: ["Avatar", "Avatar.Root", "Avatar.Image", "Avatar.Fallback"],
    stateModel: [
      "`Avatar.Root` tracks `src`, image `status`, and whether the fallback delay has elapsed.",
      "`Avatar.Image` and `Avatar.Fallback` read the same state, so they stay synchronized without manual branching in the caller.",
      "`delayMs` controls when the fallback becomes visible while the image is still unresolved.",
    ],
    keyApi: [
      {
        name: "Avatar.Root",
        description:
          "Pass `src` and optional `delayMs` to control image loading behavior and fallback reveal timing.",
      },
      {
        name: "Avatar.Image",
        description:
          "Use `asChild` to bind the avatar state onto your own `ImageLabel` or similar host element.",
      },
      {
        name: "Avatar.Fallback",
        description:
          "Render initials, status dots, or silhouette content only when the shared avatar state says the fallback should appear.",
      },
    ],
    compositionPatterns: [
      {
        title: "Player roster rows",
        description:
          "Keep the host image primitive small and let the fallback render initials or a status badge without duplicating load/error state outside the avatar tree.",
      },
      {
        title: "Dense status chips",
        description:
          "Short `delayMs` values work well when a missing image should reveal fallback content quickly in compact, frequently changing lists.",
      },
    ],
    cautions: [
      "Fallback visibility is state-driven; do not mount a separate unconditional fallback outside `Avatar.Fallback` if you want consistent behavior.",
      "A missing or failed image source resolves to fallback immediately, while a loading image waits for the configured delay.",
    ],
    related: [
      { label: "Style", href: "/components/style/" },
      { label: "System", href: "/components/system/" },
      { label: "Progress", href: "/components/progress/" },
    ],
  },
  checkbox: {
    installName: "checkbox",
    npm: "@lattice-ui/checkbox",
    whatItIsFor: [
      "Use `Checkbox` for boolean or tri-state choices where the control itself is the interaction target.",
      "It is useful when you need `indeterminate` state and want to keep the visual host fully custom.",
    ],
    exports: ["Checkbox", "Checkbox.Root", "Checkbox.Indicator"],
    stateModel: [
      '`checked` supports `true`, `false`, and `"indeterminate"`.',
      "`Checkbox.Root` supports both controlled and uncontrolled state via `checked` or `defaultChecked`.",
      "`Checkbox.Indicator` reflects the current checked state and can remain mounted with `forceMount`.",
    ],
    keyApi: [
      {
        name: "Checkbox.Root",
        description:
          "Use `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, and `required` to integrate with your own form model.",
      },
      {
        name: "Checkbox.Root asChild",
        description:
          "Set `asChild` when you want the click behavior attached to an existing button-like element instead of the default host.",
      },
      {
        name: "Checkbox.Indicator",
        description:
          "Mount visual marks, fills, or icons inside the checkbox without rebuilding checked-state plumbing.",
      },
    ],
    compositionPatterns: [
      {
        title: "Checklist rows",
        description:
          "Wrap the interactive host with `Checkbox.Root asChild` and render the label beside it so the state lives in one place.",
      },
      {
        title: "Partial selection",
        description:
          'Use `"indeterminate"` for parent-group selection UIs where some but not all descendants are active.',
      },
    ],
    cautions: [
      "The default toggle cycle is `indeterminate -> true -> false`; account for that if you map the value into external state.",
      "Use `Switch` instead of `Checkbox` when the UI should communicate an immediate on/off setting rather than selection membership.",
    ],
    related: [
      { label: "Switch", href: "/components/switch/" },
      { label: "Radio Group", href: "/components/radio-group/" },
      { label: "Text Field", href: "/components/text-field/" },
    ],
  },
  combobox: {
    installName: "combobox",
    npm: "@lattice-ui/combobox",
    whatItIsFor: [
      "Use `Combobox` when the user needs to type into a field and still commit to one option from a registered list.",
      "It sits between `Select` and `TextField`: the package owns list filtering, option registration, and value/input synchronization, while you own the rendered UI.",
    ],
    exports: [
      "Combobox",
      "Combobox.Root",
      "Combobox.Trigger",
      "Combobox.Input",
      "Combobox.Value",
      "Combobox.Portal",
      "Combobox.Content",
      "Combobox.Item",
      "Combobox.Group",
      "Combobox.Label",
      "Combobox.Separator",
    ],
    stateModel: [
      "`Combobox.Root` can control three values independently: selected `value`, typed `inputValue`, and `open`.",
      "When the list closes, the input is synchronized back to the selected option text.",
      "Opening logic, filtering, and item registration all live in the root context, and disabled or read-only roots reject writes.",
    ],
    keyApi: [
      {
        name: "Combobox.Root",
        description:
          "Use `value`, `inputValue`, `open`, and their default/onChange pairs when integrating with external form or search state.",
      },
      {
        name: "Combobox.Input",
        description:
          "This is the typed query surface; `placeholder`, `disabled`, and `readOnly` are the key integration points.",
      },
      {
        name: "Combobox.Content",
        description:
          "Use `placement`, `offset`, `padding`, and outside-interaction callbacks for overlay positioning and dismissal behavior.",
      },
      {
        name: "filterFn",
        description:
          "Override `filterFn` when case-insensitive substring matching is not enough for your search rules.",
      },
    ],
    compositionPatterns: [
      {
        title: "Searchable settings picker",
        description:
          "Compose `Trigger`, `Value`, and `Input` together so the currently selected value and the live filter query are both visible.",
      },
      {
        title: "Strict option selection",
        description:
          "Use `Combobox.Item` for every valid value and let the package re-sync the input text to the chosen option when the list closes.",
      },
    ],
    cautions: [
      "This package is still a selection control, not a freeform text field; the stable committed value comes from registered items.",
      "Because content is portal-based, use `PortalProvider` when you need predictable overlay mounting and display order.",
    ],
    related: [
      { label: "Select", href: "/components/select/" },
      { label: "Text Field", href: "/components/text-field/" },
      { label: "Layer", href: "/components/layer/" },
    ],
  },
  core: {
    installName: "core",
    npm: "@lattice-ui/core",
    whatItIsFor: [
      "Use `@lattice-ui/core` when you are building your own headless primitives or compound components on top of the same low-level conventions used by the rest of Lattice UI.",
      "Most app teams consume it indirectly through other packages, but it is the place to reach for controllable state, slots, ref composition, and shared React bindings.",
    ],
    exports: [
      "React",
      "ReactRoblox",
      "useControllableState",
      "Slot",
      "Slottable",
      "composeRefs",
      "context helpers",
      "focus helpers",
    ],
    stateModel: [
      "There is no package-level runtime model; `core` provides helper primitives that let callers build their own stateful components.",
      "`useControllableState` is the main pattern bridge between controlled and uncontrolled usage across the package ecosystem.",
      "Slot and ref helpers preserve caller-owned tree structure while still allowing behavior injection.",
    ],
    keyApi: [
      {
        name: "useControllableState",
        description:
          "Use this when a primitive should support both controlled props and internal fallback state.",
      },
      {
        name: "Slot / Slottable",
        description:
          "Use slots when your package should attach behavior to caller-owned Roblox instances instead of forcing a host element.",
      },
      {
        name: "composeRefs",
        description:
          "Use composed refs to merge internal wiring with a caller-provided ref without dropping either one.",
      },
    ],
    compositionPatterns: [
      {
        title: "New headless primitives",
        description:
          "Combine `useControllableState`, context helpers, and `Slot` when you want a package to look and behave like the rest of Lattice UI.",
      },
      {
        title: "Interop with caller-owned hosts",
        description:
          "Use the slot pattern when the app already has a visual button or frame and only needs interaction/state semantics applied to it.",
      },
    ],
    cautions: [
      "`core` is intentionally low-level; if you only need styling, layout, or a finished headless primitive, prefer `style`, `system`, or a component package.",
      "Directly depending on `core` usually means you are authoring infrastructure, not just composing product UI.",
    ],
    related: [
      { label: "Style", href: "/components/style/" },
      { label: "Layer", href: "/components/layer/" },
      { label: "Focus", href: "/components/focus/" },
    ],
  },
  dialog: {
    installName: "dialog",
    npm: "@lattice-ui/dialog",
    whatItIsFor: [
      "Use `Dialog` for modal or non-modal overlays that own focus handoff, outside dismissal, and explicit close actions.",
      "The package gives you the compound structure for triggers, content, overlay, and close controls while leaving rendering and layout fully headless.",
    ],
    exports: [
      "Dialog",
      "Dialog.Root",
      "Dialog.Trigger",
      "Dialog.Portal",
      "Dialog.Content",
      "Dialog.Overlay",
      "Dialog.Close",
    ],
    stateModel: [
      "`Dialog.Root` can be controlled with `open` or uncontrolled with `defaultOpen`.",
      "`modal` defaults the interaction model for the whole dialog tree, and `Dialog.Content` controls focus trapping and focus restoration.",
      "Portal, overlay, and outside-interaction dismissal are coordinated through shared layer state, not through userland event wiring.",
    ],
    keyApi: [
      {
        name: "Dialog.Root",
        description:
          "Use `open`, `defaultOpen`, `onOpenChange`, and `modal` to define how the dialog participates in app state and surrounding interaction.",
      },
      {
        name: "Dialog.Content",
        description:
          "Use `trapFocus`, `restoreFocus`, and outside-interaction callbacks when you need to customize the default overlay behavior.",
      },
      {
        name: "Dialog.Overlay",
        description:
          "Mount the backdrop separately so you can own the visual treatment without re-implementing overlay semantics.",
      },
      {
        name: "Dialog.Close",
        description:
          "Attach close behavior to any host element without coupling it to a specific button implementation.",
      },
    ],
    compositionPatterns: [
      {
        title: "Settings or confirmation modal",
        description:
          "Use `Trigger`, `Portal`, `Overlay`, `Content`, and `Close` as separate pieces so layout and visual hierarchy remain fully app-owned.",
      },
      {
        title: "Managed focus return",
        description:
          "Keep dialogs tied to a concrete trigger when possible so `restoreFocus` returns the user to a predictable origin after dismissal.",
      },
    ],
    cautions: [
      "Dialogs depend on portal-based layering for reliable overlay behavior; use `PortalProvider` near the app root.",
      "A dialog is the right fit when content should own the interaction mode; use `Popover` for lighter anchored surfaces.",
    ],
    related: [
      { label: "Layer", href: "/components/layer/" },
      { label: "Popover", href: "/components/popover/" },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  focus: {
    installName: "focus",
    npm: "@lattice-ui/focus",
    whatItIsFor: [
      "Use `FocusScope` when a section of the UI needs to trap `GuiService.SelectedObject` and optionally restore focus when that scope deactivates.",
      "It is a foundation package for overlays and composite interaction regions rather than a styled control on its own.",
    ],
    exports: ["FocusScope"],
    stateModel: [
      "`FocusScope` tracks whether it is `active`, whether focus should be `trapped`, and whether prior focus should be restored on teardown.",
      "Nested trapped scopes are stack-based, so only the top-most active scope redirects outside selections.",
      "The scope model is built around Roblox selection focus, not browser-like DOM focus graphs.",
    ],
    keyApi: [
      {
        name: "FocusScope",
        description:
          "Use `active`, `trapped`, `restoreFocus`, and `asChild` to determine how the scope wraps and controls its descendants.",
      },
    ],
    compositionPatterns: [
      {
        title: "Modal or menu internals",
        description:
          "Wrap overlay content in `FocusScope` when leaving the selection region would create invalid or confusing interaction.",
      },
      {
        title: "Temporary keyboard islands",
        description:
          "Use an active trapped scope for short-lived panels that should return the user to the previous selection when they close.",
      },
    ],
    cautions: [
      "Current focus management is based on `GuiService.SelectedObject`; it does not rewrite `NextSelection*` relationships for you.",
      "Use it for focus ownership, not as a general-purpose navigation system.",
    ],
    related: [
      { label: "Dialog", href: "/components/dialog/" },
      { label: "Layer", href: "/components/layer/" },
      { label: "Tabs", href: "/components/tabs/" },
    ],
  },
  layer: {
    installName: "layer",
    npm: "@lattice-ui/layer",
    whatItIsFor: [
      "Use `layer` when you need the shared mechanics behind portals, outside dismissal, and mount-presence transitions.",
      "It is the coordination layer that powers overlays like dialogs, popovers, menus, selects, and tooltips.",
    ],
    exports: ["DismissableLayer", "PortalProvider", "Portal", "Presence"],
    stateModel: [
      "`PortalProvider` establishes the overlay container and a display-order base for everything mounted beneath it.",
      "`DismissableLayer` tracks whether outside interactions should dismiss the current surface and whether outside pointer events should be blocked.",
      "`Presence` keeps a subtree mounted long enough for exit work to complete and reports `isPresent` to the render function.",
    ],
    keyApi: [
      {
        name: "PortalProvider",
        description:
          "Put this near the UI root with a `PlayerGui` container so overlay packages share one predictable mounting target.",
      },
      {
        name: "Portal",
        description:
          "Use `Portal` when content should render outside its logical parent tree but keep the same React ownership.",
      },
      {
        name: "DismissableLayer",
        description:
          "Use outside-interaction callbacks and `onDismiss` to implement overlay close behavior without manual global input listeners.",
      },
      {
        name: "Presence",
        description:
          "Use `present`, `exitFallbackMs`, and `onExitComplete` to coordinate presence-driven mounting and unmounting.",
      },
    ],
    compositionPatterns: [
      {
        title: "Overlay root setup",
        description:
          "Mount one `PortalProvider` at app root and let all dialog, popover, menu, select, and tooltip content inherit it.",
      },
      {
        title: "Custom layered surfaces",
        description:
          "Compose `Portal`, `DismissableLayer`, and `Presence` directly when you need a custom overlay that does not map cleanly to an existing package.",
      },
    ],
    cautions: [
      "Without a stable `PortalProvider`, overlays can still work but become harder to reason about and coordinate across the app.",
      "`DismissableLayer` handles outside interaction semantics; it does not provide visuals or positioning by itself.",
    ],
    related: [
      { label: "Dialog", href: "/components/dialog/" },
      { label: "Popover", href: "/components/popover/" },
      { label: "Select", href: "/components/select/" },
    ],
  },
  menu: {
    installName: "menu",
    npm: "@lattice-ui/menu",
    whatItIsFor: [
      "Use `Menu` for contextual action lists where opening the surface should immediately hand focus to the first available item.",
      "It is appropriate for action menus and command surfaces, not value-selection widgets like `Select`.",
    ],
    exports: [
      "Menu",
      "Menu.Root",
      "Menu.Trigger",
      "Menu.Portal",
      "Menu.Content",
      "Menu.Item",
      "Menu.Group",
      "Menu.Label",
      "Menu.Separator",
    ],
    stateModel: [
      "`Menu.Root` supports controlled and uncontrolled `open` state and a `modal` mode flag.",
      "Registered menu items are ordered and selection moves through that ordered set when the menu is open.",
      "When the menu opens, the first enabled item receives focus; when it closes, focus can return to the trigger.",
    ],
    keyApi: [
      {
        name: "Menu.Root",
        description:
          "Use `open`, `defaultOpen`, `onOpenChange`, and `modal` to define menu ownership and dismissal behavior.",
      },
      {
        name: "Menu.Content",
        description:
          "Use `placement`, `offset`, and outside-interaction hooks to position the surface and customize dismissal.",
      },
      {
        name: "Menu.Item",
        description:
          "Use `disabled` and `onSelect` for per-action behavior; calling `preventDefault` keeps the menu open when needed.",
      },
    ],
    compositionPatterns: [
      {
        title: "Overflow or kebab menus",
        description:
          "Pair a compact trigger with grouped `Menu.Item` actions and separators for secondary actions that should not live in the main layout.",
      },
      {
        title: "Contextual action blocks",
        description:
          "Use labels and groups to separate destructive or advanced actions without giving up caller-owned visuals.",
      },
    ],
    cautions: [
      "This package models a flat action menu; there are no submenu primitives in the current public surface.",
      "Menus open into item-focus mode immediately, so they are not a replacement for searchable or value-driven pickers.",
    ],
    related: [
      { label: "Select", href: "/components/select/" },
      { label: "Popover", href: "/components/popover/" },
      { label: "Layer", href: "/components/layer/" },
    ],
  },
  popover: {
    installName: "popover",
    npm: "@lattice-ui/popover",
    whatItIsFor: [
      "Use `Popover` for anchored surfaces that should stay connected to a trigger or anchor without taking over the full interaction mode like a dialog.",
      "It is the right fit for inline help, quick settings, or compact secondary editors.",
    ],
    exports: [
      "Popover",
      "Popover.Root",
      "Popover.Trigger",
      "Popover.Anchor",
      "Popover.Portal",
      "Popover.Content",
      "Popover.Close",
    ],
    stateModel: [
      "`Popover.Root` manages controlled or uncontrolled `open` state and optional `modal` behavior.",
      "Trigger, anchor, and content refs are part of the shared context so positioning stays synchronized.",
      "Content uses popper placement data plus layer dismissal semantics rather than in-place layout flow.",
    ],
    keyApi: [
      {
        name: "Popover.Root",
        description:
          "Use `open`, `defaultOpen`, `onOpenChange`, and `modal` to define how heavy the overlay interaction model should be.",
      },
      {
        name: "Popover.Anchor",
        description:
          "Use an explicit anchor when the positioned content should attach to something other than the trigger itself.",
      },
      {
        name: "Popover.Content",
        description:
          "Use `placement`, `offset`, `padding`, and outside-interaction hooks to control geometry and dismissal.",
      },
      {
        name: "Popover.Close",
        description:
          "Attach dismiss behavior to any host element inside the content without introducing extra state plumbing.",
      },
    ],
    compositionPatterns: [
      {
        title: "Quick settings panel",
        description:
          "Use a trigger for entry, then place short form controls inside `Popover.Content` when the edit surface should remain lightweight.",
      },
      {
        title: "Detached anchor workflows",
        description:
          "Use `Popover.Anchor` when the UI affordance that opens the surface is not the same visual target the surface should align to.",
      },
    ],
    cautions: [
      "Because popovers are anchored overlays, they still benefit from a shared `PortalProvider` near the app root.",
      "Use `Dialog` instead when the content should trap attention or own a stronger modal interaction contract.",
    ],
    related: [
      { label: "Dialog", href: "/components/dialog/" },
      { label: "Popper", href: "/components/popper/" },
      { label: "Layer", href: "/components/layer/" },
    ],
  },
  popper: {
    installName: "popper",
    npm: "@lattice-ui/popper",
    whatItIsFor: [
      "Use `popper` when you need low-level anchored positioning without adopting a higher-level overlay component.",
      "It provides the geometry engine used by packages like `Select`, `Popover`, and `Tooltip`.",
    ],
    exports: ["usePopper", "computePopper", "Popper types"],
    stateModel: [
      "There is no shared React context; `usePopper` derives position directly from `anchorRef`, `contentRef`, and geometric inputs.",
      "`placement`, `offset`, and `padding` are the core variables that influence the computed result.",
      "The returned model is just `position`, `anchorPoint`, and the resolved placement plus an `update()` function.",
    ],
    keyApi: [
      {
        name: "usePopper",
        description:
          "Use `anchorRef`, `contentRef`, `placement`, `offset`, `padding`, and `enabled` for live anchored positioning in a component tree.",
      },
      {
        name: "computePopper",
        description:
          "Use the pure compute helper when you need the same geometry logic outside a hook-driven surface.",
      },
      {
        name: "PopperPlacement",
        description:
          "Current placement options are `top`, `bottom`, `left`, and `right`.",
      },
    ],
    compositionPatterns: [
      {
        title: "Custom anchored overlays",
        description:
          "Pair `usePopper` with `Portal` or your own mount strategy when you want positioning but not the rest of a compound overlay package.",
      },
      {
        title: "Measured content surfaces",
        description:
          "Use the `update()` function when geometry needs to be recomputed after layout or content changes.",
      },
    ],
    cautions: [
      "Popper solves positioning only; it does not manage dismissal, focus, portals, or presence.",
      "The public placement model is intentionally small, so build more complex policies above it rather than expecting full menu-like behavior from the package alone.",
    ],
    related: [
      { label: "Popover", href: "/components/popover/" },
      { label: "Select", href: "/components/select/" },
      { label: "Tooltip", href: "/components/tooltip/" },
    ],
  },
  progress: {
    installName: "progress",
    npm: "@lattice-ui/progress",
    whatItIsFor: [
      "Use `Progress` and `Spinner` for task feedback when the app should communicate either measurable completion or ongoing work.",
      "The package gives you normalized progress state and timing hooks while leaving the visuals completely up to you.",
    ],
    exports: [
      "Progress",
      "Progress.Root",
      "Progress.Indicator",
      "Progress.Spinner",
    ],
    stateModel: [
      "`Progress.Root` tracks `value`, `max`, a normalized `ratio`, and `indeterminate` state.",
      "The component supports controlled and uncontrolled numeric progress values.",
      "`Spinner` is a separate primitive that owns only whether it is spinning and how fast it rotates.",
    ],
    keyApi: [
      {
        name: "Progress.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `max`, and `indeterminate` to define the semantic progress state.",
      },
      {
        name: "Progress.Indicator",
        description:
          "Render your own bar or fill element and read the shared ratio through the compound component wiring.",
      },
      {
        name: "Progress.Spinner",
        description:
          "Use `spinning` and `speedDegPerSecond` when you need an activity indicator rather than a measurable progress bar.",
      },
    ],
    compositionPatterns: [
      {
        title: "Linear task feedback",
        description:
          "Use `Progress.Root` plus `Progress.Indicator` for uploads, saves, and loading bars that should reflect a bounded numeric state.",
      },
      {
        title: "Compact pending indicators",
        description:
          "Use `Spinner` for asynchronous work that has no trustworthy completion percentage.",
      },
    ],
    cautions: [
      "`indeterminate` mode is a semantic state, not a built-in animation style; you still own the visuals.",
      "Out-of-range values are normalized by the package, so do not depend on raw overflow behavior in your UI.",
    ],
    related: [
      { label: "Toast", href: "/components/toast/" },
      { label: "Avatar", href: "/components/avatar/" },
      { label: "Style", href: "/components/style/" },
    ],
  },
  "radio-group": {
    installName: "radio-group",
    npm: "@lattice-ui/radio-group",
    whatItIsFor: [
      "Use `RadioGroup` for mutually exclusive selection when the available options should remain visible all at once.",
      "It is best for small, stable option sets where direct comparison matters more than compactness.",
    ],
    exports: [
      "RadioGroup",
      "RadioGroup.Root",
      "RadioGroup.Item",
      "RadioGroup.Indicator",
    ],
    stateModel: [
      "`RadioGroup.Root` manages a single selected `value`, optional `required` semantics, and `horizontal` or `vertical` orientation.",
      "Items register in order so keyboard-style movement can advance through enabled choices.",
      "Each item gets local `checked` and `disabled` state through context.",
    ],
    keyApi: [
      {
        name: "RadioGroup.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `orientation`, `disabled`, and `required` to define group semantics.",
      },
      {
        name: "RadioGroup.Item",
        description:
          "Each item needs a unique `value`; `disabled` removes it from selection without changing the rest of the group.",
      },
      {
        name: "RadioGroup.Indicator",
        description:
          "Use `forceMount` if your indicator visuals need to stay mounted across state transitions.",
      },
    ],
    compositionPatterns: [
      {
        title: "Settings mode selection",
        description:
          "Use radios when the user should compare 2-5 modes directly without opening a list.",
      },
      {
        title: "Inline option matrices",
        description:
          "Combine group orientation and custom item visuals to produce pill, tile, or row-style selectors.",
      },
    ],
    cautions: [
      "Use `Select` instead when the option set is long enough that always-visible choices would overwhelm the layout.",
      'The package is single-value by design; use `Checkbox` or `ToggleGroup type="multiple"` for multi-select behavior.',
    ],
    related: [
      { label: "Select", href: "/components/select/" },
      { label: "Toggle Group", href: "/components/toggle-group/" },
      { label: "Checkbox", href: "/components/checkbox/" },
    ],
  },
  "scroll-area": {
    installName: "scroll-area",
    npm: "@lattice-ui/scroll-area",
    whatItIsFor: [
      "Use `ScrollArea` when you want custom scrollbars and thumbs around a Roblox `ScrollingFrame` viewport.",
      "It is useful when native scroll visuals do not match the product language but native scrolling behavior should remain intact.",
    ],
    exports: [
      "ScrollArea",
      "ScrollArea.Root",
      "ScrollArea.Viewport",
      "ScrollArea.Scrollbar",
      "ScrollArea.Thumb",
      "ScrollArea.Corner",
    ],
    stateModel: [
      "`ScrollArea.Root` tracks viewport metrics for both axes, scrollbar visibility policy, and recent scroll activity.",
      "`type` determines whether scrollbars are always visible, only visible while scrolling, or auto-shown based on overflow.",
      "Scrollbar and thumb primitives read the shared metrics; they do not maintain independent scroll position state.",
    ],
    keyApi: [
      {
        name: "ScrollArea.Root",
        description:
          "Use `type` and `scrollHideDelayMs` to define how visible and reactive the custom scrollbars should feel.",
      },
      {
        name: "ScrollArea.Viewport",
        description:
          "Bind this to the actual `ScrollingFrame` host so the package can observe canvas size and scroll position.",
      },
      {
        name: "ScrollArea.Scrollbar / Thumb",
        description:
          "Set `orientation` to wire each scrollbar and thumb to the correct axis.",
      },
    ],
    compositionPatterns: [
      {
        title: "Custom content panes",
        description:
          "Wrap a `ScrollingFrame` viewport with vertical and horizontal scrollbar primitives when the app needs a branded scroll treatment.",
      },
      {
        title: "Large settings or logs panels",
        description:
          "Use the auto visibility policy for dense content areas where permanent scrollbars would add noise.",
      },
    ],
    cautions: [
      "Thumb movement reflects shared viewport metrics, so the viewport host must be the authoritative scroll owner.",
      "This package customizes the chrome around scrolling; it does not replace Roblox scrolling behavior or content virtualization.",
    ],
    related: [
      { label: "System", href: "/components/system/" },
      { label: "Style", href: "/components/style/" },
      { label: "Tabs", href: "/components/tabs/" },
    ],
  },
  select: {
    installName: "select",
    npm: "@lattice-ui/select",
    whatItIsFor: [
      "Use `Select` when the UI needs a compact single-choice picker with caller-owned trigger, value display, and overlay visuals.",
      "It works well when options should open into a managed list but the user should not type freeform search text.",
    ],
    exports: [
      "Select",
      "Select.Root",
      "Select.Trigger",
      "Select.Value",
      "Select.Portal",
      "Select.Content",
      "Select.Item",
      "Select.Group",
      "Select.Label",
      "Select.Separator",
    ],
    stateModel: [
      "`Select.Root` manages controlled or uncontrolled `value` and `open` state.",
      "Items register in the root context, and the selected value resolves back to item text for `Select.Value` display.",
      "If the current value no longer points at an enabled item, the root falls back to the first enabled registered item.",
    ],
    keyApi: [
      {
        name: "Select.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, and `onOpenChange` to connect the picker to app state.",
      },
      {
        name: "Select.Value",
        description:
          "Use `placeholder` when the control should show an explicit empty-state label before a value is chosen.",
      },
      {
        name: "Select.Content",
        description:
          "Use `placement`, `offset`, `padding`, and outside-interaction hooks for overlay geometry and dismissal.",
      },
      {
        name: "Select.Item",
        description:
          "Every item needs a stable `value`; use `textValue` when the rendered child text is not the same as the semantic value label.",
      },
    ],
    compositionPatterns: [
      {
        title: "Labeled trigger + portal content",
        description:
          "Render the field shell in the trigger, then mount content in a portal so placement and dismissal stay reliable.",
      },
      {
        title: "Small enumerated settings",
        description:
          "Use `Select` when the option set is longer than a radio group but still small enough to browse without search.",
      },
    ],
    cautions: [
      "Current public behavior is single-value only; use `Combobox`, `Checkbox`, or `ToggleGroup` when the selection model is different.",
      "Overlay behavior is portal-based, so set up `PortalProvider` near the app root for predictable mounting and stacking.",
    ],
    related: [
      { label: "Combobox", href: "/components/combobox/" },
      { label: "Menu", href: "/components/menu/" },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  slider: {
    installName: "slider",
    npm: "@lattice-ui/slider",
    whatItIsFor: [
      "Use `Slider` for bounded numeric input when dragging or key-based adjustment is more natural than typing a raw number.",
      "It is a headless primitive for one-dimensional range selection rather than a styled media scrubber.",
    ],
    exports: [
      "Slider",
      "Slider.Root",
      "Slider.Track",
      "Slider.Range",
      "Slider.Thumb",
    ],
    stateModel: [
      "`Slider.Root` manages controlled or uncontrolled numeric `value` plus a separate commit callback for final confirmation.",
      "`min`, `max`, `step`, `orientation`, and `disabled` define how movement maps to values.",
      "Track and thumb hosts are registered into shared slider state so drag calculations know which geometry to use.",
    ],
    keyApi: [
      {
        name: "Slider.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `onValueCommit`, `min`, `max`, `step`, and `orientation` to define the numeric model.",
      },
      {
        name: "Slider.Track",
        description:
          "Bind your main drag surface here so the slider can translate pointer position into values.",
      },
      {
        name: "Slider.Range / Slider.Thumb",
        description:
          "Use these for the filled segment and the draggable handle without reimplementing range math.",
      },
    ],
    compositionPatterns: [
      {
        title: "Audio or gameplay settings",
        description:
          "Use a horizontal slider with a separate numeric label when the user benefits from both direct manipulation and explicit value feedback.",
      },
      {
        title: "Vertical scrubbing surfaces",
        description:
          'Use `orientation="vertical"` for compact inspector-style controls or side-mounted adjustment strips.',
      },
    ],
    cautions: [
      "The current public package is single-thumb only; it is not a dual-handle range selector.",
      "Values are clamped and stepped by the package, so do not depend on raw pointer positions as authoritative state.",
    ],
    related: [
      { label: "Progress", href: "/components/progress/" },
      { label: "Text Field", href: "/components/text-field/" },
      { label: "System", href: "/components/system/" },
    ],
  },
  style: {
    installName: "style",
    npm: "@lattice-ui/style",
    whatItIsFor: [
      "Use `@lattice-ui/style` as the default baseline for product UI styling in Lattice UI apps.",
      "It provides theme tokens, primitive text/box helpers, `sx` composition, and reusable recipes without dictating app structure.",
    ],
    exports: [
      "Box",
      "Text",
      "ThemeProvider",
      "useTheme",
      "useThemeValue",
      "createTheme",
      "defaultDarkTheme",
      "defaultLightTheme",
      "createRecipe",
      "mergeGuiProps",
      "mergeSx",
      "resolveSx",
    ],
    stateModel: [
      "`ThemeProvider` owns the current theme object and exposes it through `useTheme` and `useThemeValue`.",
      "`createRecipe` and `mergeSx` are pure style composition tools; they do not create runtime state on their own.",
      "Theme tokens cover colors, spacing, radius, and typography, and other packages read from that theme model rather than duplicating scales.",
    ],
    keyApi: [
      {
        name: "ThemeProvider",
        description:
          "Use `theme`, `defaultTheme`, and `onThemeChange` when your app needs controlled or uncontrolled theme ownership.",
      },
      {
        name: "createRecipe",
        description:
          "Use recipes to centralize visual variants instead of scattering conditional prop objects across your UI.",
      },
      {
        name: "mergeGuiProps",
        description:
          "Use this to layer base, variant, and caller overrides while composing `Event` and `Change` handlers instead of replacing them.",
      },
      {
        name: "Box / Text",
        description:
          "Use primitives for token-driven structure and typography without reaching directly for raw Roblox hosts everywhere.",
      },
    ],
    compositionPatterns: [
      {
        title: "Theme-backed product surfaces",
        description:
          "Define recipes once, then apply them across buttons, panels, and labels so visual language stays coherent.",
      },
      {
        title: "Custom component skins",
        description:
          "Pair `useTheme` with headless packages like `TextField` or `Select` so semantics and visuals stay decoupled.",
      },
    ],
    cautions: [
      "`style` handles visual language, not app-level layout or density orchestration; use `system` for that layer.",
      "If you bypass tokens with one-off values everywhere, the package stops paying for itself quickly.",
    ],
    related: [
      { label: "System", href: "/components/system/" },
      {
        label: "Design with Style + System",
        href: "/getting-started/design-with-style-system/",
      },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  switch: {
    installName: "switch",
    npm: "@lattice-ui/switch",
    whatItIsFor: [
      "Use `Switch` for immediate on/off settings where the control communicates a binary system state rather than membership in a list.",
      "It is the simplest boolean primitive in the library and works well for preferences panels and toggles.",
    ],
    exports: ["Switch", "Switch.Root", "Switch.Thumb"],
    stateModel: [
      "`Switch.Root` tracks a boolean `checked` state with controlled and uncontrolled entry points.",
      "`disabled` is enforced at the root, and `Switch.Thumb` reads that shared state rather than maintaining any local state.",
      "There is no indeterminate or mixed state in this package.",
    ],
    keyApi: [
      {
        name: "Switch.Root",
        description:
          "Use `checked`, `defaultChecked`, `onCheckedChange`, and `disabled` to connect the control to your settings model.",
      },
      {
        name: "Switch.Root asChild",
        description:
          "Use `asChild` when you already have a visual host and only need switch semantics attached to it.",
      },
      {
        name: "Switch.Thumb",
        description:
          "Render the moving or highlighted interior affordance as a separate piece without re-implementing checked-state wiring.",
      },
    ],
    compositionPatterns: [
      {
        title: "Preference toggles",
        description:
          "Combine a switch with nearby helper text when a setting should apply immediately and remain visually compact.",
      },
      {
        title: "Custom host surfaces",
        description:
          "Use `asChild` for pill, card, or toolbar-based visuals that still need the same binary state semantics.",
      },
    ],
    cautions: [
      "Use `Checkbox` instead when the control represents selection or needs an `indeterminate` state.",
      "The package provides state semantics, not motion or skin; you still own the track and thumb visuals.",
    ],
    related: [
      { label: "Checkbox", href: "/components/checkbox/" },
      { label: "Toggle Group", href: "/components/toggle-group/" },
      { label: "Text Field", href: "/components/text-field/" },
    ],
  },
  system: {
    installName: "system",
    npm: "@lattice-ui/system",
    whatItIsFor: [
      "Use `@lattice-ui/system` for app-level UI context, density-aware theme resolution, and layout primitives like `Stack`, `Row`, `Grid`, and `Surface`.",
      "It is the structural companion to `style`: `style` defines the visual language, while `system` applies that language across screens and layouts.",
    ],
    exports: [
      "SystemProvider",
      "useSystemTheme",
      "DensityProvider",
      "useDensity",
      "applyDensity",
      "Stack",
      "Row",
      "Grid",
      "Surface",
      "surface",
    ],
    stateModel: [
      "`SystemProvider` owns two coordinated values: the raw `baseTheme` and the current density token.",
      "`useSystemTheme` exposes the density-resolved `theme` for reading, plus setters for `baseTheme` and `density`.",
      "Layout primitives are stateless views over spacing and layout rules; they read theme and density context but do not create their own global model.",
    ],
    keyApi: [
      {
        name: "SystemProvider",
        description:
          "Use `theme`, `defaultTheme`, `density`, and their change callbacks when the app root should own global UI context.",
      },
      {
        name: "useSystemTheme",
        description:
          "Read the resolved theme and update `setBaseTheme` or `setDensity` when runtime appearance should react to user choice or screen context.",
      },
      {
        name: "Stack / Row / Grid",
        description:
          "Use these primitives for token-aware layout instead of hand-authoring repetitive padding, gap, and auto-size wiring.",
      },
      {
        name: "Surface / surface",
        description:
          "Use `Surface` for decorated containers and `surface()` when you only need host props for a given tone.",
      },
    ],
    compositionPatterns: [
      {
        title: "App root scaffolding",
        description:
          "Wrap the top-level UI in `SystemProvider`, then build screens with `Stack`, `Row`, `Grid`, and `Surface` so density changes propagate cleanly.",
      },
      {
        title: "Adaptive settings panels",
        description:
          "Use `useSystemTheme` to switch theme or density in response to player settings without bypassing the shared UI model.",
      },
    ],
    cautions: [
      "`system` assumes you want one coherent app-wide UI context; if you skip the provider, density-aware behavior and theme coordination disappear.",
      "Density is intentionally constrained to `compact`, `comfortable`, and `spacious` rather than an open-ended arbitrary scale.",
    ],
    related: [
      { label: "Style", href: "/components/style/" },
      {
        label: "Design with Style + System",
        href: "/getting-started/design-with-style-system/",
      },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  tabs: {
    installName: "tabs",
    npm: "@lattice-ui/tabs",
    whatItIsFor: [
      "Use `Tabs` when the screen should switch between sibling panels without leaving the current route or layout.",
      "It is a good fit for profile pages, settings surfaces, and inspector UIs where the current section should stay explicit.",
    ],
    exports: ["Tabs", "Tabs.Root", "Tabs.List", "Tabs.Trigger", "Tabs.Content"],
    stateModel: [
      "`Tabs.Root` manages a single selected `value` with controlled or uncontrolled ownership.",
      "Triggers register with orientation-aware ordering so selection movement can advance through enabled items.",
      "`Tabs.Content` can stay mounted with `forceMount` even when its tab is not the active value.",
    ],
    keyApi: [
      {
        name: "Tabs.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, and `orientation` to define the navigation model.",
      },
      {
        name: "Tabs.Trigger",
        description:
          "Each trigger needs a stable `value`; `disabled` removes it from activation and directional movement.",
      },
      {
        name: "Tabs.Content",
        description:
          "Use `forceMount` when inactive content still needs measurement, retained state, or custom animation handling.",
      },
    ],
    compositionPatterns: [
      {
        title: "Screen subsections",
        description:
          "Use tabs when the user needs to move between a few related panels while keeping the container layout constant.",
      },
      {
        title: "Inspector sidebars",
        description:
          'Use `orientation="vertical"` when the trigger list should behave more like a navigation rail than a top bar.',
      },
    ],
    cautions: [
      "Current behavior activates tabs immediately when selection moves; there is no separate manual activation mode.",
      "Tabs solve disclosure and selection, not overlaying or lazy positioning; reach for `Accordion` or `Dialog` when the UI contract is different.",
    ],
    related: [
      { label: "Accordion", href: "/components/accordion/" },
      { label: "Focus", href: "/components/focus/" },
      { label: "Scroll Area", href: "/components/scroll-area/" },
    ],
  },
  "text-field": {
    installName: "text-field",
    npm: "@lattice-ui/text-field",
    whatItIsFor: [
      "Use `TextField` for single-line text entry with label, description, validation message, and commit hooks that stay in one compound tree.",
      "It is the right default when you want field semantics without adopting a pre-skinned input component.",
    ],
    exports: [
      "TextField",
      "TextField.Root",
      "TextField.Input",
      "TextField.Label",
      "TextField.Description",
      "TextField.Message",
    ],
    stateModel: [
      "`TextField.Root` manages the current string value plus `disabled`, `readOnly`, `required`, and `invalid` flags.",
      "The package supports controlled and uncontrolled value ownership through `value` or `defaultValue`.",
      "`onValueChange` fires on text edits, while `onValueCommit` fires on commit moments such as focus loss or enter-like confirmation.",
    ],
    keyApi: [
      {
        name: "TextField.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `onValueCommit`, `disabled`, `readOnly`, `required`, and `invalid` to connect the field to app state.",
      },
      {
        name: "TextField.Input",
        description:
          "Use `asChild` when the host should be your own `TextBox`; root-level disabled and read-only rules still flow through.",
      },
      {
        name: "TextField.Label / Description / Message",
        description:
          "Use the companion parts to keep accessibility and field messaging close to the same shared state source.",
      },
    ],
    compositionPatterns: [
      {
        title: "Labeled validated fields",
        description:
          "Keep label, input, helper text, and validation message inside one `TextField.Root` so invalid and read-only state stay coordinated.",
      },
      {
        title: "Commit-aware settings",
        description:
          "Use `onValueCommit` when the app should treat typing and committed saves differently.",
      },
    ],
    cautions: [
      "Commit callbacks are separate from live change callbacks; do not expect `onValueCommit` to fire on every keystroke.",
      "Use `Textarea` instead when multi-line input or automatic height growth is part of the field contract.",
    ],
    related: [
      { label: "Textarea", href: "/components/textarea/" },
      { label: "Select", href: "/components/select/" },
      {
        label: "Build a Settings Dialog",
        href: "/getting-started/build-a-settings-dialog/",
      },
    ],
  },
  textarea: {
    installName: "textarea",
    npm: "@lattice-ui/textarea",
    whatItIsFor: [
      "Use `Textarea` for multi-line text entry when the field should support the same labeled-field semantics as `TextField` but with optional automatic resizing.",
      "It works well for notes, descriptions, and admin surfaces that need larger freeform input.",
    ],
    exports: [
      "Textarea",
      "Textarea.Root",
      "Textarea.Input",
      "Textarea.Label",
      "Textarea.Description",
      "Textarea.Message",
    ],
    stateModel: [
      "`Textarea.Root` shares the same controlled/uncontrolled value model as `TextField`, with additional `autoResize`, `minRows`, and `maxRows` state.",
      "`autoResize` defaults to `true`, and row constraints are normalized so `minRows` is at least one and `maxRows` never falls below it.",
      "`onValueCommit` remains distinct from live text changes, and disabled/read-only roots reject writes.",
    ],
    keyApi: [
      {
        name: "Textarea.Root",
        description:
          "Use `value`, `defaultValue`, `onValueChange`, `onValueCommit`, `autoResize`, `minRows`, and `maxRows` to define the field model.",
      },
      {
        name: "Textarea.Input",
        description:
          "Use `lineHeight` with `asChild` when your visual host needs explicit row-height control.",
      },
      {
        name: "Textarea.Label / Description / Message",
        description:
          "Use the same companion parts as `TextField` to keep field messaging aligned with the current state.",
      },
    ],
    compositionPatterns: [
      {
        title: "Auto-growing notes fields",
        description:
          "Leave `autoResize` enabled when the field should expand naturally with content up to a defined row ceiling.",
      },
      {
        title: "Structured long-form settings",
        description:
          "Combine a textarea with helper and validation text when the app needs multi-line input but still wants the same field-shell contract as `TextField`.",
      },
    ],
    cautions: [
      "`autoResize` is on by default, so opt out explicitly if the layout depends on fixed input height.",
      "Use `TextField` instead when the input must stay single-line and commit semantics matter more than row growth.",
    ],
    related: [
      { label: "Text Field", href: "/components/text-field/" },
      { label: "Scroll Area", href: "/components/scroll-area/" },
      { label: "Style", href: "/components/style/" },
    ],
  },
  toast: {
    installName: "toast",
    npm: "@lattice-ui/toast",
    whatItIsFor: [
      "Use `Toast` for transient feedback that should queue, stack, and dismiss automatically without interrupting the main interaction flow.",
      "It is appropriate for saved-state messages, undo affordances, and background task completion notices.",
    ],
    exports: [
      "Toast",
      "Toast.Provider",
      "Toast.Viewport",
      "Toast.Root",
      "Toast.Title",
      "Toast.Description",
      "Toast.Action",
      "Toast.Close",
      "useToast",
    ],
    stateModel: [
      "`Toast.Provider` owns the full toast queue, the visible subset, the default duration, and the maximum visible count.",
      "`useToast()` exposes the imperative queue API so any component in the provider tree can enqueue and clear toasts.",
      "`Toast.Root` is presentation-oriented; queue lifecycle and timing live at the provider layer.",
    ],
    keyApi: [
      {
        name: "Toast.Provider",
        description:
          "Use `defaultDurationMs` and `maxVisible` to define queue pacing and stacking behavior for the whole app.",
      },
      {
        name: "useToast",
        description:
          "Call `enqueue`, `remove`, and `clear` from application code without manually threading toast state everywhere.",
      },
      {
        name: "Toast.Viewport",
        description:
          "Mount the viewport once where toast surfaces should render and stack.",
      },
      {
        name: "Toast.Action / Toast.Close",
        description:
          "Use these parts for explicit user actions and dismiss controls inside the toast surface.",
      },
    ],
    compositionPatterns: [
      {
        title: "Global save feedback",
        description:
          "Mount one provider and viewport high in the tree, then enqueue short descriptive toasts from feature code.",
      },
      {
        title: "Undoable actions",
        description:
          "Use `Toast.Action` when the toast should offer one meaningful follow-up action without becoming a full dialog.",
      },
    ],
    cautions: [
      "A provider without a mounted viewport can still manage queue state, but nothing will render visibly.",
      "Toasts are intentionally transient; use `Dialog` or inline validation when the user must acknowledge or resolve something before proceeding.",
    ],
    related: [
      { label: "Dialog", href: "/components/dialog/" },
      { label: "Progress", href: "/components/progress/" },
      { label: "Layer", href: "/components/layer/" },
    ],
  },
  "toggle-group": {
    installName: "toggle-group",
    npm: "@lattice-ui/toggle-group",
    whatItIsFor: [
      "Use `ToggleGroup` for pill bars, formatting controls, and compact segmented selectors where buttons should show pressed state.",
      "It bridges the gap between a lone `Switch` and a full `RadioGroup`, with both single and multiple selection modes.",
    ],
    exports: ["ToggleGroup", "ToggleGroup.Root", "ToggleGroup.Item"],
    stateModel: [
      "`ToggleGroup.Root` switches between `single` and `multiple` selection models through the required `type` prop.",
      "The value shape follows that selection model: a string or undefined for `single`, an array for `multiple`.",
      "Pressed state is computed centrally, and both group-level and item-level disabled flags participate in interaction rules.",
    ],
    keyApi: [
      {
        name: "ToggleGroup.Root",
        description:
          "Use `type`, `value`, `defaultValue`, and `onValueChange` to define whether the group behaves like a segmented selector or a pressed-state toolbar.",
      },
      {
        name: "ToggleGroup.Item",
        description:
          "Each item needs a stable `value`; `disabled` removes it from toggling without changing the rest of the group.",
      },
    ],
    compositionPatterns: [
      {
        title: "Single-choice segmented controls",
        description:
          'Use `type="single"` when the control should feel like a compact alternative to radio buttons.',
      },
      {
        title: "Pressed formatting toolbars",
        description:
          'Use `type="multiple"` when several pressed states may be active at once, such as bold/italic/underline controls.',
      },
    ],
    cautions: [
      "The controlled value shape changes with `type`, so avoid sharing one state variable between single and multiple groups without normalizing it first.",
      "Use `RadioGroup` when the options should stay visible but read more like a classic form control than a pressed button bar.",
    ],
    related: [
      { label: "Radio Group", href: "/components/radio-group/" },
      { label: "Switch", href: "/components/switch/" },
      { label: "Tabs", href: "/components/tabs/" },
    ],
  },
  tooltip: {
    installName: "tooltip",
    npm: "@lattice-ui/tooltip",
    whatItIsFor: [
      "Use `Tooltip` for short contextual hints that appear on hover or selection focus without interrupting the surrounding workflow.",
      "It is best for explaining nearby UI affordances, not for delivering required instructions or deep interaction flows.",
    ],
    exports: [
      "Tooltip",
      "Tooltip.Provider",
      "Tooltip.Root",
      "Tooltip.Trigger",
      "Tooltip.Portal",
      "Tooltip.Content",
    ],
    stateModel: [
      "`Tooltip.Provider` tracks open-delay policy with `delayDuration` and `skipDelayDuration` across multiple tooltips.",
      "`Tooltip.Root` can be controlled or uncontrolled and keeps refs for both the trigger and the positioned content.",
      "Tooltip activity can come from hover or focus/selection, and the provider decides whether the next tooltip should open with a shorter skip delay.",
    ],
    keyApi: [
      {
        name: "Tooltip.Provider",
        description:
          "Use provider-level delay settings when multiple tooltips in one region should feel consistent and benefit from skip-delay behavior.",
      },
      {
        name: "Tooltip.Root",
        description:
          "Use `open`, `defaultOpen`, `delayDuration`, and `onOpenChange` when one tooltip needs explicit state ownership.",
      },
      {
        name: "Tooltip.Content",
        description:
          "Use `placement`, `offset`, `padding`, and outside-interaction hooks to position the hint surface without rebuilding overlay math.",
      },
    ],
    compositionPatterns: [
      {
        title: "Dense control hints",
        description:
          "Wrap icon-only or compact controls with tooltips when nearby text would create too much layout noise.",
      },
      {
        title: "Shared timing regions",
        description:
          "Use one provider around a toolbar or command strip so moving between nearby controls feels responsive instead of repeatedly delayed.",
      },
    ],
    cautions: [
      "Tooltips should stay short and supplemental; do not hide required instructions or destructive confirmations inside them.",
      "Like other anchored overlays, tooltips benefit from a shared `PortalProvider` for predictable mounting and stacking.",
    ],
    related: [
      { label: "Popover", href: "/components/popover/" },
      { label: "Layer", href: "/components/layer/" },
      { label: "Popper", href: "/components/popper/" },
    ],
  },
};
