/**
 * The gap between what Vela emits and what Loom can render, as a rewrite.
 *
 * Kept apart from vela-source.ts because both sides of the docs need it and
 * only one of them is Node: the build lowers `preview/vela/` here, and
 * `/vela-playground/` lowers what you type in the browser. Same compiler, same
 * rewrite, so a snippet renders identically whichever path it came down.
 *
 * Everything else Vela emits is ordinary roblox-ts that Loom runs as-is.
 */

/**
 * Loom knows Roblox's legacy `Font` enum, but not the `Font` datatype or
 * `FontFace` that `font-*` lowers to — `new Font(...)` would be an undefined
 * global in the browser and take the whole preview down with it. Map the
 * emitted family/weight pair onto the nearest legacy enum member, which the
 * renderer resolves to a real CSS font-weight.
 */
function toLoomFont(family: string, weight: string) {
  const prefix = family.includes("Gotham")
    ? "Gotham"
    : family.includes("RobotoMono")
      ? "RobotoMono"
      : family.includes("Roboto")
        ? "Roboto"
        : family.includes("Arial")
          ? "Arial"
          : "SourceSans"

  // Loom's enum only carries the weights Roblox shipped per family, so several
  // Vela weights collapse onto one member (there is no SourceSansMedium).
  if (weight === "Heavy" && prefix === "Gotham") return "GothamBlack"
  if (weight === "Bold" || weight === "ExtraBold" || weight === "Heavy") {
    return `${prefix}Bold`
  }
  if (weight === "SemiBold") {
    return prefix === "Gotham" ? "GothamMedium" : "SourceSansSemibold"
  }
  if (weight === "Medium") {
    return prefix === "Gotham" ? "GothamMedium" : "SourceSans"
  }
  if (weight === "Thin" || weight === "ExtraLight" || weight === "Light") {
    return prefix === "SourceSans" ? "SourceSansLight" : prefix
  }

  return prefix
}

/**
 * Rewrite the compiler's emit into something Loom can render. Two gaps need it
 * today — the font datatype above, and `ColorSequence`, whose browser stand-in
 * implements the two-color form only as the `.new` factory, so the constructor
 * call a gradient lowers to sets `Keypoints` to a bare color and throws while
 * the frame is being encoded. Same call either way.
 *
 * This rewrite exists only in the copy that is rendered. Wherever the docs show
 * the lowering — the Lowered tab, the playground's output pane — they show the
 * compiler's actual emit, `FontFace` and all.
 */
export function toGallerySource(output: string) {
  return output
    .replace(
      /FontFace=\{new Font\("[^"]*\/([A-Za-z]+)\.json",\s*Enum\.FontWeight\.(\w+)\)\}/g,
      (_match, family: string, weight: string) =>
        `Font={Enum.Font.${toLoomFont(family, weight)}}`,
    )
    .replace(/new ColorSequence\(/g, "ColorSequence.new(")
}
