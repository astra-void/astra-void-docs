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
const workspace = resolve(docsRoot, "../../..");

const loomRepo =
  process.env.LOOM_REPO ?? resolve(workspace, "typescript/loom-rewrite");
const latticeApp =
  process.env.LATTICE_PREVIEW_APP ??
  resolve(workspace, "rojo/lattice-ui/apps/loom-preview");
const outDir = resolve(docsRoot, "public/loom-preview");

for (const [label, path] of [
  ["Loom repo", loomRepo],
  ["lattice preview app", latticeApp],
]) {
  if (!existsSync(path)) {
    console.error(
      `[preview:build] ${label} not found at ${path}.\n` +
        "Set LOOM_REPO / LATTICE_PREVIEW_APP env vars to your checkout paths.",
    );
    process.exit(1);
  }
}

console.log(`[preview:build] building lattice previews → ${outDir}`);
execFileSync(
  "pnpm",
  [
    "exec",
    "tsx",
    "packages/cli/src/cli.ts",
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
