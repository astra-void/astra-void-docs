/**
 * Every utility class Vela compiles, as data.
 *
 * The utility reference used to carry these 200 rows as hand-written Markdown
 * tables, which meant the cheat sheet would have been a second copy of the same
 * facts drifting away from the first. One list, three readers:
 *
 * - `<UtilityTable family="…" />` renders a group inline in the reference page,
 *   keeping the prose that explains it.
 * - The cheat sheet renders all of them at once, filterable.
 * - mdx-to-markdown.ts renders the group back to a Markdown table for the `.md`
 *   and llms.txt endpoints.
 *
 * Cells are authored in a deliberately small subset of Markdown — `code` and
 * **bold**, nothing else — because three renderers have to agree on it. See
 * `renderUtilityCell` in UtilityTable.astro.
 *
 * Nothing here is derived from the compiler: it is a transcription of what the
 * reference page states at 0.12.2, and a release that changes a mapping has to
 * change this file.
 */

/** Broad buckets the cheat sheet groups by. The reference page has no such layer. */
export const UTILITY_CATEGORIES = [
  "Color",
  "Spacing",
  "Sizing",
  "Layout",
  "Flexbox & grid",
  "Typography",
  "Borders & effects",
  "Transforms & motion",
  "Interactivity",
  "Variants",
] as const

export type UtilityCategory = (typeof UTILITY_CATEGORIES)[number]

export type UtilityRow = {
  /** Class patterns exactly as they are written in a class list. */
  classes: string[]
  /** Accepted payloads. Absent for a class that takes none. */
  values?: string
  /** The Roblox property, helper instance, or effect the class lowers to. */
  target: string
  notes?: string
  /**
   * Builds a wrapper, a separator, or a loop, so the element moves onto the
   * runtime path even when its `className` is a plain string literal.
   */
  runtime?: boolean
}

export type UtilityGroup = {
  /** Matches the heading slug of the same section in the reference page. */
  id: string
  label: string
  category: UtilityCategory
  /** One line of orientation for the cheat sheet, which has no prose. */
  summary: string
  /** A few families lower to an effect rather than to a named property. */
  targetLabel?: string
  /** Variants are prefixes, not classes, so they head their column differently. */
  classLabel?: string
  rows: UtilityRow[]
}

