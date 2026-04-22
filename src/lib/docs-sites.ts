export type DocsSite = {
	id: string;
	displayName: string;
	rootPath: string;
};

export const DOCS_SITES = [
	{
		id: "lattice-ui",
		displayName: "Lattice UI",
		rootPath: "/lattice-ui",
	},
	{
		id: "loom",
		displayName: "Loom",
		rootPath: "/loom",
	},
	{
		id: "rbxts-tailwind",
		displayName: "Rbxts Tailwind",
		rootPath: "/rbxts-tailwind",
	},
] as const satisfies readonly DocsSite[];

export const DEFAULT_DOCS_SITE_ID = DOCS_SITES[0].id;

function normalizePathname(pathname: string) {
	if (!pathname) {
		return "/";
	}

	return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function normalizeRootPath(rootPath: string) {
	return rootPath.endsWith("/") ? rootPath.slice(0, -1) : rootPath;
}

export function getDocsSiteById(siteId: string) {
	return DOCS_SITES.find((site) => site.id === siteId);
}

export function getActiveDocsSite(pathname: string) {
	const normalizedPathname = normalizePathname(pathname);

	return DOCS_SITES.find((site) => {
		const normalizedRootPath = normalizeRootPath(site.rootPath);
		return (
			normalizedPathname === `${normalizedRootPath}/` ||
			normalizedPathname.startsWith(`${normalizedRootPath}/`)
		);
	});
}

export function getDocsSiteSelectionId(pathname: string) {
	return getActiveDocsSite(pathname)?.id ?? DEFAULT_DOCS_SITE_ID;
}

export function getDocsSiteDisplayName(pathname: string) {
	return getActiveDocsSite(pathname)?.displayName ?? DOCS_SITES[0].displayName;
}

export function getDocsSiteTitle(pathname: string) {
	const activeSite = getActiveDocsSite(pathname);

	return activeSite ? `${activeSite.displayName} Docs` : "Lattice UI Docs";
}

export function getDocsSlugFromPathname(pathname: string) {
	const normalizedPathname = normalizePathname(pathname);
	const activeSite = getActiveDocsSite(normalizedPathname);

	if (activeSite) {
		const normalizedRootPath = normalizeRootPath(activeSite.rootPath);
		const slug = normalizedPathname.slice(`${normalizedRootPath}/`.length);
		return slug.replace(/^\/+/u, "").replace(/\/+$/u, "");
	}

	return normalizedPathname.replace(/^\/+/u, "").replace(/\/+$/u, "");
}

export function getDocsSiteHrefFromPathname(
	pathname: string,
	targetSiteId: string,
) {
	const targetSite = getDocsSiteById(targetSiteId) ?? DOCS_SITES[0];
	const slug = getDocsSlugFromPathname(pathname);

	return slug ? `${targetSite.rootPath}/${slug}/` : `${targetSite.rootPath}/`;
}
