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
    astroExpressiveCode({
      themes: ["vitesse-light", "vitesse-dark"],
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ".dark" : ":root:not(.dark)",
      useDarkModeMediaQuery: false,
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        borderRadius: "0.75rem",
        borderWidth: "1px",
        borderColor: "var(--border)",
        codeFontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
        codeFontSize: "0.8125rem",
        codeLineHeight: "1.7",
        codePaddingBlock: "0.875rem",
        codePaddingInline: "1rem",
        frames: {
          shadowColor: "transparent",
        },
      },
    }),
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
