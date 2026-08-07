/**
 * Serves the interactive Facet previews as part of the docs pipeline.
 *
 * A Facet component is a Lattice primitive wearing Vela classes, so a preview
 * of one needs both halves of what the other two galleries do: the Vela
 * compiler has to lower the classes, and Loom has to resolve the Lattice
 * packages from a checkout. This integration assembles a small project out of
 * three sources and mounts it as a third gallery.
 *
 * What goes into the generated root:
 * - every file from the Facet checkout's `registry/src`, lowered with the same
 *   resolved config `facet init` would write, with `~/` imports rewritten to
 *   relative paths — which is exactly what lands in a project that ran
 *   `facet add`
 * - the docs' own scenes from `preview/facet/`, lowered the same way
 * - the stage they import, verbatim
 *
 * Lowering the registry files is the part that is not optional. Only the file
 * the compiler is handed gets its `className` lowered, and a Facet component's
 * entire appearance lives in its own class strings — lower the scene alone and
 * the gallery renders a tree of unstyled grey Roblox defaults.
 *
 * Unlike the Vela gallery, this one *can* be skipped: the registry sources come
 * from a checkout, so a machine without one builds the docs without Facet
 * previews. `PREVIEW_BUILD_STRICT=1` turns that into a build failure, which is
 * what deploys run with.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import { buildGallery, createGalleryServer } from "loom-dev/embed"
// Relative, not the `@/` alias: this module is loaded while astro.config is
// being evaluated, before that alias exists.
import {
  compileFacetScene,
  FACET_MODE_MODULE,
  facetModeModule,
  facetSceneTarget,
  facetShims,
  getFacetCheckout,
  listFacetScenes,
  listFacetSupportModules,
  listRegistryFilesBuilt,
  PREVIEW_MODES,
  readFacetSupportModule,
  readFacetCheckoutVersion,
} from "../lib/facet-source"
import { getLatticeShims } from "../lib/lattice-shims"

/** Where the authored examples live, relative to the project root. */
const SOURCE_DIR = "preview/facet"

/** Generated gallery root: derived output only, rewritten on every run. */
const GENERATED_DIR = ".facet-preview"

/** Where the lowered scenes are written inside the generated root. */
const TARGETS = "src/preview-targets"

/** Path segment the gallery is mounted under, below the site's own base. */
const MOUNT = "facet-preview/"

/** Version the docs' Facet pages are written against. */
const DOCUMENTED_VERSION = "0.3.1"

type Report = { scene: string; diagnostics: string[] }

/**
 * Write the whole generated project and return what the compiler said about
 * each file it lowered.
 */
function emit(): Report[] {
  const root = resolve(process.cwd(), GENERATED_DIR)
  // The generated tree is derived, never edited: clearing it means a renamed or
  // deleted example cannot leave a stale target behind for the gallery to list.
  rmSync(root, { recursive: true, force: true })
  mkdirSync(resolve(root, TARGETS), { recursive: true })

  // Vite derives its dep-optimizer cache dir from the nearest package.json
  // above the root. Without one here that is the docs' own package.json, and
  // this gallery would share `node_modules/.vite/deps` with Astro and the other
  // two galleries — which surfaces inside the preview as
  // `require_react is not a function`, not as anything the build reports.
  writeFileSync(
    resolve(root, "package.json"),
    `${JSON.stringify({ name: "facet-preview-gallery", private: true, type: "module" }, undefined, 2)}\n`,
  )

  const reports: Report[] = []
  const describe = (diagnostics: { level: string; code: string; message: string }[]) =>
    diagnostics.map(
      (diagnostic) =>
        `${diagnostic.level} ${diagnostic.code}: ${diagnostic.message}`,
    )

  for (const file of listFacetSupportModules()) {
    writeFileSync(resolve(root, TARGETS, file), readFacetSupportModule(file))
  }

  // Each mode is a separate lowering of the same sources — see PREVIEW_MODES.
  for (const mode of PREVIEW_MODES) {
    mkdirSync(resolve(root, "src", mode), { recursive: true })
    writeFileSync(
      resolve(root, "src", mode, FACET_MODE_MODULE),
      facetModeModule(mode),
    )

    // The registry components, laid out the way `facet add` lays them out,
    // under a directory of their own so the two modes never import each other.
    for (const file of listRegistryFilesBuilt(mode)) {
      const target = resolve(root, "src", mode, file.path)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, file.emitted)

      if (file.diagnostics.length > 0) {
        reports.push({
          scene: `${mode}/${file.path}`,
          diagnostics: describe(file.diagnostics),
        })
      }
    }

    for (const name of listFacetScenes()) {
      const scene = compileFacetScene(name, mode)
      if (!scene) continue

      writeFileSync(
        resolve(root, facetSceneTarget(name, mode)),
        scene.gallerySource,
      )

      // One report per scene, not one per scene per mode: the two lowerings
      // differ in colour values, and every diagnostic worth reading is about
      // the class list, which is the same in both.
      if (scene.diagnostics.length > 0 && mode === PREVIEW_MODES[0]) {
        reports.push({ scene: name, diagnostics: describe(scene.diagnostics) })
      }
    }
  }

  return reports
}

