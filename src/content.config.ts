import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import * as z from "astro/zod";

const packageDocLinkSchema = z.object({
	label: z.string(),
	href: z.string(),
});

const packageDocEntrySchema = z.object({
	name: z.string(),
	description: z.string(),
});

const packageDocPatternSchema = z.object({
	title: z.string(),
	description: z.string(),
});

const packageDocSchema = z.object({
	whatItIsFor: z.array(z.string()),
	stateModel: z.array(z.string()),
	keyApi: z.array(packageDocEntrySchema),
	compositionPatterns: z.array(packageDocPatternSchema),
	cautions: z.array(z.string()),
	related: z.array(packageDocLinkSchema),
	hasLiveDemo: z.boolean().optional(),
});

export const collections = {
	docs: defineCollection({
		loader: glob({
			pattern: "**/*.{md,mdx}",
			base: "./src/content/docs",
		}),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			draft: z.boolean().default(false),
			proseDensity: z.enum(["default", "compact"]).default("default"),
			versionBasis: z.enum(["main", "stable"]).default("main"),
			sidebar: z
				.object({
					order: z.number().optional(),
				})
				.optional(),
			packageDoc: packageDocSchema.optional(),
		}),
	}),
	rbxtsTailwindDocs: defineCollection({
		loader: glob({
			pattern: "**/*.{md,mdx}",
			base: "./src/content/docs/rbxts-tailwind",
		}),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			draft: z.boolean().default(false),
			proseDensity: z.enum(["default", "compact"]).default("default"),
			versionBasis: z.enum(["main", "stable"]).default("main"),
			sidebar: z
				.object({
					order: z.number().optional(),
				})
				.optional(),
			packageDoc: packageDocSchema.optional(),
		}),
	}),
};
