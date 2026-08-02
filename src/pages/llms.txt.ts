import type { APIRoute } from "astro"
import { buildSiteLlmsTxt, textResponse } from "@/lib/llms"

export const GET: APIRoute = async ({ site }) =>
  textResponse(await buildSiteLlmsTxt(site))
