import { getCollection } from "astro:content"
import {
  DOCS_PRODUCTS,
  DOCS_PRODUCT_ORDER,
  getDocSlug,
  getDocs,
  getDocsShellData,
  type DocNavItem,
  type DocsProductId,
} from "@/lib/docs"
import { mdxToMarkdown } from "@/lib/mdx-to-markdown"

/**
 * The llms.txt family (https://llmstxt.org): `/llms.txt` indexes the whole
 * site, `/llms-full.txt` inlines it, and every page is also served as Markdown
 * at its own URL with `.md` appended. Each product repeats the pair under its
 * own prefix so an agent working on one library does not have to pull all three.
 */

const SITE_TITLE = "astra-void docs"

const SITE_SUMMARY =
  "Documentation for the astra-void libraries for Roblox UI built with roblox-ts and @rbxts/react: Lattice UI (headless behavior primitives), Vela (Tailwind-style className compilation), and Loom (a live web preview renderer)."

const FALLBACK_ORIGIN = "https://docs.astra-void.xyz"

export type LlmsDoc = {
  nav: DocNavItem
  markdownPath: string
  body: string
}

/** `/lattice-ui/components/dialog/` → `/lattice-ui/components/dialog.md`. */
export function getDocMarkdownPath(doc: DocNavItem, productId: DocsProductId) {
  const product = DOCS_PRODUCTS[productId]
  const slug = getDocSlug(doc.id, productId)

  // The product home has no slug of its own, so it lands on `index.md`.
  return `${product.href}${slug || "index"}.md`
}

export async function getLlmsDocs(productId: DocsProductId): Promise<LlmsDoc[]> {
  const [nav, entries] = await Promise.all([getDocs(productId), getCollection("docs")])
  const bodies = new Map(entries.map((entry) => [entry.id, entry.body ?? ""]))

  return nav.map((item) => ({
    nav: item,
    markdownPath: getDocMarkdownPath(item, productId),
    body: bodies.get(item.id) ?? "",
  }))
}

function absolute(path: string, site: URL | undefined) {
  return new URL(path, site ?? FALLBACK_ORIGIN).href
}

function docLink(doc: LlmsDoc, site: URL | undefined) {
  return `- [${doc.nav.title}](${absolute(doc.markdownPath, site)}): ${doc.nav.description}`
}

let docLinkTargets: Promise<Map<string, string>> | null = null

/** Doc page path → the Markdown path that stands in for it. */
function getDocLinkTargets() {
  docLinkTargets ??= Promise.all(DOCS_PRODUCT_ORDER.map(getLlmsDocs)).then(
    (perProduct) =>
      new Map(perProduct.flat().map((doc) => [doc.nav.path, doc.markdownPath])),
  )

  return docLinkTargets
}

/**
 * Site-relative links become absolute — a Markdown file can be read anywhere —
 * and links to another docs page point at that page's Markdown.
 */
function createLinkResolver(targets: Map<string, string>, site: URL | undefined) {
  return (href: string) => {
    const [path, hash = ""] = href.split(/(#.*)$/)
    const normalized = path.endsWith("/") ? path : `${path}/`

    return `${absolute(targets.get(normalized) ?? path, site)}${hash}`
  }
}

/** One page as standalone Markdown, with a pointer back to the rendered page. */
export async function renderDocMarkdown(doc: LlmsDoc, site: URL | undefined) {
  const resolveLink = createLinkResolver(await getDocLinkTargets(), site)

  return [
    `# ${doc.nav.title}`,
    "",
    `> ${doc.nav.description}`,
    "",
    `Source: ${absolute(doc.nav.url, site)}`,
    "",
    mdxToMarkdown(doc.body, resolveLink),
  ].join("\n")
}

function usageNotes(site: URL | undefined) {
  return [
    `- Every page is also served as Markdown at its own URL with \`.md\` appended, e.g. ${absolute(
      "/lattice-ui/components/dialog.md",
      site,
    )}.`,
    `- [llms-full.txt](${absolute("/llms-full.txt", site)}) inlines every page listed below.`,
    ...DOCS_PRODUCT_ORDER.map((productId) => {
      const product = DOCS_PRODUCTS[productId]

      return `- ${product.title} alone: [llms.txt](${absolute(
        `${product.href}llms.txt`,
        site,
      )}) · [llms-full.txt](${absolute(`${product.href}llms-full.txt`, site)})`
    }),
  ].join("\n")
}

export async function buildSiteLlmsTxt(site: URL | undefined) {
  const sections = await Promise.all(
    DOCS_PRODUCT_ORDER.map(async (productId) => {
      const product = DOCS_PRODUCTS[productId]
      const docs = await getLlmsDocs(productId)

      return [
        `## ${product.title}`,
        "",
        `> ${product.description}`,
        "",
        `Source: ${product.githubUrl}`,
        "",
        docs.map((doc) => docLink(doc, site)).join("\n"),
      ].join("\n")
    }),
  )

  return `${[
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_SUMMARY}`,
    "",
    usageNotes(site),
    "",
    sections.join("\n\n"),
  ].join("\n")}\n`
}

export async function buildProductLlmsTxt(
  productId: DocsProductId,
  site: URL | undefined,
) {
  const product = DOCS_PRODUCTS[productId]
  const [shell, docs] = await Promise.all([
    getDocsShellData(product.href, productId),
    getLlmsDocs(productId),
  ])
  const byPath = new Map(docs.map((doc) => [doc.nav.path, doc]))

  // Mirrors the sidebar so the index reads in the order the docs are written.
  const sections = shell.sections.map((section) => {
    const links = section.items
      .map((item) => byPath.get(item.path))
      .filter((doc): doc is LlmsDoc => Boolean(doc))
      .map((doc) => docLink(doc, site))

    return `## ${section.label}\n\n${links.join("\n")}`
  })

  return `${[
    `# ${product.title}`,
    "",
    `> ${product.description}`,
    "",
    `- Docs: ${absolute(product.href, site)}`,
    `- Source: ${product.githubUrl}`,
    `- Full text: ${absolute(`${product.href}llms-full.txt`, site)}`,
    `- Every page below is also served as Markdown at its own URL with \`.md\` appended.`,
    "",
    sections.join("\n\n"),
  ].join("\n")}\n`
}

async function joinPages(header: string[], docs: LlmsDoc[], site: URL | undefined) {
  const pages = await Promise.all(docs.map((doc) => renderDocMarkdown(doc, site)))

  return `${[...header, ""].join("\n")}\n${pages.join("\n---\n\n")}`
}

export async function buildSiteLlmsFullTxt(site: URL | undefined) {
  const perProduct = await Promise.all(
    DOCS_PRODUCT_ORDER.map((productId) => getLlmsDocs(productId)),
  )

  return joinPages(
    [`# ${SITE_TITLE}`, "", `> ${SITE_SUMMARY}`, "", usageNotes(site)],
    perProduct.flat(),
    site,
  )
}

export async function buildProductLlmsFullTxt(
  productId: DocsProductId,
  site: URL | undefined,
) {
  const product = DOCS_PRODUCTS[productId]
  const docs = await getLlmsDocs(productId)

  return joinPages(
    [
      `# ${product.title}`,
      "",
      `> ${product.description}`,
      "",
      `- Docs: ${absolute(product.href, site)}`,
      `- Source: ${product.githubUrl}`,
    ],
    docs,
    site,
  )
}

export function textResponse(body: string) {
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}

export function isDocsProductId(value: unknown): value is DocsProductId {
  return (
    typeof value === "string" &&
    (DOCS_PRODUCT_ORDER as readonly string[]).includes(value)
  )
}
