import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.mdx" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    product: z.enum(["lattice-ui"]).default("lattice-ui"),
    draft: z.boolean().default(false),
    section: z.enum([
      "home",
      "getting-started",
      "components",
      "guides",
      "reference",
    ]),
    sidebar: z
      .object({
        order: z.number().int().optional(),
      })
      .optional(),
  }),
});

export const collections = {
  docs,
};
