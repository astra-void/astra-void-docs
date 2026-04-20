import type { APIRoute } from "astro";
import { buildDocsSearchIndex } from "../lib/search-index";

export const prerender = true;

export const GET: APIRoute = async () => {
	const searchIndex = await buildDocsSearchIndex();
	return new Response(JSON.stringify(searchIndex), {
		headers: {
			"Cache-Control": "public, max-age=0, must-revalidate",
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};
