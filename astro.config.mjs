import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import loomPreview from "./src/integrations/loom-preview";
import velaPreview from "./src/integrations/vela-preview";
import astroExpressiveCode from "astro-expressive-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  site: "https://docs.astra-void.xyz",
  base: "/",
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["docs-heading-anchor"],
          },
        },
      ],
    ],
  },
  integrations: [
    // Expressive Code options live in ec.config.mjs so the <Code> component
    // can be used in .astro files.
    astroExpressiveCode(),
    mdx(),
    react(),
    // Mounts Loom's own Vite server for the interactive component previews in
    // dev, and emits the static gallery into dist/loom-preview/ on build.
    loomPreview(),
    // Lowers the Vela examples in preview/vela/ with the real compiler and
    // serves the result as a second gallery (dist/vela-preview/ after a build).
    velaPreview(),
  ],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      // The playground's wasm compiler locates its own payload relative to
      // `import.meta.url`. Pre-bundling would move the glue into
      // node_modules/.vite/deps and leave the .wasm behind.
      exclude: ["@vela-rbxts/compiler-wasm"],
    },
    plugins: [tailwindcss()],
  },
});
