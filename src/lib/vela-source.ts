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
 * - `gallerySource` — `output` plus the preview-compat rewrite in
 *   vela-loom-compat.ts, which is what is written into the generated gallery.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"
// Shared with the playground, which runs the same rewrite in the browser.
import { toGallerySource } from "./vela-loom-compat"

export { toGallerySource }

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

/**
 * Everything in the scene directory that is not an authored example: the stage
 * a scene imports, and the playground target. These are copied into the gallery
 * verbatim rather than lowered — they carry no `className`, and the compiler is
 * the thing they exist to show off, not something applied to them.
 */
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
 * What every scene is compiled against before its own config is layered on.
 *
 * Vela 0.12.0 made every pixel offset a rem unit measured against a 1920×1020
 * viewport. A preview frame is nothing like that — roughly 740×220 — so the
 * curve resolves rem to its `min` of 8 and the whole scene renders at exactly
 * half the size its class list names. That is correct in a game and wrong here:
 * these frames are component stages, not devices, and a reader comparing the
 * render against `p-4 → new UDim(0, 16)` in the tables beside it should see one
 * pixel per pixel.
 *
 * Pinning the clamp is Vela's own documented answer, not a preview-only hack —
 * `min === max === base` drops the scaling from the emit entirely, so the
 * Lowered tab shows the plain `UDim` literals the guides quote. The pages that
 * show a *default* emit beside a preview say so where they show it.
 */
const STAGE_CONFIG = { theme: { rem: { base: 16, min: 16, max: 16 } } }

/**
 * The resolved config a scene is compiled with: the stage defaults above, with
 * the scene's own `<name>.config.json` — same input shape as a project's
 * `vela.config.json` — merged over them.
 *
 * The compiler wants the *resolved* config — defaults merged, `extend` applied
 * — which is exactly what `defineConfig` returns and exactly what the `rbxtsc`
 * host hands it for a real project. So a themed example goes through the same
 * merge rules the theming guide documents rather than a hand-rolled imitation.
 */
function readSceneConfig(name: string) {
  const input = readVelaSceneConfigInput(name)

  const { defineConfig } = requireFromDocs("@vela-rbxts/config") as {
    defineConfig(input: unknown): unknown
  }

  if (input === undefined) {
    return JSON.stringify(defineConfig(STAGE_CONFIG))
  }

  const scene = JSON.parse(input) as { theme?: Record<string, unknown> }

  // `rem` is a record of four settings rather than a keyed scale, so it merges
  // field by field and a scene that names its own rem still wins field by field.
  return JSON.stringify(
    defineConfig({
      ...scene,
      theme: { ...STAGE_CONFIG.theme, ...scene.theme },
    }),
  )
}

/**
 * The unresolved `<name>.config.json` beside a scene, as authored. The
 * playground seeds its config editor from this — the input shape is what a
 * project writes, and resolving it is the playground's job, same as here.
 */
export function readVelaSceneConfigInput(name: string): string | undefined {
  const file = resolve(SCENE_DIR, `${name}.config.json`)

  return existsSync(file) ? readFileSync(file, "utf8") : undefined
}

/** Turn "ListRowsScene" into "List Rows". */
function labelForScene(scene: string) {
  return scene.replace(/Scene$/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2")
}

export type VelaSceneTemplate = {
  scene: string
  /** Human label, e.g. "List Rows". */
  label: string
  /** The authored source, harness and all — the playground runs it as the gallery does. */
  source: string
  /** The scene's `vela.config.json`, unresolved, when it has one. */
  configInput?: string
}

/**
 * Every authored example as a playground starter. Deliberately the authored
 * source rather than the lowering: the playground's whole subject is what the
 * compiler does to it.
 */
export function listVelaSceneTemplates(): VelaSceneTemplate[] {
  return listVelaScenes().flatMap((scene) => {
    const built = compileVelaScene(scene)
    if (!built) {
      return []
    }

    const configInput = readVelaSceneConfigInput(scene)

    return [
      {
        scene,
        label: labelForScene(scene),
        source: built.source,
        ...(configInput === undefined ? {} : { configInput }),
      },
    ]
  })
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