/**
 * Surface what the compiler said. A warning is informational; an error means
 * the file did not lower at all, which would ship a broken preview.
 */
function reportDiagnostics(
  reports: Report[],
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
      `[facet-preview] ${errors.length} file(s) failed to lower:\n  ${errors.join("\n  ")}`,
    )
  }
}

/** Loom needs both scopes: Lattice for behavior, Facet for the variant runtime. */
function shims() {
  return { ...getLatticeShims(), ...facetShims() }
}

/**
 * Whether there is anything to serve, warning once about why not.
 *
 * A missing checkout is a soft skip locally — the rest of the docs build
 * unchanged — and a hard failure under `PREVIEW_BUILD_STRICT`, which is what
 * deploys set, because shipping the Facet pages without their previews is a
 * regression nobody would notice from the build log.
 */
function ensureCheckout(warn: (message: string) => void): boolean {
  if (getFacetCheckout()) {
    const version = readFacetCheckoutVersion()
    if (version && version !== DOCUMENTED_VERSION) {
      warn(
        `checkout is on ${version}, the Facet docs are written against ${DOCUMENTED_VERSION} — ` +
          "check the version markers on /facet before shipping.",
      )
    }
    return true
  }

  const message =
    "no Facet checkout at .preview-src/facet — skipping the Facet previews. " +
    "Run `pnpm link:preview-src`, or set FACET_REPO."

  if (process.env.PREVIEW_BUILD_STRICT === "1") {
    throw new Error(`[facet-preview] ${message}`)
  }

  warn(message)
  return false
}

export default function facetPreview(): AstroIntegration {
  // The site's own base (`/` here, but honored so the mount travels with it).
  let base = "/"
  let gallery: Awaited<ReturnType<typeof createGalleryServer>> | undefined

  return {
    name: "facet-preview",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.endsWith("/") ? config.base : `${config.base}/`
      },

      "astro:server:setup": async ({ server, logger }) => {
        if (!ensureCheckout((message) => logger.warn(message))) {
          return
        }

        reportDiagnostics(emit(), (message) => logger.warn(message))

        gallery = await createGalleryServer({
          root: resolve(process.cwd(), GENERATED_DIR),
          targets: TARGETS,
          base: `${base}${MOUNT}`,
          shims: shims(),
        })
        // Registered during `astro:server:setup`, so it sits ahead of Astro's
        // own dev handler and wins for `/facet-preview/*`.
        server.middlewares.use(gallery.middleware)

        // Editing a scene *or* a registry component in the checkout re-runs the
        // compiler; the generated file changing is what the gallery's own
        // watcher picks up, so the frame hot-reloads with the new lowering.
        const watched = [resolve(process.cwd(), SOURCE_DIR)]
        const checkout = getFacetCheckout()
        if (checkout) {
          watched.push(resolve(checkout, "registry/src"))
        }
        for (const dir of watched) {
          server.watcher.add(dir)
        }

        const recompile = (path: string) => {
          if (!watched.some((dir) => path.startsWith(dir))) return
          try {
            reportDiagnostics(emit(), (message) => logger.warn(message))
          } catch (error) {
            // A bad edit should not take the dev server down with it.
            logger.error(error instanceof Error ? error.message : String(error))
          }
        }
        server.watcher.on("change", recompile)
        server.watcher.on("add", recompile)
        server.watcher.on("unlink", recompile)

        logger.info(`serving Facet previews from ${SOURCE_DIR}`)
      },

      "astro:server:done": async () => {
        await gallery?.close()
        gallery = undefined
      },

      "astro:build:done": async ({ dir, logger }) => {
        if (!ensureCheckout((message) => logger.warn(message))) {
          return
        }

        reportDiagnostics(emit(), (message) => logger.warn(message))

        // Assets stay relative (`base: "./"`), so the bundle works under any
        // public path the docs are deployed to.
        const outDir = fileURLToPath(new URL(MOUNT, dir))
        await buildGallery({
          root: resolve(process.cwd(), GENERATED_DIR),
          targets: TARGETS,
          outDir,
          shims: shims(),
        })
        logger.info(`built Facet previews → ${outDir}`)
      },
    },
  }
}
