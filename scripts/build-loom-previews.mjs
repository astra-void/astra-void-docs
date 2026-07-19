// Builds the interactive lattice-ui Loom previews into `public/loom-preview/`.
//
// Loom (the sibling roblox-ts → browser renderer) bundles the lattice preview
// targets into a static, client-only SPA the docs iframe deep-links per scene.
// The output is generated (gitignored); run `pnpm preview:build` before `dev`
// or `build` when you want the live previews present.
//
// Paths are resolved relative to sibling workspaces; override with env vars
// LOOM_REPO / LATTICE_PREVIEW_APP if your checkout differs.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, "..");
// docsRoot lives at <workspace>/astro/astra-void-docs, so the shared workspace
// root is two levels up. Sibling checkouts (loom-rewrite, lattice-ui) hang off it.
const workspace = resolve(docsRoot, "../..");

const loomRepo =
  process.env.LOOM_REPO ?? resolve(workspace, "typescript/loom-rewrite");
const latticeApp =
  process.env.LATTICE_PREVIEW_APP ??
  resolve(workspace, "rojo/lattice-ui/apps/loom-preview");
const outDir = resolve(docsRoot, "public/loom-preview");

// Chained ahead of `dev`/`build`, so a missing sibling checkout (CI, a fresh
// clone) must be a graceful skip rather than a hard failure — the docs still
// build, just without regenerated previews. Pass PREVIEW_BUILD_STRICT=1 to make
// a missing checkout fatal (e.g. a release build that must include previews).
const strict = process.env.PREVIEW_BUILD_STRICT === "1";
for (const [label, path] of [
  ["Loom repo", loomRepo],
  ["lattice preview app", latticeApp],
]) {
  if (!existsSync(path)) {
    const message =
      `[preview:build] ${label} not found at ${path}.\n` +
      "Set LOOM_REPO / LATTICE_PREVIEW_APP env vars to your checkout paths.";
    if (strict) {
      console.error(message);
      process.exit(1);
    }
    console.warn(`${message}\n[preview:build] skipping preview build.`);
    process.exit(0);
  }
}

console.log(`[preview:build] building lattice previews → ${outDir}`);
// Run through the loom CLI package (`loom-dev`) so `tsx` resolves from that
// package's own bin — a bare `pnpm exec tsx` at the repo root relies on
// hoisting that a fresh CI `--frozen-lockfile` install doesn't guarantee.
execFileSync(
  "pnpm",
  [
    "--filter",
    "loom-dev",
    "exec",
    "tsx",
    "src/cli.ts",
    "build",
    latticeApp,
    "--targets",
    "src/preview-targets",
    "--out",
    outDir,
    "--base",
    "./",
  ],
  { cwd: loomRepo, stdio: "inherit" },
);
console.log("[preview:build] done.");
