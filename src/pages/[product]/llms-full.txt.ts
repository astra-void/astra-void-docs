import type { APIRoute } from "astro"
import { DOCS_PRODUCT_ORDER } from "@/lib/docs"
import {
  buildProductLlmsFullTxt,
  isDocsProductId,
  textResponse,
} from "@/lib/llms"

export function getStaticPaths() {
  return DOCS_PRODUCT_ORDER.map((product) => ({ params: { product } }))
}

export const GET: APIRoute = async ({ params, site }) => {
  if (!isDocsProductId(params.product)) {
    return new Response("Not found", { status: 404 })
  }

  return textResponse(await buildProductLlmsFullTxt(params.product, site))
}
