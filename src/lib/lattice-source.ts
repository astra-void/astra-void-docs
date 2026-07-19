/**
 * Build-time access to the lattice-ui checkout's Loom preview scenes.
 *
 * The scene sources are the docs' single source of truth for example code:
 * `LoomPreview` shows them in its Code tab, and `/playground` seeds its editor
 * from them. Both read the same sibling checkout the preview bundle is built
 * from (see scripts/build-loom-previews.mjs); a missing checkout is never fatal
 * — callers fall back to shipping without source.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"

// This file lives at <docs root>/src/lib/.
const docsRoot = resolve(import.meta.dirname ?? ".", "../..")

const APP_CANDIDATES = [
  process.env.LATTICE_PREVIEW_APP,
  resolve(docsRoot, "../../rojo/lattice-ui/apps/loom-preview"),
  resolve(docsRoot, "../../../rojo/lattice-ui/apps/loom-preview"),
].filter((candidate): candidate is string => Boolean(candidate))

/** The lattice loom-preview app directory, if a checkout is present. */
export function getLatticePreviewApp() {
  return APP_CANDIDATES.find((candidate) => existsSync(candidate))
}

/** Relative target path for a scene, as the gallery's `?target=` expects it. */
export function sceneTarget(scene: string) {
  return `src/preview-targets/${scene}.loom.tsx`
}

/** Raw source of one scene (`"SwitchExampleScene"`), or undefined. */
export function readSceneSource(scene: string) {
  const app = getLatticePreviewApp()
  if (!app) {
    return undefined
  }

  const file = resolve(app, sceneTarget(scene))

  return existsSync(file) ? readFileSync(file, "utf8") : undefined
}

/**
 * Strip the docs-infra boilerplate a scene carries for the gallery: the shell
 * import and the trailing `preview` export. Used by the Code tab, where the
 * reader wants the component, not the harness.
 */
export function stripSceneBoilerplate(source: string) {
  return `${source
    .replace(/import \{ DocExampleShell \} from "\.\/DocExampleShell";?\n/, "")
    .replace(/\nexport const preview[\s\S]*$/, "")
    .trimEnd()}\n`
}

export type SceneTemplate = {
  /** Module name, e.g. "SwitchExampleScene". */
  scene: string
  /** Human label, e.g. "Switch". */
  label: string
  source: string
}

/** Turn "ToggleGroupExampleScene" into "Toggle Group". */
function labelForScene(scene: string) {
  return scene
    .replace(/ExampleScene$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
}

/**
 * Every `*ExampleScene` in the checkout, alphabetically — the playground's
 * starter templates. These are full scenes (shell import and `preview` export
 * intact) because the playground evaluates them exactly as the gallery does.
 */
export function listExampleScenes(): SceneTemplate[] {
  const app = getLatticePreviewApp()
  if (!app) {
    return []
  }

  const dir = resolve(app, "src/preview-targets")
  if (!existsSync(dir)) {
    return []
  }

  return readdirSync(dir)
    .filter((file) => file.endsWith("ExampleScene.loom.tsx"))
    .map((file) => file.replace(/\.loom\.tsx$/, ""))
    .sort((a, b) => a.localeCompare(b, "en"))
    .flatMap((scene) => {
      const source = readSceneSource(scene)

      return source ? [{ scene, label: labelForScene(scene), source }] : []
    })
}
