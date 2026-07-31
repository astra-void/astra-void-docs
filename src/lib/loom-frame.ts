/**
 * Client-side behavior shared by the embedded Loom previews (`LoomPreview` for
 * the lattice-ui gallery, `VelaPreview` for the Vela one).
 *
 * Two jobs: mount the iframes lazily — the `src` lives in `data-src` until the
 * frame is near the viewport, so a page full of previews does not start a dozen
 * Roblox renderers at once — and keep loaded frames on the docs' current theme.
 * Both are idempotent, so pages can call them again after a view transition.
 */

const currentTheme = () =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

/**
 * Point every not-yet-loaded frame at its target once it approaches the
 * viewport, and wire the tab strip of each preview figure.
 */
export function mountLoomFrames() {
  const frames = document.querySelectorAll<HTMLIFrameElement>(
    "[data-loom-frame]:not([data-loaded])",
  )

  const load = (frame: HTMLIFrameElement) => {
    const src = frame.dataset.src
    if (!src || frame.dataset.loaded) return
    frame.src = `${src}&theme=${currentTheme()}`
    frame.dataset.loaded = "true"
  }

  if (frames.length > 0) {
    if (!("IntersectionObserver" in window)) {
      frames.forEach(load)
    } else {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              load(entry.target as HTMLIFrameElement)
              obs.unobserve(entry.target)
            }
          }
        },
        { rootMargin: "200px" },
      )
      frames.forEach((frame) => observer.observe(frame))
    }
  }

  for (const figure of document.querySelectorAll<HTMLElement>(
    "[data-loom-preview]:not([data-tabs-wired])",
  )) {
    figure.dataset.tabsWired = "true"
    const tabs = figure.querySelectorAll<HTMLButtonElement>("[data-loom-tab]")
    const panels = figure.querySelectorAll<HTMLElement>("[data-loom-panel]")
    for (const tab of tabs) {
      tab.addEventListener("click", () => {
        const name = tab.dataset.loomTab
        for (const t of tabs) {
          const active = t === tab
          t.dataset.active = String(active)
          t.setAttribute("aria-selected", String(active))
        }
        for (const panel of panels) {
          panel.hidden = panel.dataset.loomPanel !== name
        }
      })
    }
  }
}

/**
 * Push docs theme toggles into already-loaded preview frames. The theme is part
 * of the initial `src`, so this only has to cover toggles after the fact.
 */
export function watchLoomTheme() {
  const win = window as Window & { loomThemeObserver?: MutationObserver }
  if (win.loomThemeObserver) return

  const observer = new MutationObserver(() => {
    const theme = currentTheme()
    for (const frame of document.querySelectorAll<HTMLIFrameElement>(
      "[data-loom-frame][data-loaded]",
    )) {
      frame.contentWindow?.postMessage({ type: "loom-theme", theme }, "*")
    }
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  win.loomThemeObserver = observer
}
