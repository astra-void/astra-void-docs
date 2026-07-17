import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
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
  ],
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [tailwindcss()],
  },
});
