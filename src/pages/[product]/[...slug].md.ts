import type { APIRoute } from "astro"
import { DOCS_PRODUCT_ORDER, getDocSlug } from "@/lib/docs"
import { getLlmsDocs, renderDocMarkdown, textResponse, type LlmsDoc } from "@/lib/llms"

/** Every docs page as plain Markdown: `/lattice-ui/components/dialog.md`. */
export async function getStaticPaths() {
  const perProduct = await Promise.all(
    DOCS_PRODUCT_ORDER.map(async (productId) => {
      const docs = await getLlmsDocs(productId)

      return docs.map((doc) => ({
        params: {
          product: productId,
          // The product home has no slug of its own.
          slug: getDocSlug(doc.nav.id, productId) || "index",
        },
        props: { doc },
      }))
    }),
  )

  return perProduct.flat()
}

export const GET: APIRoute = async ({ props, site }) =>
  textResponse(await renderDocMarkdown((props as { doc: LlmsDoc }).doc, site))
