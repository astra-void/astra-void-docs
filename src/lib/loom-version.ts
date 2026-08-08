/**
 * The one place the docs name a Loom version.
 *
 * Every `@loom-dev/*` package — and the `loom-dev` CLI — versions in lockstep
 * (changesets marks them `fixed`), so a single number describes the whole
 * toolchain. Pages that print it import from here instead of hardcoding a
 * literal, which is how the landing page came to advertise 0.6.1 long after the
 * prose had been rewritten for 0.10.0.
 *
 * The constant is authoritative rather than read from `loom-dev`'s manifest on
 * purpose: the prose is written against a specific release, so bumping the
 * dependency should not silently repoint the docs at a release nothing has been
 * written about yet. Mirrors `lattice-version.ts` — see its note for the same
 * reasoning applied to Lattice UI.
 *
 * Deliberately free of Node imports so MDX pages can import it directly.
 */

/** Current release the docs are written against. */
export const LOOM_VERSION = "0.10.0"

/** Pre-1.0 marker shown next to the version. */
export const LOOM_STABILITY = "pre-1.0"

/** `loom · v0.10.0 · pre-1.0` — the landing page badge. */
export const LOOM_VERSION_LABEL = `loom · v${LOOM_VERSION} · ${LOOM_STABILITY}`
