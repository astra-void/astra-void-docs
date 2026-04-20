import { getDocs, type DocPage } from "./docs";

const MAX_SEARCH_TEXT_CHARS = 9_000;
const MAX_HEADING_ENTRIES = 16;

export type DocsSearchIndexEntry = {
	id: string;
	path: string;
	url: string;
	title: string;
	description: string;
	section: string;
	headings: string[];
	text: string;
};

export type DocsSearchIndex = {
	generatedAt: string;
	entries: DocsSearchIndexEntry[];
};

function collapseWhitespace(value: string) {
	return value.replace(/\s+/gu, " ").trim();
}

function stripCodeFences(value: string) {
	return value.replace(/```[\s\S]*?```/gu, " ").replace(/~~~[\s\S]*?~~~/gu, " ");
}

function stripInlineCode(value: string) {
	return value.replace(/`([^`]+)`/gu, "$1");
}

function stripMarkdownDecorators(value: string) {
	return value
		.replace(/!\[[^\]]*\]\([^)]*\)/gu, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
		.replace(/\*\*([^*]+)\*\*/gu, "$1")
		.replace(/__([^_]+)__/gu, "$1")
		.replace(/~~([^~]+)~~/gu, "$1");
}

function stripMdxAndHtml(value: string) {
	return value
		.replace(/^\s*(import|export)\s.+$/gmu, " ")
		.replace(/\{\/\*[\s\S]*?\*\/\}/gu, " ")
		.replace(/\{[^{}]{1,160}\}/gu, " ")
		.replace(/<!--[\s\S]*?-->/gu, " ")
		.replace(/<[^>]+>/gu, " ");
}

function stripMarkdownStructure(value: string) {
	return value
		.replace(/^\s{0,3}#{1,6}\s+/gmu, "")
		.replace(/^\s{0,3}>\s?/gmu, "")
		.replace(/^\s{0,3}[-*+]\s+/gmu, "")
		.replace(/^\s{0,3}\d+\.\s+/gmu, "");
}

function normalizeSearchSource(value: string) {
	const normalized = stripMarkdownStructure(
		stripMdxAndHtml(stripMarkdownDecorators(stripInlineCode(value))),
	);
	return collapseWhitespace(normalized);
}

function cleanHeadingText(value: string) {
	return collapseWhitespace(
		stripMarkdownDecorators(stripInlineCode(value)).replace(/<[^>]+>/gu, " "),
	);
}

function extractHeadings(value: string) {
	const headings = new Set<string>();

	for (const match of value.matchAll(/^\s{0,3}#{2,6}\s+(.+)$/gmu)) {
		const heading = cleanHeadingText(match[1].replace(/\s+#+\s*$/gu, ""));
		if (heading) {
			headings.add(heading);
		}
	}

	for (const match of value.matchAll(/<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/giu)) {
		const heading = cleanHeadingText(match[1]);
		if (heading) {
			headings.add(heading);
		}
	}

	return [...headings].slice(0, MAX_HEADING_ENTRIES);
}

function flattenTextValues(value: unknown, output: string[]) {
	if (typeof value === "string") {
		const next = collapseWhitespace(value);
		if (next) {
			output.push(next);
		}
		return;
	}

	if (typeof value === "number") {
		output.push(String(value));
		return;
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			flattenTextValues(item, output);
		}
		return;
	}

	if (!value || typeof value !== "object") {
		return;
	}

	for (const nested of Object.values(value)) {
		flattenTextValues(nested, output);
	}
}

function collectPackageDocText(doc: DocPage) {
	const packageDoc = doc.entry.data.packageDoc;
	if (!packageDoc) {
		return "";
	}

	const values: string[] = [];
	flattenTextValues(packageDoc, values);
	return values.join(" ");
}

function buildSearchText(doc: DocPage) {
	const bodyWithoutCode = stripCodeFences(doc.entry.body ?? "");
	const headings = extractHeadings(bodyWithoutCode);
	const normalizedBody = normalizeSearchSource(bodyWithoutCode);
	const packageDocText = normalizeSearchSource(collectPackageDocText(doc));
	const text = collapseWhitespace(
		[normalizedBody, packageDocText].filter(Boolean).join(" "),
	);

	return {
		headings,
		text: text.slice(0, MAX_SEARCH_TEXT_CHARS),
	};
}

export async function buildDocsSearchIndex(): Promise<DocsSearchIndex> {
	const docs = await getDocs();
	const entries: DocsSearchIndexEntry[] = docs.map((doc) => {
		const { headings, text } = buildSearchText(doc);
		return {
			id: doc.path || "index",
			path: doc.path,
			url: doc.url,
			title: doc.title,
			description: doc.description,
			section: doc.sectionTitle,
			headings,
			text,
		};
	});

	return {
		generatedAt: new Date().toISOString(),
		entries,
	};
}
