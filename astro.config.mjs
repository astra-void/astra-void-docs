import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const docsSiteUrl = process.env.DOCS_SITE_URL;

export default defineConfig({
  base: "/",
  ...(docsSiteUrl ? { site: docsSiteUrl } : {}),
  integrations: [
    starlight({
      title: "Astra Void Docs",
      tagline: "Shared documentation hub for Astra Void projects and tools.",
      description:
        "General documentation hub for Astra Void projects, packages, and workflows.",
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
          label: "Introduction",
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
