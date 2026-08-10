/**
 * `@rbxts/vela-runtime*` for the Loom galleries, materialized into the gallery
 * root and aliased there.
 *
 * Up to 0.11.x a lowered scene carried the runtime host inlined, so a gallery
 * had nothing to resolve. Since 0.12.0 the emit imports it — `__VelaOpacity.Fade`
 * wraps every component root, `createVelaRemScaler` carries the rem bindings, and
 * a runtime-path element calls `createVelaRuntimeHost` — and none of that can come
 * from npm here: `@rbxts/vela-runtime` publishes compiled Luau (`out/init.luau`)
 * for Rojo to map into a place, which Loom has no way to run. The TypeScript
 * behind that Luau lives only in the repo.
 *
 * **Why a copy rather than an alias straight at the checkout.** Loom answers for
 * `@rbxts/react` and `@rbxts/services` through its own Vite plugin, and a module
 * served out of a sibling checkout resolves those against *that* checkout's
 * `node_modules` instead — which is a real second React. The symptom is not a
 * missing module but `Invalid hook call` and a null `useContext` inside `Fade`,
 * from a component tree that renders fine right up until it doesn't. Copying the
 * sources under the gallery root puts them on exactly the resolution path every
 * scene already uses.
 *
 * The copy is cheap (a couple of dozen small files), and both generated roots are
 * rebuilt from scratch on every run, so it cannot go stale.
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs"
import { resolve } from "node:path"

// Anchored on the working directory for the same reason lattice-source.ts is:
// this module is loaded unbundled while astro.config is evaluated.
const docsRoot = process.cwd()

const REPO_CANDIDATES = [
  process.env.VELA_REPO,
  // The linked/checked-out sibling (`pnpm link:preview-src`) — the path the
  // preview integrations and CI both use.
  resolve(docsRoot, ".preview-src/vela-rbxts"),
  resolve(docsRoot, "../../rust/vela-rbxts"),
].filter((candidate): candidate is string => Boolean(candidate))

/** The vela-rbxts checkout root, if one is present. */
export function getVelaRepo() {
  return REPO_CANDIDATES.find((candidate) => existsSync(candidate))
}

/** Package id → the package directory under the checkout, and its entry file. */
const PACKAGES: { id: string; dir: string }[] = [
  { id: "@rbxts/vela-runtime", dir: "runtime" },
  { id: "@rbxts/vela-runtime-core", dir: "runtime-core" },
  { id: "@rbxts/vela-runtime-vide", dir: "runtime-vide" },
]

/** Where the copies land inside a generated gallery root. */
const VENDOR = "src/vela-runtime"

/**
 * Copy the runtime sources into `<generatedRoot>/src/vela-runtime/` and return
 * the Loom `shims` map that points each package id at its copied entry.
 *
 * Returns `{}` with no checkout, which the integrations treat the way they treat
 * any other missing preview input.
 */
export function materializeVelaRuntime(
  generatedRoot: string,
): Record<string, string> {
  const repo = getVelaRepo()
  if (!repo) {
    return {}
  }

  const vendorRoot = resolve(generatedRoot, VENDOR)
  rmSync(vendorRoot, { recursive: true, force: true })

  const shims: Record<string, string> = {}
  for (const { id, dir } of PACKAGES) {
    const source = resolve(repo, "packages", dir, "src")
    if (!existsSync(source)) {
      continue
    }

    const target = resolve(vendorRoot, dir)
    mkdirSync(target, { recursive: true })
    cpSync(source, target, { recursive: true })
    shims[id] = resolve(target, "index.ts")

    materializeConfigDefaults(repo, target)
  }

  return shims
}

/**
 * `src/config-defaults.json` is generated, and gitignored — the runtime carries
 * the default theme so the compiler never has to emit it, and both sides read
 * one source of truth in `@vela-rbxts/config`. A local checkout has it because
 * the package has been built there; a fresh CI checkout does not, and the copy
 * then fails at *bundle* time with `Could not resolve "./config-defaults.json"`
 * rather than at copy time, which is a long way from the cause.
 *
 * So write it the way each package's own prebuild script does. Unconditional
 * across the three: a package that never imports it is unaffected by the file
 * being there.
 */
function materializeConfigDefaults(repo: string, target: string) {
  const written = resolve(target, "config-defaults.json")
  if (existsSync(written)) {
    return
  }

  const defaults = resolve(repo, "packages/config/src/defaults.json")
  if (existsSync(defaults)) {
    copyFileSync(defaults, written)
  }
}
