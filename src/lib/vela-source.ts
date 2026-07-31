/**
 * Build-time access to the Vela preview examples.
 *
 * Unlike the lattice-ui previews — whose scenes live in a sibling checkout —
 * a Vela example is plain roblox-ts TSX with `className` on it, so the examples
 * live in this repo under `preview/vela/` and nothing has to be checked out
 * to render them.
 *
 * Each `*.vela.tsx` file is run through the real compiler
 * (`@vela-rbxts/compiler`, the same native binary `rbxtsc` loads through the
 * transformer) and the lowered output is what Loom renders. So a preview shows
 * the actual result of Vela's lowering, not a hand-written imitation of it, and
 * the docs get the compiler's diagnostics for their own examples for free.
 *
 * Three views of one scene, all derived here:
 * - `source` — what the author wrote (the Code tab, and the snippet in prose).
 * - `output` — what Vela emitted (the Output tab).
 * - `gallerySource` — `output` plus the small preview-compat rewrite below,
 *   which is what is written into the generated gallery.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"

// Anchored on the working directory for the same reason lattice-source.ts is:
// this module is imported unbundled while astro.config is evaluated *and*
// bundled into the prerender chunks from page frontmatter, and only cwd means
// the same thing in both. Astro runs from the project root in dev, build and CI.
const docsRoot = process.cwd()

/**
 * Where the authored examples live. Outside `src/` on purpose: these are
 * roblox-ts sources, and Vite's dependency scanner walks the docs' own `src/`
 * and would try (and fail) to resolve `@rbxts/react` for the site bundle.
 */
const SCENE_DIR = resolve(docsRoot, "preview/vela")

/** Suffix that marks a file as a preview scene rather than a support module. */
const SCENE_SUFFIX = ".vela.tsx"

type Diagnostic = {
  level: string
  code: string
  message: string
  token?: string
}

type TransformResult = {
  code: string
  diagnostics: Diagnostic[]
  changed: boolean
  needsRuntimeHost: boolean
}

type Compiler = {
  transform(
    source: string,
    options?: { configJson?: string; fileName?: string } | null,
  ): TransformResult
}

// `@vela-rbxts/compiler` is a CommonJS napi addon: required rather than
// imported so the platform binary is loaded by Node, never handed to Vite.
// Resolution is anchored at the project root, which — unlike this module's own
// location — is the same in the unbundled and bundled contexts above.
const requireFromDocs = createRequire(resolve(docsRoot, "package.json"))

let compiler: Compiler | undefined
function getCompiler(): Compiler {
  compiler ??= requireFromDocs("@vela-rbxts/compiler") as Compiler
  return compiler
}

export type VelaScene = {
  /** Scene name, e.g. "PanelScene". */
  name: string
  /** The authored `*.vela.tsx` source. */
  source: string
  /** The source Vela emitted for it. */
  output: string
  /** What the gallery renders — `output` after {@link toGallerySource}. */
  gallerySource: string
  /** Diagnostics the compiler reported for this example. */
  diagnostics: Diagnostic[]
  /** Whether the example fell onto Vela's runtime path. */
  needsRuntimeHost: boolean
}

/** Every authored scene name, alphabetically. */
export function listVelaScenes(): string[] {
  if (!existsSync(SCENE_DIR)) {
    return []
  }

  return readdirSync(SCENE_DIR)
    .filter((file) => file.endsWith(SCENE_SUFFIX))
    .map((file) => file.slice(0, -SCENE_SUFFIX.length))
    .sort((a, b) => a.localeCompare(b, "en"))
}

/** Support modules (`VelaStage.tsx` and friends) a scene may import. */
export function listVelaSupportModules(): string[] {
  if (!existsSync(SCENE_DIR)) {
    return []
  }

  return readdirSync(SCENE_DIR).filter(
    (file) => file.endsWith(".tsx") && !file.endsWith(SCENE_SUFFIX),
  )
}

export function readVelaSupportModule(file: string): string {
  return readFileSync(resolve(SCENE_DIR, file), "utf8")
}

/** Relative target path for a scene, as the gallery's `?target=` expects it. */
export function velaSceneTarget(name: string) {
  return `src/preview-targets/${name}.loom.tsx`
}

/**
 * A scene's own project config, if it has one: `<name>.config.json` next to the
 * scene, in the same input shape a project's `vela.config.json` uses.
 *
 * The compiler wants the *resolved* config — defaults merged, `extend` applied
 * — which is exactly what `defineConfig` returns and exactly what the `rbxtsc`
 * host hands it for a real project. So a themed example goes through the same
 * merge rules the theming guide documents rather than a hand-rolled imitation.
 */
function readSceneConfig(name: string) {
  const file = resolve(SCENE_DIR, `${name}.config.json`)
  if (!existsSync(file)) {
    return undefined
  }

  const { defineConfig } = requireFromDocs("@vela-rbxts/config") as {
    defineConfig(input: unknown): unknown
  }

  return JSON.stringify(defineConfig(JSON.parse(readFileSync(file, "utf8"))))
}

/**
 * Loom knows Roblox's legacy `Font` enum, but not the `Font` datatype or
 * `FontFace` that `font-*` lowers to — `new Font(...)` would be an undefined
 * global in the browser and take the whole preview down with it. Map the
 * emitted family/weight pair onto the nearest legacy enum member, which the
 * renderer resolves to a real CSS font-weight.
 *
 * This rewrite exists only in the copy that is rendered. The Output tab shows
 * the compiler's actual emit, `FontFace` and all.
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
 * Everything else Vela emits is ordinary roblox-ts that Loom runs as-is.
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

// Compiling is cheap but not free, and both the integration and every page that
// embeds a scene ask for the same files during one build.
const cache = new Map<string, { mtimeMs: number; scene: VelaScene }>()

/** Compile one scene, or undefined when there is no such file. */
export function compileVelaScene(name: string): VelaScene | undefined {
  const file = resolve(SCENE_DIR, `${name}${SCENE_SUFFIX}`)
  if (!existsSync(file)) {
    return undefined
  }

  const { mtimeMs } = statSync(file)
  const cached = cache.get(name)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.scene
  }

  const source = readFileSync(file, "utf8")
  const result = getCompiler().transform(source, {
    configJson: readSceneConfig(name),
    fileName: `${name}${SCENE_SUFFIX}`,
  })

  const scene: VelaScene = {
    name,
    source,
    output: result.code,
    gallerySource: toGallerySource(result.code),
    diagnostics: result.diagnostics,
    needsRuntimeHost: result.needsRuntimeHost,
  }

  cache.set(name, { mtimeMs, scene })
  return scene
}

/**
 * Strip the gallery boilerplate a scene carries: the stage import and the
 * trailing `preview` export. Used by the Code tab, where the reader wants the
 * component, not the harness.
 */
export function stripVelaBoilerplate(source: string) {
  return `${source
    .replace(/import \{ VelaStage \} from "\.\/VelaStage";?\n/, "")
    .replace(/\nexport const preview[\s\S]*$/, "")
    .trimEnd()}\n`
}
