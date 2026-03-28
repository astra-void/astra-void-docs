import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const docsSiteUrl = process.env.DOCS_SITE_URL;

export default defineConfig({
  base: "/",
  ...(docsSiteUrl ? { site: docsSiteUrl } : {}),
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
