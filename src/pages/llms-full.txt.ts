import type { APIRoute } from "astro"
import { buildSiteLlmsFullTxt, textResponse } from "@/lib/llms"

export const GET: APIRoute = async ({ site }) =>
  textResponse(await buildSiteLlmsFullTxt(site))
