import path from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadPreviewConfig } from "@loom-dev/preview";
import {
  createPreviewVitePlugin,
  createScopedPreviewPlugins,
} from "@loom-dev/preview/vite";
import wasmPluginModule from "vite-plugin-wasm";

const docsSiteUrl = process.env.DOCS_SITE_URL;
const resolvedPreviewConfig = await loadPreviewConfig({ cwd: process.cwd() });
const previewPackageRoot = path.dirname(
  path.dirname(fileURLToPath(import.meta.resolve("@loom-dev/preview"))),
);
const previewRuntimePackageRoot = path.dirname(
  path.dirname(
    fileURLToPath(import.meta.resolve("@loom-dev/preview-runtime")),
  ),
);
const previewRobloxEnvEntry = path.resolve(
  previewPackageRoot,
  "dist/source/robloxEnv.js",
);
const previewRuntimeSourceEntry = path.resolve(
  previewRuntimePackageRoot,
  "src/index.ts",
);
const unresolvedEnvShimPath = path.resolve(
  process.cwd(),
  "src/shims/loom-unresolved-env.ts",
);
const wasm = wasmPluginModule.default ?? wasmPluginModule;
const previewPlugins = createPreviewVitePlugin({
  projectName: resolvedPreviewConfig.projectName,
  reactAliases: resolvedPreviewConfig.reactAliases,
  reactRobloxAliases: resolvedPreviewConfig.reactRobloxAliases,
  runtimeModule: resolvedPreviewConfig.runtimeModule,
  runtimeAliases: resolvedPreviewConfig.runtimeAliases,
  targets: resolvedPreviewConfig.targets,
  transformMode: resolvedPreviewConfig.transformMode,
  workspaceRoot: resolvedPreviewConfig.workspaceRoot,
});
const scopedPreviewPlugins = createScopedPreviewPlugins(
  [wasm()],
  resolvedPreviewConfig,
);

export default defineConfig({
  base: "/",
  ...(docsSiteUrl ? { site: docsSiteUrl } : {}),
  integrations: [mdx(), react()],
  vite: {
    assetsInclude: ["**/*.wasm"],
    optimizeDeps: {
      exclude: [
        "@loom-dev/compiler",
        "@loom-dev/compiler/wasm",
        "@loom-dev/layout-engine",
        "layout-engine",
      ],
    },
    plugins: [
      ...previewPlugins,
      ...scopedPreviewPlugins,
      tailwindcss(),
    ],
    resolve: {
      alias: [
        {
          find: previewRobloxEnvEntry,
          replacement: unresolvedEnvShimPath,
        },
        {
          find: "@loom-dev/preview-runtime",
          replacement: previewRuntimeSourceEntry,
        },
      ],
    },
    server: {
      fs: {
        allow: resolvedPreviewConfig.server.fsAllow,
      },
    },
  },
});
