// Links the sibling checkouts the Loom previews are built from into
// `.preview-src/`, so local development and CI share one path convention:
//
//   .preview-src/loom        → the loom monorepo (provides `loom-dev/embed`)
//   .preview-src/lattice-ui  → the component library whose scenes are previewed
//
// CI checks both repos out at exactly these paths (see .github/workflows), so
// package.json can depend on `loom-dev` through a stable `link:` path. Locally
// they are symlinks to your workspace checkouts; override the sources with the
// LOOM_REPO / LATTICE_REPO env vars.
//
// Idempotent and never fatal: a missing checkout is a warning, and the docs
// still build (without the interactive previews).
import { existsSync, lstatSync, mkdirSync, symlinkSync, unlinkSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
// docsRoot lives at <workspace>/astro/astra-void-docs, so sibling checkouts
// hang off the shared workspace root two levels up.
const workspace = resolve(docsRoot, "../..")
const previewSrc = resolve(docsRoot, ".preview-src")

const links = [
  {
    name: "loom",
    source: process.env.LOOM_REPO ?? resolve(workspace, "typescript/loom-rewrite"),
  },
  {
    name: "lattice-ui",
    source: process.env.LATTICE_REPO ?? resolve(workspace, "rojo/lattice-ui"),
  },
]

mkdirSync(previewSrc, { recursive: true })

for (const { name, source } of links) {
  const target = resolve(previewSrc, name)

  // A CI run checks the real repo out here — never replace a real directory.
  if (existsSync(target) && !lstatSync(target).isSymbolicLink()) {
    console.log(`[link-preview-src] ${name}: real checkout present, leaving it`)
    continue
  }

  if (!existsSync(source)) {
    console.warn(`[link-preview-src] ${name}: no checkout at ${source} — skipping`)
    continue
  }

  if (lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) {
    unlinkSync(target)
  }
  symlinkSync(source, target, "dir")
  console.log(`[link-preview-src] ${name} → ${source}`)
}
