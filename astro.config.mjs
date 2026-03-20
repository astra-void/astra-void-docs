import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const docsSiteUrl = process.env.DOCS_SITE_URL;

export default defineConfig({
  base: "/",
  ...(docsSiteUrl ? { site: docsSiteUrl } : {}),
  integrations: [
    starlight({
      title: "Lattice UI Docs",
      tagline:
        "Headless Roblox UI primitives with a coherent style and system layer.",
      description:
        "Documentation for Lattice UI: headless primitives, style and system foundations, and practical implementation guides for Roblox UI.",
      customCss: ["./src/styles/docs-theme.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/astra-void/astra-void-docs",
        },
      ],
      prerender: true,
      sidebar: [
        {
          label: "Home",
          link: "/",
        },
        {
          label: "Getting Started",
          autogenerate: {
            directory: "getting-started",
          },
        },
        {
          label: "CLI",
          autogenerate: {
            directory: "cli",
          },
        },
        {
          label: "Components",
          autogenerate: {
            directory: "components",
          },
        },
        {
          label: "Reference",
          autogenerate: {
            directory: "reference",
          },
        },
      ],
    }),
  ],
});
