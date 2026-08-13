/**
 * The one place the docs name a Vela version.
 *
 * Every package in the vela-rbxts repo versions in lockstep — `vela-rbxts`
 * itself, the `@vela-rbxts/*` scope, and the three `@rbxts/vela-runtime*`
 * packages — so a single number describes the whole toolchain. Pages that print
 * it import from here instead of hardcoding a literal, which is how the landing
 * page came to advertise 0.4.1 while `release-notes.mdx` had `0.10.0` as the
 * current release.
 *
 * Only the *current* release belongs here. The per-version prose in
 * `reference/release-notes.mdx` is history — those headings name the release
 * they describe and must stay literal.
 *
 * Deliberately free of Node imports so MDX pages can import it directly.
 */

/** Current release the docs are written against. */
export const VELA_VERSION = "0.12.4"

/** Pre-1.0 marker shown next to the version. */
export const VELA_STABILITY = "pre-1.0"

/** `vela-rbxts · v0.12.4 · pre-1.0` — the landing page badge. */
export const VELA_VERSION_LABEL = `vela-rbxts · v${VELA_VERSION} · ${VELA_STABILITY}`