export const VELA_UTILITY_GROUPS: UtilityGroup[] = [
  {
    id: "color",
    label: "Color",
    category: "Color",
    summary:
      "A theme color key or an arbitrary `[#hex]`, plus an optional `/N` opacity modifier that lowers to whichever transparency channel the family owns.",
    rows: [
      {
        classes: ["bg-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`BackgroundColor3` + `BackgroundTransparency`",
      },
      {
        classes: ["text-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`TextColor3` + `TextTransparency`",
        notes: "Fallback branch of `text-*`",
      },
      {
        classes: ["image-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`ImageColor3` + `ImageTransparency`",
      },
      {
        classes: ["placeholder-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`PlaceholderColor3`",
        notes: "No transparency channel",
      },
      {
        classes: ["border-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIStroke.Color` + `UIStroke.Transparency`",
        notes: "Helper instance",
      },
      {
        classes: ["ring-{color}", "outline-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIStroke.Color` + `UIStroke.Transparency`",
        notes: "Same `UIStroke` as `border-*`",
      },
      {
        classes: ["shadow-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIShadow.Color`",
        notes: "Helper instance",
      },
      {
        classes: ["divide-{color}"],
        values: "theme color key, `[#hex]`",
        target: "separator `BackgroundColor3` + `BackgroundTransparency`",
        runtime: true,
      },
      {
        classes: ["from-{color}", "via-{color}", "to-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIGradient.Color` keypoints + `UIGradient.Transparency`",
        notes: "Helper instance",
      },
    ],
  },
  {
    id: "border-ring-and-outline",
    label: "Border, ring, and outline",
    category: "Borders & effects",
    summary:
      "All three families write into a single shared `UIStroke` helper instance, so they do not stack — on a collision the later token wins.",
    rows: [
      {
        classes: ["border"],
        target: "`UIStroke.Thickness = 1`",
        notes: "Bare form",
      },
      {
        classes: ["border-{n}"],
        values: "`0`, `1`, `2`, `4`",
        target: "`UIStroke.Thickness`",
        notes: "No other numbers; use `border-[3px]`",
      },
      {
        classes: ["border-transparent"],
        target: "`UIStroke.Transparency = 1`",
      },
      {
        classes: ["border-{join}"],
        values: "`round`, `bevel`, `miter`",
        target: "`UIStroke.LineJoinMode`",
      },
      {
        classes: ["border-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIStroke.Color`, `Transparency = 0`",
      },
      {
        classes: ["ring"],
        target: "`UIStroke.Thickness = 3`",
        notes: "Also sets `ApplyStrokeMode = Border`",
      },
      {
        classes: ["ring-{n}"],
        values: "`0`, `1`, `2`, `4`, `8`",
        target: "`UIStroke.Thickness`",
      },
      {
        classes: ["outline"],
        target: "`UIStroke.Thickness = 2`",
        notes: "Also sets `ApplyStrokeMode = Border`",
      },
      {
        classes: ["outline-none", "outline-hidden"],
        target: "`UIStroke.Thickness = 0`",
      },
      {
        classes: ["border-[{n}]", "ring-[{n}]", "outline-[{n}]"],
        values: "pixels, with or without the unit",
        target: "`UIStroke.Thickness`",
        notes: "Arbitrary value, since 0.7.0. A bracket is read as a color first",
      },
    ],
  },
  {
    id: "radius",
    label: "Radius",
    category: "Borders & effects",
    summary:
      "A pure lookup in `theme.radius` — there is no numeric fallback, so a value off the scale has to be bracketed.",
    rows: [
      {
        classes: ["rounded"],
        target: "`UICorner.CornerRadius`",
        notes: "The theme's `DEFAULT` radius, 4px by default",
      },
      {
        classes: ["rounded-{key}"],
        values: "any key in `theme.radius`",
        target: "`UICorner.CornerRadius`",
        notes: "Pure theme lookup",
      },
      {
        classes: ["rounded-[{n}]"],
        values: "pixels, percent",
        target: "`UICorner.CornerRadius`",
        notes: "Arbitrary value, since 0.7.0",
      },
    ],
  },
  {
    id: "shadow",
    label: "Shadow",
    category: "Borders & effects",
    summary:
      "Six presets on a `UIShadow` helper instance, each a fixed blur / offset / spread / transparency.",
    rows: [
      {
        classes: ["shadow"],
        target: "`UIShadow` preset",
        notes: "blur 3, offset Y 1, spread 0, transparency `0.9`",
      },
      {
        classes: ["shadow-sm"],
        target: "`UIShadow` preset",
        notes: "2 / 1 / 0 / `0.95`",
      },
      {
        classes: ["shadow-md"],
        target: "`UIShadow` preset",
        notes: "6 / 4 / −1 / `0.9`",
      },
      {
        classes: ["shadow-lg"],
        target: "`UIShadow` preset",
        notes: "15 / 10 / −3 / `0.9`",
      },
      {
        classes: ["shadow-xl"],
        target: "`UIShadow` preset",
        notes: "25 / 20 / −5 / `0.9`",
      },
      {
        classes: ["shadow-2xl"],
        target: "`UIShadow` preset",
        notes: "50 / 25 / −12 / `0.75`",
      },
      { classes: ["shadow-none"], target: "`UIShadow.Enabled = false`" },
      {
        classes: ["shadow-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIShadow.Color`",
        notes: "`shadow-transparent` instead sets `Transparency = 1`",
      },
      {
        classes: ["shadow-inner"],
        target: "—",
        notes: "`unsupported-shadow-inset`",
      },
    ],
  },
  {
    id: "gradient",
    label: "Gradient",
    category: "Color",
    summary:
      "Stops flush into a `ColorSequence` on a `UIGradient` helper, and the element's `BackgroundColor3` is forced to white so the gradient is not tinted.",
    rows: [
      {
        classes: ["bg-gradient-to-{dir}"],
        values: "`t`, `tr`, `r`, `br`, `b`, `bl`, `l`, `tl`",
        target: "`UIGradient.Rotation`",
        notes: "Rotations 270, 315, 0, 45, 90, 135, 180, 225",
      },
      {
        classes: ["bg-linear-to-{dir}"],
        values: "same",
        target: "same",
        notes: "Accepted alias",
      },
      {
        classes: ["from-{color}", "via-{color}", "to-{color}"],
        values: "theme color key, `[#hex]`",
        target: "`UIGradient.Color`",
      },
    ],
  },
  {
    id: "z-index",
    label: "Z-index",
    category: "Layout",
    summary:
      "Six presets, and a bracket for everything they do not cover. There is no `z-auto` and no negative form.",
    rows: [
      {
        classes: ["z-{n}"],
        values: "`0`, `10`, `20`, `30`, `40`, `50`",
        target: "`ZIndex`",
        notes: "Exactly these six",
      },
      {
        classes: ["z-[{n}]"],
        values: "any non-negative integer",
        target: "`ZIndex`",
        notes: "Arbitrary value, since 0.7.0",
      },
    ],
  },
  {
    id: "padding",
    label: "Padding",
    category: "Spacing",
    summary:
      "All of it writes into a single `UIPadding` helper instance, so `p-4 px-8` produces one instance and not two.",
    rows: [
      {
        classes: ["p-{key}"],
        values: "spacing value",
        target: "`PaddingTop`, `PaddingRight`, `PaddingBottom`, `PaddingLeft`",
      },
      {
        classes: ["px-{key}"],
        values: "spacing value",
        target: "`PaddingLeft`, `PaddingRight`",
      },
      {
        classes: ["py-{key}"],
        values: "spacing value",
        target: "`PaddingTop`, `PaddingBottom`",
      },
      { classes: ["pt-{key}"], values: "spacing value", target: "`PaddingTop`" },
      {
        classes: ["pr-{key}"],
        values: "spacing value",
        target: "`PaddingRight`",
      },
      {
        classes: ["pb-{key}"],
        values: "spacing value",
        target: "`PaddingBottom`",
      },
      {
        classes: ["pl-{key}"],
        values: "spacing value",
        target: "`PaddingLeft`",
      },
    ],
  },
  {
    id: "margin",
    label: "Margin",
    category: "Spacing",
    summary:
      "Roblox has no margin box, so a positive margin is a transparent wrapper frame — which is why the whole family is runtime-structural. `gap-*` on the parent is the cheaper answer.",
    targetLabel: "Effect",
    rows: [
      {
        classes: ["m-{key}"],
        values: "spacing value",
        target: "margin box, all four sides",
        runtime: true,
      },
      {
        classes: ["mx-{key}", "my-{key}"],
        values: "spacing value",
        target: "margin box, one axis",
        runtime: true,
      },
      {
        classes: ["mt-{key}", "mr-{key}", "mb-{key}", "ml-{key}"],
        values: "spacing value",
        target: "margin box, one side",
        runtime: true,
      },
      {
        classes: ["-mt-{key}", "-ml-{key}"],
        values: "spacing value",
        target: "`Position` shift",
        notes: "Negative top/left margins move, not wrap",
      },
      {
        classes: ["-mr-{key}", "-mb-{key}"],
        target: "—",
        notes: "`unsupported-negative-margin`",
      },
      {
        classes: ["mx-auto"],
        target: "`AnchorPoint.X = 0.5`, `Position.X = 0.5` scale",
        notes: "**Static** — centers without a wrapper",
      },
      {
        classes: ["my-auto"],
        target: "`AnchorPoint.Y = 0.5`, `Position.Y = 0.5` scale",
        notes: "**Static**",
      },
    ],
  },
  {
    id: "gap-and-space",
    label: "Gap and space",
    category: "Spacing",
    summary:
      "`UIListLayout` has one padding axis, so there is no `gap-x-`/`gap-y-` — `space-x-*` and `space-y-*` are the same property with a fill direction attached.",
    rows: [
      {
        classes: ["gap-{key}"],
        values: "spacing value",
        target: "`UIListLayout.Padding`",
        notes: "No `gap-x-` or `gap-y-`",
      },
      {
        classes: ["space-x-{key}"],
        values: "spacing value",
        target: "`UIListLayout.Padding` + `FillDirection = Horizontal`",
      },
      {
        classes: ["space-y-{key}"],
        values: "spacing value",
        target: "`UIListLayout.Padding` + `FillDirection = Vertical`",
      },
    ],
  },
  {
    id: "divide",
    label: "Divide",
    category: "Spacing",
    summary:
      "Separator frames inserted between the content children. They are list items themselves, so the parent's `gap-*` applies on both sides of each one.",
    targetLabel: "Effect",
    rows: [
      {
        classes: ["divide-x", "divide-y"],
        target: "1px separators between children, horizontal / vertical",
        runtime: true,
      },
      {
        classes: ["divide-x-{n}", "divide-y-{n}"],
        values: "`0`, `1`, `2`, `4`, `8`",
        target: "separator thickness",
        runtime: true,
      },
      {
        classes: ["divide-{color}"],
        values: "theme color key, `[#hex]`",
        target: "separator `BackgroundColor3`",
        runtime: true,
      },
    ],
  },
  {
    id: "size",
    label: "Size",
    category: "Sizing",
    summary:
      "`w-` and `h-` merge into one `Size`, and the emitted form follows the values — offsets give `UDim2.fromOffset`, scales give `UDim2.fromScale`, a mix gives the full `UDim2`.",
    rows: [
      {
        classes: ["w-{value}"],
        values: "`px`, `full`, fractions, spacing offsets",
        target: "`Size` X component",
        notes: "Merges with `h-`",
      },
      {
        classes: ["h-{value}"],
        values: "`px`, `full`, fractions, spacing offsets",
        target: "`Size` Y component",
        notes: "Merges with `w-`",
      },
      {
        classes: ["size-{value}"],
        values: "`px`, `full`, fractions, spacing offsets",
        target: "both axes",
      },
      {
        classes: ["basis-{value}"],
        values: "`px`, `full`, fractions, spacing offsets",
        target: "`Size` X component",
        notes: "Effectively `w-*` regardless of fill direction",
      },
      {
        classes: ["w-auto", "w-fit"],
        target: "`AutomaticSize = Enum.AutomaticSize.X`",
      },
      {
        classes: ["h-auto", "h-fit"],
        target: "`AutomaticSize = Enum.AutomaticSize.Y`",
      },
      {
        classes: ["size-auto", "size-fit"],
        target: "`AutomaticSize = Enum.AutomaticSize.XY`",
        notes: "Also when both axes are set",
      },
    ],
  },
  {
    id: "constraints",
    label: "Constraints",
    category: "Sizing",
    summary:
      "Offset-only, on a `UISizeConstraint` helper. An axis you leave out defaults to `0` for `MinSize` and `math.huge` for `MaxSize`.",
    rows: [
      {
        classes: ["min-w-{key}"],
        values: "spacing offset",
        target: "`UISizeConstraint.MinSize` X",
      },
      {
        classes: ["min-h-{key}"],
        values: "spacing offset",
        target: "`UISizeConstraint.MinSize` Y",
      },
      {
        classes: ["max-w-{key}"],
        values: "spacing offset",
        target: "`UISizeConstraint.MaxSize` X",
      },
      {
        classes: ["max-h-{key}"],
        values: "spacing offset",
        target: "`UISizeConstraint.MaxSize` Y",
      },
    ],
  },
  {
    id: "position",
    label: "Position",
    category: "Layout",
    summary:
      "None of these take effect under a parent that has a `UIListLayout` — any `flex`, `gap-*`, or `space-*` on the parent owns child positions.",
    rows: [
      {
        classes: ["left-{value}"],
        values: "`px`, `full`, fractions, spacing offsets",
        target: "`Position` X",
      },
      {
        classes: ["top-{value}"],
        values: "same",
        target: "`Position` Y",
      },
      {
        classes: ["right-{value}"],
        values: "same",
        target: "`Position` X, from the far edge",
        notes: "`right-2` is `new UDim(1, -8)`",
      },
      {
        classes: ["bottom-{value}"],
        values: "same",
        target: "`Position` Y, from the far edge",
      },
      { classes: ["inset-{value}"], values: "same", target: "both axes" },
      {
        classes: ["-left-{value}", "-top-{value}", "-inset-{value}"],
        values: "same",
        target: "negated",
      },
    ],
  },
  {
    id: "anchor",
    label: "Anchor",
    category: "Layout",
    summary:
      "The nine `AnchorPoint` positions. Anything outside them is `unsupported-anchor-value`.",
    rows: [
      {
        classes: ["origin-{key}"],
        values:
          "`top-left`, `top`, `top-right`, `left`, `center`, `right`, `bottom-left`, `bottom`, `bottom-right`",
        target: "`AnchorPoint`",
        notes: "Emitted as `new Vector2(x, y)`",
      },
    ],
  },
  {
    id: "flex-layout",
    label: "Flex layout",
    category: "Flexbox & grid",
    summary:
      "A `UIListLayout` helper instance. `justify-*` and `items-*` name the Roblox layout's horizontal and vertical axes, not the flex main and cross axes — they do not swap under `flex-col`.",
    rows: [
      {
        classes: ["flex"],
        target: "`FillDirection = Enum.FillDirection.Horizontal`",
        notes: "Bare form. Every form also sets `SortOrder = LayoutOrder`",
      },
      {
        classes: ["flex-row"],
        target: "`FillDirection = Enum.FillDirection.Horizontal`",
      },
      {
        classes: ["flex-col"],
        target: "`FillDirection = Enum.FillDirection.Vertical`",
      },
      { classes: ["flex-wrap"], target: "`Wraps = true`" },
      { classes: ["flex-nowrap"], target: "`Wraps = false`" },
      {
        classes: ["justify-start", "justify-center", "justify-end"],
        target: "`HorizontalAlignment = Left, Center, Right`",
      },
      {
        classes: ["justify-between", "justify-around", "justify-evenly"],
        target:
          "`HorizontalFlex = Enum.UIFlexAlignment.SpaceBetween, SpaceAround, SpaceEvenly`",
        notes: "Different property",
      },
      {
        classes: ["items-start", "items-center", "items-end"],
        target: "`VerticalAlignment = Top, Center, Bottom`",
      },
      {
        classes: ["items-stretch"],
        target: "`VerticalFlex = Enum.UIFlexAlignment.Fill`",
        notes: "Different property",
      },
      {
        classes: ["content-{start,center,end}"],
        target: "`VerticalAlignment`",
      },
      {
        classes: ["content-{between,around,evenly,stretch}"],
        target: "`VerticalFlex`",
      },
    ],
  },
  {
    id: "flex-items",
    label: "Flex items",
    category: "Flexbox & grid",
    summary:
      "A `UIFlexItem` helper instance on the child. There is no `grow-{n}` and no `shrink-{n}`.",
    rows: [
      { classes: ["flex-1"], target: "`FlexMode = Enum.UIFlexMode.Fill`" },
      { classes: ["flex-auto"], target: "`FlexMode = Enum.UIFlexMode.Fill`" },
      {
        classes: ["flex-initial"],
        target: "`FlexMode = Enum.UIFlexMode.Shrink`",
      },
      { classes: ["flex-none"], target: "`FlexMode = Enum.UIFlexMode.None`" },
      { classes: ["grow"], target: "`FlexMode = Enum.UIFlexMode.Grow`" },
      { classes: ["grow-0"], target: "`FlexMode = Enum.UIFlexMode.None`" },
      { classes: ["shrink"], target: "`FlexMode = Enum.UIFlexMode.Shrink`" },
      { classes: ["shrink-0"], target: "`FlexMode = Enum.UIFlexMode.None`" },
      {
        classes: ["self-{auto,start,center,end,stretch}"],
        target: "`ItemLineAlignment`",
      },
    ],
  },
  {
    id: "grid",
    label: "Grid",
    category: "Flexbox & grid",
    summary:
      "`UIGridLayout` stamps `CellSize` onto every child, so the column count decides the track width. No spans, no templates.",
    rows: [
      {
        classes: ["grid"],
        target: "`UIGridLayout` child, `SortOrder = LayoutOrder`",
      },
      {
        classes: ["grid-cols-{n}"],
        values: "`1`–`12`",
        target: "`FillDirection = Horizontal`, `FillDirectionMaxCells = n`, `CellSize.X`",
      },
      {
        classes: ["grid-rows-{n}"],
        values: "`1`–`12`",
        target: "`FillDirection = Vertical`, `FillDirectionMaxCells = n`, `CellSize.Y`",
      },
      {
        classes: ["auto-rows-{n}"],
        values: "spacing scale, arbitrary",
        target: "`CellSize.Y`",
        notes: "Cross axis of `grid-cols-*`",
      },
      {
        classes: ["auto-cols-{n}"],
        values: "spacing scale, arbitrary",
        target: "`CellSize.X`",
        notes: "Cross axis of `grid-rows-*`",
      },
    ],
  },
  {
    id: "order",
    label: "Order",
    category: "Flexbox & grid",
    summary:
      "`LayoutOrder`, which only decides anything under a layout that sorts by it — Vela's own do, a layout instance you wrote keeps Roblox's default of sorting by name.",
    rows: [
      {
        classes: ["order-{n}", "-order-{n}"],
        values: "any integer",
        target: "`LayoutOrder`",
      },
      { classes: ["order-first"], target: "`LayoutOrder = -9999`" },
      { classes: ["order-last"], target: "`LayoutOrder = 9999`" },
      { classes: ["order-none"], target: "`LayoutOrder = 0`" },
    ],
  },
  {
    id: "aspect-ratio",
    label: "Aspect ratio",
    category: "Sizing",
    summary: "A `UIAspectRatioConstraint` helper instance.",
    rows: [
      {
        classes: ["aspect-square"],
        target: "`UIAspectRatioConstraint.AspectRatio = 1`",
      },
      { classes: ["aspect-video"], target: "`AspectRatio = 1.7777777778`" },
      {
        classes: ["aspect-[W/H]"],
        values: "positive finite numbers",
        target: "`AspectRatio`",
        notes: "Arbitrary value",
      },
      {
        classes: ["aspect-[N]"],
        values: "positive finite number",
        target: "`AspectRatio`",
        notes: "Arbitrary value",
      },
      {
        classes: ["aspect-auto"],
        target: "—",
        notes: "`unsupported-aspect-value`",
      },
    ],
  },
  {
    id: "transform",
    label: "Transform",
    category: "Transforms & motion",
    summary:
      "Fixed scales, no `scale-x-*`/`scale-y-*`. `translate-*` splits by value kind: a fraction lowers to `AnchorPoint`, a pixel value to the `Position` offset.",
    rows: [
      {
        classes: ["rotate-{deg}", "-rotate-{deg}"],
        values: "`0`, `1`, `2`, `3`, `6`, `12`, `45`, `90`, `180`",
        target: "`Rotation`",
        notes: "`-rotate-0` stays `0`",
      },
      {
        classes: ["scale-{n}"],
        values: "`0`, `50`, `75`, `90`, `95`, `100`, `105`, `110`, `125`, `150`",
        target: "`UIScale.Scale`",
        notes:
          "Maps to `0`, `0.5`, `0.75`, `0.9`, `0.95`, `1`, `1.05`, `1.1`, `1.25`, `1.5`",
      },
      {
        classes: ["translate-x-{v}", "translate-y-{v}"],
        values: "fractions or spacing values",
        target: "`AnchorPoint` or `Position`",
        notes: "A fraction anchors; a pixel value shifts",
      },
    ],
  },
  {
    id: "effects",
    label: "Effects",
    category: "Borders & effects",
    summary:
      "`opacity-*` is inverted from Roblox transparency, order-independent, and reaches the whole subtree — a `canvasgroup` ends the descent.",
    rows: [
      {
        classes: ["opacity-{n}"],
        values: "any integer `0`–`100`",
        target:
          "Every transparency channel the element paints, and the subtree under it",
        notes: "Inverted: `opacity-100` is fully opaque",
      },
      {
        classes: ["opacity-{n}"],
        values: "any integer `0`–`100`",
        target: "`GroupTransparency`, on a `canvasgroup`",
        notes: "One composited layer; the fade stops there",
      },
    ],
  },
  {
    id: "motion",
    label: "Motion",
    category: "Transforms & motion",
    summary:
      "Executed by `TweenService` in the runtime helper. A transition needs a property that actually changes — a variant rule or a dynamic `className` — or it is dropped.",
    targetLabel: "Effect",
    rows: [
      {
        classes: ["transition"],
        target: "Tween property changes caused by variant rules",
      },
      {
        classes: ["transition-all"],
        target: "Tween every property a rule changes",
      },
      {
        classes: ["transition-colors"],
        target: "Narrow the tween to the color properties",
      },
      {
        classes: ["transition-opacity"],
        target: "Narrow the tween to the transparency properties",
      },
      {
        classes: ["transition-transform"],
        target: "Narrow the tween to `Position`, `Rotation`, `UIScale`",
      },
      {
        classes: ["transition-shadow"],
        target: "—",
        notes: "`unsupported-transition-value` — helper instances apply instantly",
      },
      { classes: ["transition-none"], target: "Disable tweening" },
      {
        classes: ["duration-{n}"],
        values: "preset `75`–`1000`, or any integer ms",
        target: "Tween time, `n / 1000` seconds",
      },
      {
        classes: ["delay-{n}"],
        values: "preset `75`–`1000`, or any integer ms",
        target: "Tween delay",
      },
      {
        classes: ["ease-{linear,in,out,in-out}"],
        target: "`EasingStyle` / `EasingDirection`",
      },
      {
        classes: ["animate-{spin,pulse,bounce}"],
        target: "Preset looping animation",
        runtime: true,
      },
      { classes: ["animate-none"], target: "No animation" },
    ],
  },
  {
    id: "typography",
    label: "Typography",
    category: "Typography",
    summary:
      "Meaningful on `textlabel`, `textbutton`, and `textbox`. `font-*` is one prefix over three axes — weight, family, style — that merge into a single `FontFace`.",
    rows: [
      {
        classes: ["text-{size}"],
        values:
          "`xs` 12, `sm` 14, `base` 16, `lg` 18, `xl` 20, `2xl` 24, `3xl` 30, `4xl` 36, `5xl` 48, `6xl` 60, `7xl` 72, `8xl` 96, `9xl` 128",
        target: "`TextSize`",
        notes: "Pixel values shown",
      },
      {
        classes: ["font-{weight}"],
        values:
          "`thin`, `extralight`, `light`, `normal`, `medium`, `semibold`, `bold`, `extrabold`, `black`",
        target: "`FontFace` weight axis",
        notes: "`normal` is `Regular`, `black` is `Heavy`",
      },
      {
        classes: ["font-{family}"],
        values: "any key in `theme.fontFamily` — `sans`, `serif`, `mono` by default",
        target: "`FontFace` family axis",
        notes: "The fallback branch of `font-*`",
      },
      {
        classes: ["italic", "not-italic"],
        target: "`FontFace` style axis",
        notes: "Merges with the weight",
      },
      {
        classes: ["leading-{key}"],
        values:
          "`none` 1, `tight` 1.25, `snug` 1.375, `normal` 1.5, `relaxed` 1.625, `loose` 2",
        target: "`LineHeight`",
        notes: "Numeric forms are `unsupported-line-height-value`",
      },
      {
        classes: ["text-left", "text-center", "text-right"],
        target: "`TextXAlignment`",
      },
      {
        classes: ["text-justify"],
        target: "—",
        notes: "`unsupported-text-alignment`",
      },
      {
        classes: ["align-top", "align-middle", "align-bottom"],
        target: "`TextYAlignment = Top, Center, Bottom`",
      },
      {
        classes: ["text-wrap", "text-nowrap"],
        target: "`TextWrapped = true, false`",
      },
      {
        classes: ["whitespace-normal", "whitespace-nowrap"],
        target: "`TextWrapped = true, false`",
        notes: "Alias family; others are `unsupported-whitespace-value`",
      },
      {
        classes: ["truncate"],
        target: "`TextTruncate = Enum.TextTruncate.AtEnd`",
      },
      {
        classes: ["uppercase", "lowercase", "capitalize", "normal-case"],
        target: "the `Text` string itself",
        notes: "Rewritten at compile time when `Text` is a literal",
      },
      {
        classes: ["underline", "line-through", "no-underline"],
        target: "RichText markup around `Text`",
        notes: "Backs off with `decoration-on-richtext` if you set `RichText`",
      },
    ],
  },
  {
    id: "images",
    label: "Images",
    category: "Layout",
    summary:
      "`ScaleType` on `imagelabel` and `imagebutton`. `object-tile` is a Roblox-only extension with no Tailwind counterpart.",
    rows: [
      { classes: ["object-cover"], target: "`ScaleType = Enum.ScaleType.Crop`" },
      { classes: ["object-contain"], target: "`ScaleType = Enum.ScaleType.Fit`" },
      { classes: ["object-fill"], target: "`ScaleType = Enum.ScaleType.Stretch`" },
      { classes: ["object-tile"], target: "`ScaleType = Enum.ScaleType.Tile`" },
    ],
  },
  {
    id: "interaction",
    label: "Interaction",
    category: "Interactivity",
    summary: "`overscroll-*` is meaningful only on `scrollingframe`.",
    rows: [
      { classes: ["pointer-events-none"], target: "`Interactable = false`" },
      { classes: ["pointer-events-auto"], target: "`Interactable = true`" },
      {
        classes: ["overscroll-auto"],
        target: "`ElasticBehavior = Enum.ElasticBehavior.Always`",
      },
      {
        classes: ["overscroll-contain"],
        target: "`ElasticBehavior = Enum.ElasticBehavior.WhenScrollable`",
      },
      {
        classes: ["overscroll-none"],
        target: "`ElasticBehavior = Enum.ElasticBehavior.Never`",
      },
    ],
  },
  {
    id: "visibility",
    label: "Visibility",
    category: "Layout",
    summary: "The `Visible` property, both ways.",
    rows: [
      { classes: ["hidden"], target: "`Visible = false`" },
      { classes: ["visible"], target: "`Visible = true`" },
    ],
  },
  {
    id: "overflow",
    label: "Overflow",
    category: "Layout",
    summary:
      "`ClipsDescendants`. There is no `overflow-auto` and no `overflow-scroll` — that is a `scrollingframe` and the scrolling families.",
    rows: [
      { classes: ["overflow-hidden"], target: "`ClipsDescendants = true`" },
      { classes: ["overflow-clip"], target: "`ClipsDescendants = true`" },
      { classes: ["overflow-visible"], target: "`ClipsDescendants = false`" },
    ],
  },
  {
    id: "scrolling",
    label: "Scrolling",
    category: "Interactivity",
    summary:
      "Four families, all meaningful only on `scrollingframe`. Tailwind's own `scroll-*` utilities are a different family and report `unsupported-scroll-value`.",
    rows: [
      {
        classes: ["scroll-{x,y,xy}"],
        target: "`ScrollingDirection = X, Y, XY`",
      },
      {
        classes: ["scroll-none"],
        target: "`ScrollingEnabled = false`",
        notes: "Does not set a direction",
      },
      {
        classes: ["scrollbar-w-{n}"],
        values: "spacing scale, arbitrary",
        target: "`ScrollBarThickness`",
        notes: "`scrollbar-w-2` is 8px",
      },
      { classes: ["scrollbar-none"], target: "`ScrollBarThickness = 0`" },
      {
        classes: ["scrollbar-{color}"],
        values: "any color, `/N` modifier",
        target: "`ScrollBarImageColor3`, `ScrollBarImageTransparency`",
      },
      {
        classes: ["canvas-{auto,auto-x,auto-y,none}"],
        target: "`AutomaticCanvasSize = XY, X, Y, None`",
      },
    ],
  },
  {
    id: "variants",
    label: "Variants",
    category: "Variants",
    summary:
      "Twelve prefixes, chained with colons and combined with AND. Any variant-prefixed token forces the runtime helper into the module, literal or not.",
    targetLabel: "Condition",
    classLabel: "Variant",
    rows: [
      { classes: ["sm:"], target: "Viewport width ≥ 640", runtime: true },
      { classes: ["md:"], target: "Viewport width ≥ 768", runtime: true },
      { classes: ["lg:"], target: "Viewport width ≥ 1024", runtime: true },
      {
        classes: ["portrait:"],
        target: "Viewport width less than height",
        runtime: true,
      },
      {
        classes: ["landscape:"],
        target: "Viewport width ≥ height",
        runtime: true,
      },
      {
        classes: ["touch:"],
        target: "`UserInputService.TouchEnabled`, and no gamepad",
        runtime: true,
      },
      {
        classes: ["mouse:"],
        target: "Neither gamepad nor touch",
        runtime: true,
      },
      {
        classes: ["gamepad:"],
        target: "`UserInputService.GamepadEnabled`",
        runtime: true,
      },
      {
        classes: ["hover:"],
        target: "The pointer is over this element",
        runtime: true,
      },
      {
        classes: ["active:"],
        target: "This element is being pressed",
        runtime: true,
      },
      {
        classes: ["focus:"],
        target: "This element holds focus or selection",
        runtime: true,
      },
      {
        classes: ["dark:"],
        target: "`Players.LocalPlayer` carries `VelaColorScheme = \"dark\"`",
        runtime: true,
      },
    ],
  },
]

const GROUPS_BY_ID = new Map(
  VELA_UTILITY_GROUPS.map((group) => [group.id, group]),
)

export function getUtilityGroup(id: string) {
  const group = GROUPS_BY_ID.get(id)

  if (!group) {
    throw new Error(
      `Unknown Vela utility family "${id}". Known families: ${VELA_UTILITY_GROUPS.map((candidate) => candidate.id).join(", ")}.`,
    )
  }

  return group
}

/** Groups in cheat-sheet order: by category, then in reference-page order. */
export function getUtilityGroupsByCategory() {
  return UTILITY_CATEGORIES.map((category) => ({
    category,
    groups: VELA_UTILITY_GROUPS.filter((group) => group.category === category),
  })).filter((entry) => entry.groups.length > 0)
}

export const VELA_UTILITY_ROW_COUNT = VELA_UTILITY_GROUPS.reduce(
  (total, group) => total + group.rows.length,
  0,
)

/** Where a family's prose lives, for the cheat sheet's per-group link. */
export function getUtilityGroupHref(group: UtilityGroup) {
  return `/vela-rbxts/reference/utilities/#${group.id}`
}

/**
 * A family where every row is runtime-structural gets one note above the table
 * instead of the same pill on every row.
 */
export function isAllRuntime(group: UtilityGroup) {
  return group.rows.every((row) => row.runtime)
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
}

/**
 * Renders a cell's `code` and **bold** to HTML. Deliberately not a Markdown
 * parser: the cells are authored in this file, the subset is the two marks
 * above, and both the Astro table and the React cheat sheet have to agree on
 * what a cell means.
 */
export function utilityCellToHtml(cell: string) {
  return cell
    .replace(/[&<>"]/g, (char) => HTML_ESCAPES[char])
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
}

/** Everything a search box should match against, lowercased. */
export function utilityRowHaystack(group: UtilityGroup, row: UtilityRow) {
  return [
    ...row.classes,
    row.values ?? "",
    row.target,
    row.notes ?? "",
    group.label,
    group.category,
  ]
    .join(" ")
    .toLowerCase()
}
