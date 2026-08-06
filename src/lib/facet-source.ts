/**
 * Build-time access to the Facet registry sources and the docs' Facet examples.
 *
 * A Facet preview has to render two things that are authored in two different
 * places, and both have to go through the Vela compiler before Loom sees them:
 *
 * - the **registry component** — `registry/src/ui/button.tsx` in the Facet
 *   checkout. These are never published to npm (the registry is a static site
 *   the CLI copies text out of), so a checkout is the only way to reach them,
 *   the same way the lattice previews reach their scenes.
 * - the **example scene** — `preview/facet/*.facet.tsx` in this repo, which
 *   imports those components exactly as a project that ran `facet add` would.
 *
 * Lowering both is the part that is easy to get wrong. Only the file the
 * compiler is handed gets its `className` lowered, and a Facet component's
 * whole appearance is in its own class strings — so lowering the scene alone
 * renders an unstyled tree. Every registry file is lowered too, with the same
 * resolved config, which is what `rbxtsc` plus the Vela transformer does to a
 * real project.
 *
 * The theme is the published `@facet-ui/theme`, run through Vela's own
 * `defineConfig`, so a preview resolves its tokens through the same merge rules
 * the theming guide documents rather than a hand-rolled imitation.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"
import { facetTheme } from "@facet-ui/theme"
import { toGallerySource } from "./vela-loom-compat"

// Anchored on the working directory for the same reason lattice-source.ts is:
// this module is imported unbundled while astro.config is evaluated *and*
// bundled into the prerender chunks from page frontmatter, and only cwd means
// the same thing in both.
const docsRoot = process.cwd()

const CHECKOUT_CANDIDATES = [
  process.env.FACET_REPO,
  resolve(docsRoot, ".preview-src/facet"),
  resolve(docsRoot, "../../typescript/facet"),
].filter((candidate): candidate is string => Boolean(candidate))

/** Where the docs' own example scenes live, outside `src/` (roblox-ts sources). */
const SCENE_DIR = resolve(docsRoot, "preview/facet")

/** Suffix that marks a file as a preview scene rather than a support module. */
const SCENE_SUFFIX = ".facet.tsx"

/** Neutral ramp the previews are themed from — `facet init`'s own default. */
const PREVIEW_BASE = "zinc"

/**
 * Both modes are emitted, and that is not a convenience.
 *
 * Vela resolves `className` at compile time, so a Facet build carries exactly
 * one mode — `bg-primary` is already a literal `Color3` by the time Loom sees
 * it, and no runtime signal can repaint it. The docs have a light/dark toggle,
 * so the only honest way to follow it is to lower everything twice and point
 * the frame at the other build. A reader flipping the toggle is watching the
 * thing the theming guide describes.
 */
export const PREVIEW_MODES = ["dark", "light"] as const

export type PreviewMode = (typeof PREVIEW_MODES)[number]

type Diagnostic = {
  level: string
  code: string
  message: string
  token?: string
}

type Compiler = {
  transform(
    source: string,
    options?: { configJson?: string; fileName?: string } | null,
  ): {
    code: string
    diagnostics: Diagnostic[]
    changed: boolean
    needsRuntimeHost: boolean
  }
}

// `@vela-rbxts/compiler` is a CommonJS napi addon: required rather than
// imported so the platform binary is loaded by Node, never handed to Vite.
const requireFromDocs = createRequire(resolve(docsRoot, "package.json"))

let compiler: Compiler | undefined
function getCompiler(): Compiler {
  compiler ??= requireFromDocs("@vela-rbxts/compiler") as Compiler
  return compiler
}

const configJson = new Map<PreviewMode, string>()
/**
 * The resolved Vela config a mode's previews are lowered against — what
 * `vela.config.ts` becomes for a project that ran `facet init`.
 *
 * The compiler wants the config *resolved* (defaults merged, `extend` applied),
 * which is what `defineConfig` returns and what the `rbxtsc` host hands it.
 * Passing the `extend` input shape instead wipes the built-in theme and every
 * token reports `unknown-theme-key`.
 */
function getConfigJson(mode: PreviewMode): string {
  let cached = configJson.get(mode)
  if (cached === undefined) {
    const { defineConfig } = requireFromDocs("@vela-rbxts/config") as {
      defineConfig(input: unknown): unknown
    }

    cached = JSON.stringify(
      defineConfig({
        theme: { extend: { ...facetTheme({ base: PREVIEW_BASE, mode }) } },
      }),
    )
    configJson.set(mode, cached)
  }

  return cached
}

/** The Facet checkout, if one is present. */
export function getFacetCheckout() {
  return CHECKOUT_CANDIDATES.find((candidate) =>
    existsSync(resolve(candidate, "registry/registry.ts")),
  )
}

