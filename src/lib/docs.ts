import { getCollection, type CollectionEntry } from "astro:content"

export type DocsProductId = "lattice-ui" | "vela-rbxts"

export type DocsProduct = {
  id: DocsProductId
  title: string
  shortTitle: string
  description: string
  href: string
  githubUrl: string
}

export const DOCS_PRODUCTS = {
  "lattice-ui": {
    id: "lattice-ui",
    title: "Lattice UI",
    shortTitle: "Lattice",
    description: "Headless Roblox UI primitives for rbxts/react interfaces.",
    href: "/lattice-ui/",
    githubUrl: "https://github.com/astra-void/lattice-ui",
  },
  "vela-rbxts": {
    id: "vela-rbxts",
    title: "Vela",
    shortTitle: "Vela",
    description:
      "Tailwind-style className compilation for roblox-ts React interfaces.",
    href: "/vela-rbxts/",
    githubUrl: "https://github.com/astra-void/vela-rbxts",
  },
} as const satisfies Record<DocsProductId, DocsProduct>

export const DOCS_PRODUCT_ORDER = [
  "lattice-ui",
  "vela-rbxts",
] as const satisfies readonly DocsProductId[]

export const DEFAULT_DOCS_PRODUCT = DOCS_PRODUCTS["lattice-ui"]

const SECTION_ORDER = [
  "home",
  "getting-started",
  "components",
  "guides",
  "reference",
] as const

export type DocsSection = (typeof SECTION_ORDER)[number]

export type DocNavItem = {
  id: string
  title: string
  description: string
  section: DocsSection
  path: string
  url: string
  sidebarOrder?: number
  sidebarGroup?: string
}

export type DocsSectionSubgroup = {
  label?: string
  items: DocNavItem[]
}

export type DocsSectionGroup = {
  key: DocsSection
  label: string
  items: DocNavItem[]
  subgroups?: DocsSectionSubgroup[]
}

export const COMPONENT_GROUP_ORDER = ["Form", "Overlays", "Display"] as const

export type DocsShellData = {
  product: DocsProduct
  docs: DocNavItem[]
  sections: DocsSectionGroup[]
  current?: DocNavItem
  previous?: DocNavItem
  next?: DocNavItem
}

const SECTION_LABELS: Record<DocsSection, string> = {
  home: "Overview",
  "getting-started": "Getting started",
  components: "Components",
  guides: "Guides",
  reference: "Reference",
}

function getProduct(productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id) {
  return DOCS_PRODUCTS[productId]
}

function normalizePath(path: string, product: DocsProduct) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  if (!path || path === "/") {
    return product.href
  }

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`

  if (
    withLeadingSlash === product.href ||
    withLeadingSlash === `${product.href}/`
  ) {
    return product.href
  }

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`
}

function getSectionRootPath(product: DocsProduct, section: DocsSection) {
  return section === "home" ? product.href : `${product.href}${section}/`
}

function getSidebarOrder(doc: DocNavItem) {
  return doc.sidebarOrder ?? Number.MAX_SAFE_INTEGER
}

function getSidebarGroupOrder(doc: DocNavItem) {
  if (!doc.sidebarGroup) {
    return COMPONENT_GROUP_ORDER.length
  }

  const index = (COMPONENT_GROUP_ORDER as readonly string[]).indexOf(
    doc.sidebarGroup,
  )

  return index === -1 ? COMPONENT_GROUP_ORDER.length : index
}

function compareDocs(product: DocsProduct, a: DocNavItem, b: DocNavItem) {
  const sectionDelta =
    SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section)

  if (sectionDelta !== 0) {
    return sectionDelta
  }

  const aIsSectionIndex =
    normalizePath(a.path, product) === getSectionRootPath(product, a.section)
  const bIsSectionIndex =
    normalizePath(b.path, product) === getSectionRootPath(product, b.section)

  if (aIsSectionIndex !== bIsSectionIndex) {
    return aIsSectionIndex ? -1 : 1
  }

  // Keep the flat order aligned with the grouped sidebar so DocsPager
  // prev/next follows what the reader sees.
  const groupDelta = getSidebarGroupOrder(a) - getSidebarGroupOrder(b)

  if (groupDelta !== 0) {
    return groupDelta
  }

  const sidebarDelta = getSidebarOrder(a) - getSidebarOrder(b)

  if (sidebarDelta !== 0) {
    return sidebarDelta
  }

  const titleDelta = a.title.localeCompare(b.title, "en", {
    sensitivity: "base",
  })

  if (titleDelta !== 0) {
    return titleDelta
  }

  return a.path.localeCompare(b.path, "en", { sensitivity: "base" })
}

