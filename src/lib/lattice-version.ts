/**
 * The one place the docs name a Lattice UI version.
 *
 * Every `@lattice-ui/*` package — and the `lattice-ui` CLI — versions in
 * lockstep, so a single number describes the whole library. Pages that print it
 * (the landing badge, package stability, releases) import from here instead of
 * hardcoding a literal, which is how the landing page came to advertise 0.6.0
 * while Releases called 0.6.2 current and the library itself had shipped 0.7.0.
 *
 * The constant is authoritative rather than read from the sibling checkout on
 * purpose: the prose on these pages is written against a specific release, so a
 * version bump in the checkout should not silently repoint the docs at a release
 * nothing has been written about yet. `checkLatticeVersion()` in lattice-source
 * reports that drift at build time instead.
 *
 * Deliberately free of Node imports so MDX pages can import it directly.
 */

/** Current stable release the docs are written against. */
export const LATTICE_VERSION = "0.7.0"

/** The `0.x` line that release belongs to. */
export const LATTICE_MINOR = "0.7"

/** ISO date of that release, as the changelog records it. */
export const LATTICE_RELEASE_DATE = "2026-07-20"

/** Pre-1.0 marker shown next to the version. */
export const LATTICE_STABILITY = "pre-1.0"

/** `@lattice-ui · v0.7.0 · pre-1.0` — the landing page badge. */
export const LATTICE_VERSION_LABEL = `@lattice-ui · v${LATTICE_VERSION} · ${LATTICE_STABILITY}`