/** The version the checkout is on, read from the CLI package. */
export function readFacetCheckoutVersion() {
  const checkout = getFacetCheckout()
  if (!checkout) {
    return undefined
  }

  const manifest = resolve(checkout, "packages/tools/cli/package.json")
  if (!existsSync(manifest)) {
    return undefined
  }

  try {
    return (JSON.parse(readFileSync(manifest, "utf8")) as { version?: string })
      .version
  } catch {
    return undefined
  }
}

/**
 * `@facet-ui/react-variants` → the checkout's package source, as a Loom shim.
 *
 * npm publishes this package as compiled Luau (`out/init.luau`) with no
 * TypeScript beside it, so Loom — which transpiles TSX and cannot run Luau —
 * gets nothing usable from the registry. The source in the checkout is the only
 * form a preview can consume, and it imports nothing outside itself, so the
 * checkout never has to be installed.
 */
export function facetShims(): Record<string, string> {
  const checkout = getFacetCheckout()
  if (!checkout) {
    return {}
  }

  const entry = resolve(checkout, "packages/react/variants/src/index.ts")

  return existsSync(entry) ? { "@facet-ui/react-variants": entry } : {}
}

export type RegistryFile = {
  /** Path under `registry/src`, e.g. `ui/button.tsx`. */
  path: string
  /** Which mode's lowering this is. */
  mode: PreviewMode
  /** The source as authored, `~/` imports and all. */
  source: string
  /** What the gallery gets: lowered, `~/` rewritten, Loom-compat applied. */
  emitted: string
  diagnostics: Diagnostic[]
}

/**
 * Rewrite `~/ui/button` style imports to a relative path from `fromDir`.
 *
 * This is the same rewrite `facet add` performs for a project that set no
 * import alias — which is its default, because a relative import needs no
 * tsconfig `paths`. Doing it here rather than aliasing `~/` in the gallery
 * keeps the emitted tree shaped like a real project's `src/shared`.
 */
