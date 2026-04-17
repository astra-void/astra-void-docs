import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const EXAMPLES_DIR = join(process.cwd(), "src/examples/components");
const EXAMPLE_EXTENSION = ".tsx";

export type PlaygroundTemplate = {
	slug: string;
	title: string;
	fileName: string;
	sourceCode: string;
};

function startCase(value: string) {
	return value
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export async function getPlaygroundTemplates(): Promise<PlaygroundTemplate[]> {
	const entries = await readdir(EXAMPLES_DIR, { withFileTypes: true });

	const templates = await Promise.all(
		entries
			.filter(
				(entry) => entry.isFile() && entry.name.endsWith(EXAMPLE_EXTENSION),
			)
			.map(async (entry) => {
				const slug = entry.name.slice(0, -EXAMPLE_EXTENSION.length);
				const title = startCase(slug);
				const sourceCode = await readFile(
					join(EXAMPLES_DIR, entry.name),
					"utf8",
				);

				return {
					slug,
					title,
					fileName: entry.name,
					sourceCode,
				};
			}),
	);

	return templates.sort((a, b) => a.title.localeCompare(b.title));
}
