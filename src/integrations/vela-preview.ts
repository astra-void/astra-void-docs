/**
 * Serves the interactive Vela previews as part of the docs pipeline.
 *
 * Vela is a compiler, so a preview of it has to be the compiler's own output:
 * each example under `preview/vela/` is lowered by `@vela-rbxts/compiler`
 * and the *result* — ordinary roblox-ts with the `className` attributes gone —
 * is what Loom renders. This integration is the step that connects the two: it
 * writes the lowered scenes into a generated gallery root and mounts that
 * gallery the way `loom-preview` mounts the lattice-ui one.
 *
 * - `astro dev` compiles the examples, mounts Loom's Vite server (middleware
 *   mode) under `<base>vela-preview/`, and re-compiles on every edit, so
 *   changing a class name in an example hot-reloads the frame.
 * - `astro build` compiles them once more and emits the static gallery into
 *   `dist/vela-preview/`.
 *
 * The generated root (`.vela-preview/`) is disposable and gitignored — nothing
 * is authored there. Unlike the lattice previews there is no checkout to find,
 * so these previews cannot be silently skipped; a broken example is a build
 * error (see {@link reportDiagnostics}).
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import { buildGallery, createGalleryServer } from "loom-dev/embed"
// Relative, not the `@/` alias: this module is loaded while astro.config is
// being evaluated, before that alias exists.
import {
  compileVelaScene,
  listVelaScenes,
  listVelaSupportModules,
  readVelaSupportModule,
  velaSceneTarget,
} from "../lib/vela-source"

/** Where the authored examples live, relative to the project root. */
const SOURCE_DIR = "preview/vela"

/** Generated gallery root: lowered scenes only, rewritten on every run. */
const GENERATED_DIR = ".vela-preview"

/** Where the lowered scenes are written inside the generated root. */
const TARGETS = "src/preview-targets"

/** Path segment the gallery is mounted under, below the site's own base. */
const MOUNT = "vela-preview/"

/**
 * Lower every example into the generated gallery root and return the
 * diagnostics the compiler reported, scene by scene.
 */
function emitScenes(): { scene: string; diagnostics: string[] }[] {
  const outDir = resolve(process.cwd(), GENERATED_DIR, TARGETS)
  // The generated tree is derived, never edited: clearing it means a renamed or
  // deleted example cannot leave a stale target behind for the gallery to list.
  rmSync(resolve(process.cwd(), GENERATED_DIR), { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })

  // Vite derives its dep-optimizer cache dir from the nearest package.json
  // above the root. Without one here that is the docs' own package.json, so
  // this gallery and Astro would share `node_modules/.vite/deps` and overwrite
  // each other's entries — which surfaces as `require_react is not a function`
  // inside the preview. A manifest of its own gives the gallery its own cache.
  writeFileSync(
    resolve(process.cwd(), GENERATED_DIR, "package.json"),
    `${JSON.stringify({ name: "vela-preview-gallery", private: true, type: "module" }, undefined, 2)}\n`,
  )

  for (const file of listVelaSupportModules()) {
    writeFileSync(resolve(outDir, file), readVelaSupportModule(file))
  }

  const reports: { scene: string; diagnostics: string[] }[] = []

  for (const name of listVelaScenes()) {
    const scene = compileVelaScene(name)
    if (!scene) continue

    writeFileSync(
      resolve(process.cwd(), GENERATED_DIR, velaSceneTarget(name)),
      scene.gallerySource,
    )

    if (scene.diagnostics.length > 0) {
      reports.push({
        scene: name,
        diagnostics: scene.diagnostics.map(
          (diagnostic) =>
            `${diagnostic.level} ${diagnostic.code}: ${diagnostic.message}`,
        ),
      })
    }
  }

  return reports
}

/**
 * Surface what the compiler said about the docs' own examples. A warning is
 * informational — some examples deliberately show a diagnostic — but an error
 * means the example did not lower at all, which would ship a broken preview.
 */
function reportDiagnostics(
  reports: { scene: string; diagnostics: string[] }[],
  warn: (message: string) => void,
): void {
  const errors: string[] = []

  for (const report of reports) {
    for (const diagnostic of report.diagnostics) {
      const line = `${report.scene}: ${diagnostic}`
      if (diagnostic.startsWith("error")) {
        errors.push(line)
      } else {
        warn(line)
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `[vela-preview] ${errors.length} example(s) failed to lower:\n  ${errors.join("\n  ")}`,
    )
  }
}

export default function velaPreview(): AstroIntegration {
  // The site's own base (`/` here, but honored so the mount travels with it).
  let base = "/"
  let gallery: Awaited<ReturnType<typeof createGalleryServer>> | undefined

  return {
    name: "vela-preview",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.endsWith("/") ? config.base : `${config.base}/`
      },

      "astro:server:setup": async ({ server, logger }) => {
        reportDiagnostics(emitScenes(), (message) => logger.warn(message))

        gallery = await createGalleryServer({
          root: resolve(process.cwd(), GENERATED_DIR),
          targets: TARGETS,
          base: `${base}${MOUNT}`,
        })
        // Registered during `astro:server:setup`, so it sits ahead of Astro's
        // own dev handler and wins for `/vela-preview/*`.
        server.middlewares.use(gallery.middleware)

        // Editing an example re-runs the compiler; the generated file changing
        // is what the gallery's own watcher picks up, so the frame hot-reloads
        // with the new lowering.
        const sourceDir = resolve(process.cwd(), SOURCE_DIR)
        server.watcher.add(sourceDir)
        const recompile = (path: string) => {
          if (!path.startsWith(sourceDir)) return
          try {
            reportDiagnostics(emitScenes(), (message) => logger.warn(message))
          } catch (error) {
            // A bad edit should not take the dev server down with it.
            logger.error(error instanceof Error ? error.message : String(error))
          }
        }
        server.watcher.on("change", recompile)
        server.watcher.on("add", recompile)
        server.watcher.on("unlink", recompile)

        logger.info(`serving Vela previews from ${SOURCE_DIR}`)
      },

      "astro:server:done": async () => {
        await gallery?.close()
        gallery = undefined
      },

      "astro:build:done": async ({ dir, logger }) => {
        reportDiagnostics(emitScenes(), (message) => logger.warn(message))

        // Assets stay relative (`base: "./"`), so the bundle works under any
        // public path the docs are deployed to.
        const outDir = fileURLToPath(new URL(MOUNT, dir))
        await buildGallery({
          root: resolve(process.cwd(), GENERATED_DIR),
          targets: TARGETS,
          outDir,
        })
        logger.info(`built Vela previews → ${outDir}`)
      },
    },
  }
}