function rewriteRegistryImports(source: string, fromDir: string): string {
  return source.replace(
    /(["'])~\/([^"']+)\1/g,
    (_match, quote: string, specifier: string) => {
      const segments = fromDir.split("/").filter(Boolean).length
      const prefix = segments === 0 ? "./" : `${"../".repeat(segments)}`

      return `${quote}${prefix}${specifier}${quote}`
    },
  )
}

/** Every file under the checkout's `registry/src`, as `ui/button.tsx` paths. */
function listRegistryFiles(checkout: string): string[] {
  const root = resolve(checkout, "registry/src")
  if (!existsSync(root)) {
    return []
  }

  return readdirSync(root)
    .filter((dir) => existsSync(resolve(root, dir)))
    .flatMap((dir) =>
      readdirSync(resolve(root, dir))
        .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
        .map((file) => `${dir}/${file}`),
    )
    .sort((a, b) => a.localeCompare(b, "en"))
}

const registryCache = new Map<string, { mtimeMs: number; file: RegistryFile }>()

/**
 * Read one registry file and prepare it for the gallery.
 *
 * A `.ts` helper carries no JSX and no `className` — `lib/utils.ts` is one
 * re-export — so it is copied rather than lowered. Running it through the
 * compiler would be harmless but would inline Vela's runtime into a file that
 * has no use for it.
 */
function buildRegistryFile(
  checkout: string,
  path: string,
  mode: PreviewMode,
): RegistryFile | undefined {
  const file = resolve(checkout, "registry/src", path)
  if (!existsSync(file)) {
    return undefined
  }

  const { mtimeMs } = statSync(file)
  const key = `${mode}:${path}`
  const cached = registryCache.get(key)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.file
  }

  const source = readFileSync(file, "utf8")
  const dir = path.split("/").slice(0, -1).join("/")

  let built: RegistryFile
  if (path.endsWith(".tsx")) {
    const result = getCompiler().transform(source, {
      configJson: getConfigJson(mode),
      fileName: path,
    })

    built = {
      path,
      mode,
      source,
      emitted: rewriteRegistryImports(toGallerySource(result.code), dir),
      diagnostics: result.diagnostics,
    }
  } else {
    built = {
      path,
      mode,
      source,
      emitted: rewriteRegistryImports(source, dir),
      diagnostics: [],
    }
  }

  registryCache.set(key, { mtimeMs, file: built })
  return built
}

/**
 * Every registry file in one mode's lowering, ready to write into the gallery.
 *
 * A `~/lib/text` import stays a sibling-relative `../lib/text` because a mode's
 * whole tree is written under one directory — so each mode's components import
 * each other's matching lowering, never across.
 */
export function listRegistryFilesBuilt(mode: PreviewMode): RegistryFile[] {
  const checkout = getFacetCheckout()
  if (!checkout) {
    return []
  }

  return listRegistryFiles(checkout).flatMap((path) => {
    const built = buildRegistryFile(checkout, path, mode)
    return built ? [built] : []
  })
}

/** The authored source of one registry component, e.g. `ui/button.tsx`. */
export function readRegistrySource(path: string): string | undefined {
  const checkout = getFacetCheckout()
  if (!checkout) {
    return undefined
  }

  const file = resolve(checkout, "registry/src", path)
  return existsSync(file) ? readFileSync(file, "utf8") : undefined
}

/** Every authored scene name, alphabetically. */
export function listFacetScenes(): string[] {
  if (!existsSync(SCENE_DIR)) {
    return []
  }

  return readdirSync(SCENE_DIR)
    .filter((file) => file.endsWith(SCENE_SUFFIX))
    .map((file) => file.slice(0, -SCENE_SUFFIX.length))
    .sort((a, b) => a.localeCompare(b, "en"))
}

/**
 * Support modules beside the scenes — the stage and its Loom shims — copied in
 * verbatim rather than lowered. They carry no `className`: the compiler is what
 * a preview exists to show off, not something applied to the furniture.
 */
export function listFacetSupportModules(): string[] {
  if (!existsSync(SCENE_DIR)) {
    return []
  }

  return readdirSync(SCENE_DIR).filter(
    (file) =>
      (file.endsWith(".tsx") || file.endsWith(".ts")) &&
      !file.endsWith(SCENE_SUFFIX),
  )
}

export function readFacetSupportModule(file: string): string {
  return readFileSync(resolve(SCENE_DIR, file), "utf8")
}

/**
 * Relative target path for a scene, as the gallery's `?target=` expects it.
 *
 * One target per mode, because the two are different builds of the same scene
 * rather than one build with a switch in it.
 */
export function facetSceneTarget(name: string, mode: PreviewMode) {
  return `src/preview-targets/${name}.${mode}.loom.tsx`
}

export type FacetScene = {
  name: string
  mode: PreviewMode
  /** The authored `*.facet.tsx` source. */
  source: string
  /** What the gallery renders. */
  gallerySource: string
  diagnostics: Diagnostic[]
}

const sceneCache = new Map<string, { mtimeMs: number; scene: FacetScene }>()

/**
 * Point a scene's component imports at one mode's lowering.
 *
 * A scene is authored against `../ui/button` — the path a project that ran
 * `facet add` would use — and each mode's copy of the registry lives one
 * directory deeper, so the specifier grows a mode segment on the way in.
 * `../facet-mode` travels the same way; see {@link FACET_MODE_MODULE}.
 */
function rewriteSceneImports(source: string, mode: PreviewMode): string {
  return source.replace(
    /(["'])\.\.\/(ui|lib|hooks|facet-mode)([/"'])/g,
    (_match, quote: string, dir: string, tail: string) =>
      `${quote}../${mode}/${dir}${tail}`,
  )
}

/** Path of the per-mode marker module, relative to a mode's own directory. */
export const FACET_MODE_MODULE = "facet-mode.ts"

/**
 * The one thing a scene cannot read off its own lowering: which mode it is.
 *
 * The stage needs it to paint a backdrop matching the build, and the stage is
 * copied in verbatim rather than compiled — so the value arrives as an ordinary
 * module in each mode's directory, resolved by the same import rewrite that
 * points a scene at its components.
 */
export function facetModeModule(mode: PreviewMode): string {
  return `// Generated by the facet-preview integration. One per lowering.\nexport const MODE = "${mode}" as const;\n`
}

/** Compile one scene in one mode, or undefined when there is no such file. */
export function compileFacetScene(
  name: string,
  mode: PreviewMode,
): FacetScene | undefined {
  const file = resolve(SCENE_DIR, `${name}${SCENE_SUFFIX}`)
  if (!existsSync(file)) {
    return undefined
  }

  const { mtimeMs } = statSync(file)
  const key = `${mode}:${name}`
  const cached = sceneCache.get(key)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.scene
  }

  const source = readFileSync(file, "utf8")
  const result = getCompiler().transform(source, {
    configJson: getConfigJson(mode),
    fileName: `${name}${SCENE_SUFFIX}`,
  })

  const scene: FacetScene = {
    name,
    mode,
    source,
    gallerySource: rewriteSceneImports(toGallerySource(result.code), mode),
    diagnostics: result.diagnostics,
  }

  sceneCache.set(key, { mtimeMs, scene })
  return scene
}

/**
 * Strip the gallery boilerplate a scene carries: the stage import and the
 * trailing `preview` export. Used by the Usage tab, where the reader wants the
 * markup, not the harness.
 */
export function stripFacetBoilerplate(source: string) {
  return `${source
    .replace(/import \{ FacetStage \} from "\.\/FacetStage";?\n/, "")
    .replace(/\nexport const preview[\s\S]*$/, "")
    .trimEnd()}\n`
}
