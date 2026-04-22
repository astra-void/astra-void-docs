import { getCollection } from "astro:content";

export const DOCS_SITE = {
	title: "Lattice UI Docs",
	description:
		"Documentation for Lattice UI: headless primitives, style and system foundations, and practical implementation guides for Roblox UI.",
	githubUrl: "https://github.com/astra-void/lattice-ui",
} as const;

const SECTION_CONFIG = [
	{ key: "home", title: "Home", slug: "", order: 0 },
	{
		key: "getting-started",
		title: "Getting Started",
		slug: "getting-started",
		order: 1,
	},
	{ key: "cli", title: "CLI", slug: "cli", order: 2 },
	{ key: "components", title: "Components", slug: "components", order: 3 },
	{ key: "reference", title: "Reference", slug: "reference", order: 4 },
] as const;

export type DocEntry = {
	id: string;
	body?: string;
	data: {
		title: string;
		description: string;
		draft: boolean;
		proseDensity: "default" | "compact";
		versionBasis: "main" | "stable";
		sidebar?: {
			order?: number;
		};
		packageDoc?: {
			whatItIsFor: string[];
			stateModel: string[];
			keyApi: {
				name: string;
				description: string;
			}[];
			compositionPatterns: {
				title: string;
				description: string;
			}[];
			cautions: string[];
			related: {
				label: string;
				href: string;
			}[];
			hasLiveDemo?: boolean;
		};
	};
};

export type DocPage = {
	entry: DocEntry;
	id: string;
	path: string;
	url: string;
	title: string;
	description: string;
	versionBasis: "main" | "stable";
	sectionKey: string;
	sectionTitle: string;
	sectionOrder: number;
	sidebarOrder: number;
	isSectionIndex: boolean;
};

export type SidebarSection = {
	key: string;
	title: string;
	url?: string;
	entries: DocPage[];
};

export type DocsShellData = {
	currentPage: DocPage;
	homePage?: DocPage;
	sections: SidebarSection[];
	previousPage?: DocPage;
	nextPage?: DocPage;
};

export function getDocPathFromId(id: string) {
	const withoutExtension = id.replace(/\.(md|mdx)$/u, "");

	if (withoutExtension === "index") {
		return "";
	}

	return withoutExtension.replace(/\/index$/u, "");
}

export function getDocUrl(path: string) {
	return path ? `/${path}/` : "/";
}

function normalizeBasePath(basePath: string) {
	if (!basePath || basePath === "/") {
		return "";
	}

	return basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
}

function prefixUrl(url: string, basePath: string) {
	const normalizedBasePath = normalizeBasePath(basePath);

	if (!normalizedBasePath) {
		return url;
	}

	return url === "/" ? `${normalizedBasePath}/` : `${normalizedBasePath}${url}`;
}

function prefixDocPage(page: DocPage, basePath: string): DocPage {
	return {
		...page,
		url: prefixUrl(page.url, basePath),
	};
}

function prefixSidebarSection(section: SidebarSection, basePath: string) {
	return {
		...section,
		url: section.url ? prefixUrl(section.url, basePath) : undefined,
		entries: section.entries.map((entry) => prefixDocPage(entry, basePath)),
	};
}

function startCase(value: string) {
	return value
		.split(/[-_/]/u)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function getSectionMeta(path: string) {
	if (!path) {
		return SECTION_CONFIG[0];
	}

	const topLevelSegment = path.split("/")[0];
	const knownSection = SECTION_CONFIG.find(
		(section) => section.slug === topLevelSegment,
	);

	if (knownSection) {
		return knownSection;
	}

	return {
		key: topLevelSegment,
		title: startCase(topLevelSegment),
		slug: topLevelSegment,
		order: SECTION_CONFIG.length,
	};
}

function toDocPage(entry: DocEntry): DocPage {
	const path = getDocPathFromId(entry.id);
	const section = getSectionMeta(path);

	return {
		entry,
		id: entry.id,
		path,
		url: getDocUrl(path),
		title: entry.data.title,
		description: entry.data.description,
		versionBasis: entry.data.versionBasis,
		sectionKey: section.key,
		sectionTitle: section.title,
		sectionOrder: section.order,
		sidebarOrder: entry.data.sidebar?.order ?? Number.MAX_SAFE_INTEGER,
		isSectionIndex:
			!path || path.endsWith(`/${section.slug}`) || path === section.slug,
	};
}

function compareDocs(a: DocPage, b: DocPage) {
	if (a.sectionOrder !== b.sectionOrder) {
		return a.sectionOrder - b.sectionOrder;
	}

	if (a.isSectionIndex !== b.isSectionIndex) {
		return a.isSectionIndex ? -1 : 1;
	}

	if (a.sidebarOrder !== b.sidebarOrder) {
		return a.sidebarOrder - b.sidebarOrder;
	}

	return a.title.localeCompare(b.title) || a.path.localeCompare(b.path);
}

function groupSidebarSections(docs: DocPage[]) {
	const sections = new Map<string, SidebarSection>();

	for (const doc of docs) {
		if (doc.sectionKey === "home") {
			continue;
		}

		const existing = sections.get(doc.sectionKey);

		if (!existing) {
			sections.set(doc.sectionKey, {
				key: doc.sectionKey,
				title: doc.sectionTitle,
				url: doc.isSectionIndex ? doc.url : undefined,
				entries: doc.isSectionIndex ? [] : [doc],
			});
			continue;
		}

		if (doc.isSectionIndex) {
			existing.url = doc.url;
		} else {
			existing.entries.push(doc);
		}
	}

	return [...sections.values()].sort((a, b) => {
		const aOrder =
			docs.find((doc) => doc.sectionKey === a.key)?.sectionOrder ?? 999;
		const bOrder =
			docs.find((doc) => doc.sectionKey === b.key)?.sectionOrder ?? 999;
		return aOrder - bOrder || a.title.localeCompare(b.title);
	});
}

export async function getDocs() {
	const entries = await getCollection("docs", ({ data }) => !data.draft);
	return entries.map(toDocPage).sort(compareDocs);
}

export async function getDocByPath(path: string) {
	const docs = await getDocs();
	return docs.find((doc) => doc.path === path);
}

export async function getDocsShellData(
	currentPath: string,
	basePath = "",
): Promise<DocsShellData> {
	const docs = await getDocs();
	const currentIndex = docs.findIndex((doc) => doc.path === currentPath);

	if (currentIndex === -1) {
		throw new Error(`Unknown docs path: ${currentPath}`);
	}

	return {
		currentPage: prefixDocPage(docs[currentIndex], basePath),
		homePage: docs.find((doc) => doc.path === "")
			? prefixDocPage(docs.find((doc) => doc.path === "")!, basePath)
			: undefined,
		sections: groupSidebarSections(docs).map((section) =>
			prefixSidebarSection(section, basePath),
		),
		previousPage: docs[currentIndex - 1]
			? prefixDocPage(docs[currentIndex - 1], basePath)
			: undefined,
		nextPage: docs[currentIndex + 1]
			? prefixDocPage(docs[currentIndex + 1], basePath)
			: undefined,
	};
}

export function isCurrentPath(currentPath: string, targetPath: string) {
	return currentPath === targetPath;
}

export function isSectionActive(currentPath: string, section: SidebarSection) {
	if (!section.url) {
		return currentPath.startsWith(`${section.key}/`);
	}

	const normalizedSectionPath =
		section.url === "/" ? "" : section.url.slice(1, -1);
	return (
		currentPath === normalizedSectionPath ||
		currentPath.startsWith(`${normalizedSectionPath}/`)
	);
}
