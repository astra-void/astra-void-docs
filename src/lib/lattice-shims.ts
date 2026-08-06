/**
 * `@lattice-ui/*` → the checkout's package sources, as Loom `shims`.
 *
 * A generated gallery root sits outside the lattice workspace, so nothing
 * resolves `@lattice-ui/react-switch` there the way it does for the lattice
 * gallery (whose root *is* inside that workspace), and Loom's Vite plugin has
 * no tsconfig-paths support. `shims` are plain Vite aliases matched exactly, so
 * pointing each package id at its `src/index.ts` in the same checkout the
 * lattice previews already come from closes the gap without adding a
 * dependency.
 *
 * Shared by the Vela and Facet galleries, which both render examples built on
 * Lattice primitives. Empty when there is no checkout — an example that uses no
 * Lattice primitive keeps working, and one that does fails the same way a
 * missing checkout fails the lattice gallery: a 404 on the target module and
 * `Failed to resolve import` in the server log, not a browser error.
 */
import { existsSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { getLatticePreviewApp } from "./lattice-source"

export function getLatticeShims(): Record<string, string> {
  const app = getLatticePreviewApp()
  if (!app) {
    return {}
  }

  // <checkout>/apps/loom-preview → <checkout>/packages/react.
  const packagesDir = resolve(app, "../../packages/react")
  if (!existsSync(packagesDir)) {
    return {}
  }

  const shims: Record<string, string> = {}
  for (const name of readdirSync(packagesDir)) {
    const entry = resolve(packagesDir, name, "src/index.ts")
    if (existsSync(entry)) {
      shims[`@lattice-ui/react-${name}`] = entry
    }
  }

  return shims
}
