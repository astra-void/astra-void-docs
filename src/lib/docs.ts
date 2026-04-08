import { getCollection, type CollectionEntry } from "astro:content";

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

export type DocEntry = CollectionEntry<"docs">;

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

export async function getDocsShellData(currentPath: string) {
  const docs = await getDocs();
  const currentIndex = docs.findIndex((doc) => doc.path === currentPath);

  if (currentIndex === -1) {
    throw new Error(`Unknown docs path: ${currentPath}`);
  }

  return {
    currentPage: docs[currentIndex],
    homePage: docs.find((doc) => doc.path === ""),
    sections: groupSidebarSections(docs),
    previousPage: docs[currentIndex - 1],
    nextPage: docs[currentIndex + 1],
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