/**
 * The glob loader drops `/index`, so a product's home entry ends up with the
 * product directory as its whole id.
 */
export function getProductIndexId(productId: DocsProductId) {
  return productId
}

/**
 * Entry ids are product-prefixed (`vela-rbxts/reference/config`) because every
 * product shares one collection. Routes are per-product, so the prefix is
 * stripped to form the slug. Ids that are already product-relative pass through.
 */
export function getDocSlug(
  id: string,
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
) {
  if (id === productId || id === "index") {
    return ""
  }

  const prefix = `${productId}/`
  const relative = id.startsWith(prefix) ? id.slice(prefix.length) : id

  return relative.replace(/\/index$/, "")
}

export function getDocPathFromId(
  id: string,
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
) {
  const product = getProduct(productId)
  const slug = getDocSlug(id, productId)

  return slug ? `${product.href}${slug}/` : product.href
}

export function getDocUrl(
  path: string,
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const product = getProduct(productId)
  const normalized = normalizePath(path, product)

  if (normalized.startsWith(product.href)) {
    return normalized
  }

  return normalizePath(`${product.href}${normalized}`, product)
}

export async function getDocs(
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
) {
  const product = getProduct(productId)
  const entries = await getCollection("docs")

  return entries
    .filter((entry) => !entry.data.draft && entry.data.product === productId)
    .map<DocNavItem>((entry: CollectionEntry<"docs">) => {
      const path = getDocPathFromId(entry.id, productId)

      return {
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        section: entry.data.section,
        path,
        url: getDocUrl(path, productId),
        sidebarOrder: entry.data.sidebar?.order,
        sidebarGroup: entry.data.sidebar?.group,
      }
    })
    .sort((a, b) => compareDocs(product, a, b))
}

export async function getDocByPath(
  path: string,
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
) {
  const product = getProduct(productId)
  const docs = await getDocs(productId)
  const normalizedPath = normalizePath(path, product)

  return docs.find((doc) => normalizePath(doc.path, product) === normalizedPath)
}

function buildSectionSubgroups(
  items: DocNavItem[],
): DocsSectionSubgroup[] | undefined {
  if (!items.some((item) => item.sidebarGroup)) {
    return undefined
  }

  const subgroups: DocsSectionSubgroup[] = []

  for (const label of COMPONENT_GROUP_ORDER) {
    const grouped = items.filter((item) => item.sidebarGroup === label)

    if (grouped.length > 0) {
      subgroups.push({ label, items: grouped })
    }
  }

  const ungrouped = items.filter(
    (item) =>
      !item.sidebarGroup ||
      !(COMPONENT_GROUP_ORDER as readonly string[]).includes(item.sidebarGroup),
  )

  if (ungrouped.length > 0) {
    subgroups.push({ label: "Other", items: ungrouped })
  }

  return subgroups
}

const HEADER_SECTIONS = ["components", "guides", "reference"] as const

/** Header nav mirrors whichever sections the product actually ships. */
export function getHeaderNavLinks(shell: DocsShellData) {
  const links = HEADER_SECTIONS.flatMap((key) => {
    const section = shell.sections.find((candidate) => candidate.key === key)
    const href = section?.items[0]?.url

    return section && href ? [{ label: section.label, href }] : []
  })

  if (shell.product.id === "lattice-ui") {
    links.push({ label: "Playground", href: "/playground/" })
  }

  return links
}

export async function getDocsShellData(
  currentPath: string,
  productId: DocsProductId = DEFAULT_DOCS_PRODUCT.id,
): Promise<DocsShellData> {
  const product = getProduct(productId)
  const docs = await getDocs(productId)
  const normalizedPath = normalizePath(currentPath, product)
  const currentIndex = docs.findIndex(
    (doc) => normalizePath(doc.path, product) === normalizedPath,
  )

  const sections = SECTION_ORDER.map((section) => {
    const items = docs.filter((doc) => doc.section === section)

    return {
      key: section,
      label: SECTION_LABELS[section],
      items,
      subgroups: buildSectionSubgroups(items),
    }
  }).filter((section) => section.items.length > 0)

  return {
    product,
    docs,
    sections,
    current: currentIndex >= 0 ? docs[currentIndex] : undefined,
    previous: currentIndex > 0 ? docs[currentIndex - 1] : undefined,
    next:
      currentIndex >= 0 && currentIndex < docs.length - 1
        ? docs[currentIndex + 1]
        : undefined,
  }
}
