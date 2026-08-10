/**
 * Build-time access to the Vela *emit* examples — the ones a page shows as
 * source and lowering, with no preview frame.
 *
 * A `preview/vela/` scene is something Loom renders; these are not. They exist
 * for the handful of places where the interesting thing is what the compiler
 * emitted rather than what it looks like, and above all for the pages that
 * compare the two targets: Vide's reactive seams show up in the emit
 * (`__velaMarginBox`, a thunked `__velaTests`) and nowhere else.
 *
 * They cannot be scenes even in principle. `@rbxts/vide` publishes Luau, so
 * the gallery — a browser Vite build — has no way to run a Vide component, and
 * `@rbxts/vela-runtime-vide` imports Vide directly. A Vide example that claimed
 * a Preview tab would be a React render wearing the wrong label.
 *
 * The framework is the middle segment of the filename (`Panel.vide.tsx`), so a
 * pair sits side by side in the directory and neither needs a config file. Each
 * is compiled with the plain default config — unlike a scene, there is no frame
 * for the numbers to line up with, so what a reader sees is what their own
 * project emits.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"

// Anchored on the working directory for the same reason vela-source.ts is:
// this module is bundled into the prerender chunks from page frontmatter, and
// only cwd means the same thing there as it does unbundled.
const docsRoot = process.cwd()

/**
 * Where the emit examples live. A directory of their own, not a corner of
 * `preview/vela/`: everything under that path is copied into the generated
 * gallery root — scenes lowered, anything else verbatim — and a file importing
 * `@rbxts/vide` would take the gallery build down with it.
 */
const EMIT_DIR = resolve(docsRoot, "preview/vela-emits")

/** The targets Vela emits for, in the order a tab strip should show them. */
export const VELA_FRAMEWORKS = ["vide", "react"] as const

export type VelaFramework = (typeof VELA_FRAMEWORKS)[number]

const FRAMEWORK_LABELS: Record<VelaFramework, string> = {
  vide: "Vide",
  react: "React",
}

/** How a framework is spelled in a tab and in the emitted block's title. */
export function velaFrameworkLabel(framework: VelaFramework) {
  return FRAMEWORK_LABELS[framework]
}

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
  ): { code: string; diagnostics: Diagnostic[]; needsRuntimeHost: boolean }
}

// Required rather than imported so the napi binary is loaded by Node and never
// handed to Vite — same reasoning, and same resolution anchor, as vela-source.
const requireFromDocs = createRequire(resolve(docsRoot, "package.json"))

let compiler: Compiler | undefined
function getCompiler(): Compiler {
  compiler ??= requireFromDocs("@vela-rbxts/compiler") as Compiler
  return compiler
}

/**
 * The resolved config an emit example is compiled with: nothing but the target.
 *
 * `framework` is what picks the runtime specifier and the Vide-only hints, and
 * it is a *resolved* config the compiler wants — which is what `defineConfig`
 * returns, and what the `rbxtsc` host hands it for a real project.
 */
function configFor(framework: VelaFramework) {
  const { defineConfig } = requireFromDocs("@vela-rbxts/config") as {
    defineConfig(input: unknown): unknown
  }

  return JSON.stringify(defineConfig({ framework }))
}

export type VelaEmit = {
  /** Example name, e.g. "Panel". */
  name: string
  framework: VelaFramework
  /** "Vide" / "React". */
  frameworkLabel: string
  /** The authored source. */
  source: string
  /** What Vela emitted for this target. */
  output: string
  /** Diagnostics the compiler reported for this example. */
  diagnostics: Diagnostic[]
  /** Whether the example fell onto Vela's runtime path. */
  needsRuntimeHost: boolean
}

function emitFile(name: string, framework: VelaFramework) {
  return resolve(EMIT_DIR, `${name}.${framework}.tsx`)
}

/** Every emit example name that exists for at least one target, alphabetically. */
export function listVelaEmits(): string[] {
  if (!existsSync(EMIT_DIR)) {
    return []
  }

  const names = new Set<string>()
  for (const file of readdirSync(EMIT_DIR)) {
    const match = /^(.+)\.(vide|react)\.tsx$/.exec(file)
    if (match) {
      names.add(match[1])
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b, "en"))
}

// Compiling is cheap but not free, and a page that shows both targets of an
// example asks for the same file more than once during one build.
const cache = new Map<string, { mtimeMs: number; emit: VelaEmit }>()

/** Compile one example for one target, or undefined when there is no such file. */
export function compileVelaEmit(
  name: string,
  framework: VelaFramework,
): VelaEmit | undefined {
  const file = emitFile(name, framework)
  if (!existsSync(file)) {
    return undefined
  }

  const key = `${name}.${framework}`
  const { mtimeMs } = statSync(file)
  const cached = cache.get(key)
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.emit
  }

  const source = readFileSync(file, "utf8")
  const result = getCompiler().transform(source, {
    configJson: configFor(framework),
    fileName: `${name}.tsx`,
  })

  const emit: VelaEmit = {
    name,
    framework,
    frameworkLabel: velaFrameworkLabel(framework),
    source,
    output: result.code.trimEnd(),
    diagnostics: result.diagnostics,
    needsRuntimeHost: result.needsRuntimeHost,
  }

  cache.set(key, { mtimeMs, emit })
  return emit
}

/**
 * Every target an example was authored for, in tab order.
 *
 * A pair is the normal case and the point of the directory, but a single-target
 * example is legitimate — some emits only exist under one framework — so this
 * returns whatever is there rather than insisting on both.
 */
export function compileVelaEmits(
  name: string,
  frameworks: readonly VelaFramework[] = VELA_FRAMEWORKS,
): VelaEmit[] {
  return frameworks.flatMap((framework) => {
    const emit = compileVelaEmit(name, framework)

    return emit ? [emit] : []
  })
}
