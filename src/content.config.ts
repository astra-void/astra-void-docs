import { defineCollection, z } from "astro:content";

export const collections = {
  docs: defineCollection({
    type: "content",
    schema: z.object({
      title: z.string(),
      description: z.string(),
      draft: z.boolean().default(false),
      sidebar: z
        .object({
          order: z.number().optional(),
        })
        .optional(),
    }),
  }),
};
