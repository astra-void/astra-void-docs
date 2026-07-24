// Links the component library whose scenes the Loom previews render into
// `.preview-src/lattice-ui`, so local development and CI share one path
// convention — CI checks the real repo out at exactly that path (see
// .github/workflows). Locally it is a symlink to your workspace checkout;
// override the source with the LATTICE_REPO env var.
//
// Loom itself is an ordinary npm dependency (`loom-dev`), so no checkout of it
// is needed — and no Rust toolchain either: the published @loom-dev/layout
// ships its wasm engine prebuilt.
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
