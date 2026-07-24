/**
 * Serves the interactive Loom previews as part of the docs pipeline.
 *
 * The previews are lattice-ui scenes (`*.loom.tsx`) rendered by Loom — the
 * sibling roblox-ts → browser renderer. Loom exposes its gallery
 * programmatically (`loom-dev/embed`), so this integration mounts it instead of
 * shelling out to `loom build` before every docs build:
 *
 * - `astro dev` mounts Loom's Vite server (middleware mode) under
 *   `<base>loom-preview/`, so editing a scene in the lattice checkout hot-reloads
 *   the frame — no regeneration step, nothing stale.
 * - `astro build` emits the same gallery as a static bundle into
 *   `dist/loom-preview/`, which is what `LoomPreview.astro` iframes in
 *   production.
 *
 * Loom keeps its own Vite instance: its plugin aliases `react` and `@rbxts/*`
 * globally, which would hijack the docs' own React if it shared this app's
 * config. The docs only forward HTTP requests to it.
 *
 * The scenes live in a sibling checkout (`.preview-src/lattice-ui`, linked by
 * `pnpm link:preview-src`; CI checks the real repo out at that path). A missing
 * checkout is a warning, not an error — the docs still build, just without live
 * previews. Set PREVIEW_BUILD_STRICT=1 (deploys do) to make it fatal.
 */
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import type { AstroIntegration } from "astro"
import { buildGallery, createGalleryServer, findGalleryTargets } from "loom-dev/embed"
// Relative, not the `@/` alias: this module is loaded while astro.config is
// being evaluated, before that alias exists.
import { getLatticePreviewApp } from "../lib/lattice-source"

/** Where the scenes are, relative to the lattice preview app. */
const TARGETS = "src/preview-targets"

/** Path segment the gallery is mounted under, below the site's own base. */
const MOUNT = "loom-preview/"

type Skip = { reason: string }

/**
 * The lattice preview app, or why it can't be previewed. Kept separate from the
 * hooks so `dev` and `build` report an absent checkout identically.
 */
function resolveGalleryRoot(): string | Skip {
  const app = getLatticePreviewApp()
  if (!app || !existsSync(app)) {
    return {
      reason:
        "no lattice-ui checkout found — run `pnpm link:preview-src`, or set LATTICE_PREVIEW_APP",
    }
  }
  if (findGalleryTargets(app, TARGETS).length === 0) {
    return { reason: `no ${TARGETS}/*.loom.tsx scenes under ${app}` }
  }

  return app
}

/**
 * A missing checkout fails the build only when the caller asked it to. The
 * `[loom-preview]` prefix comes from Astro's own integration logger, so the
 * message here is prefix-free; the thrown error carries it explicitly.
 */
function reportSkip(skip: Skip, warn: (message: string) => void): void {
  if (process.env.PREVIEW_BUILD_STRICT === "1") {
    throw new Error(`[loom-preview] ${skip.reason} (PREVIEW_BUILD_STRICT=1)`)
  }
  warn(`${skip.reason} — building without interactive previews.`)
}

export default function loomPreview(): AstroIntegration {
  // The site's own base (`/` here, but honored so the mount travels with it).
  let base = "/"
  let gallery: Awaited<ReturnType<typeof createGalleryServer>> | undefined

  return {
    name: "loom-preview",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.endsWith("/") ? config.base : `${config.base}/`
      },

      "astro:server:setup": async ({ server, logger }) => {
        const root = resolveGalleryRoot()
        if (typeof root !== "string") {
          reportSkip(root, (message) => logger.warn(message))
          return
        }

        gallery = await createGalleryServer({
          root,
          targets: TARGETS,
          base: `${base}${MOUNT}`,
        })
        // Registered during `astro:server:setup`, so it sits ahead of Astro's own
        // dev handler (which is appended in a post-`configureServer` hook) and
        // wins for `/loom-preview/*`. Everything else falls straight through.
        server.middlewares.use(gallery.middleware)
        logger.info(`serving Loom previews from ${root}`)
      },

      "astro:server:done": async () => {
        await gallery?.close()
        gallery = undefined
      },

      "astro:build:done": async ({ dir, logger }) => {
        const root = resolveGalleryRoot()
        if (typeof root !== "string") {
          reportSkip(root, (message) => logger.warn(message))
          return
        }

        // Assets stay relative (`base: "./"`), so the bundle works under any
        // public path the docs are deployed to.
        const outDir = fileURLToPath(new URL(MOUNT, dir))
        await buildGallery({ root, targets: TARGETS, outDir })
        logger.info(`built Loom previews → ${outDir}`)
      },
    },
  }
}
