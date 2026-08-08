/**
 * The one place the docs name a Facet version.
 *
 * The registry and the `facet-rbxts` CLI ship together, so a single number
 * describes what a `facet add` pulls. Pages that print it import from here
 * instead of hardcoding a literal, which is how the landing page came to
 * advertise 0.3.0 after every page under it had been moved to 0.3.1.
 *
 * Deliberately free of Node imports so MDX pages can import it directly.
 */

/** Current release the docs are written against. */
export const FACET_VERSION = "0.4.0"

/** Pre-1.0 marker shown next to the version. */
export const FACET_STABILITY = "pre-1.0"

/** `facet-rbxts · v0.4.0 · pre-1.0` — the landing page badge. */
export const FACET_VERSION_LABEL = `facet-rbxts · v${FACET_VERSION} · ${FACET_STABILITY}`
