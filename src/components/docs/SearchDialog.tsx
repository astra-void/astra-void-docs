import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { FileText, Search } from "lucide-react"

type PagefindResultData = {
  url: string
  meta?: { title?: string }
  excerpt: string
}

type PagefindResult = {
  id: string
  data: () => Promise<PagefindResultData>
}

type PagefindApi = {
  debouncedSearch: (
    query: string,
  ) => Promise<{ results: PagefindResult[] } | null>
}

type SearchHit = PagefindResultData & { id: string }

let pagefindPromise: Promise<PagefindApi | null> | undefined

function loadPagefind(): Promise<PagefindApi | null> {
  pagefindPromise ??= import(
    /* @vite-ignore */ `${window.location.origin}/pagefind/pagefind.js`
  ).catch(() => null)

  return pagefindPromise
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [hits, setHits] = React.useState<SearchHit[]>([])
  const [unavailable, setUnavailable] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    const run = async () => {
      const pagefind = await loadPagefind()

      if (cancelled) return

      if (!pagefind) {
        setUnavailable(true)
        return
      }

      if (!query.trim()) {
        setHits([])
        return
      }

      const search = await pagefind.debouncedSearch(query)

      // debouncedSearch resolves null when superseded by a newer query.
      if (cancelled || !search) return

      const data = await Promise.all(
        search.results.slice(0, 8).map(async (result) => ({
          id: result.id,
          ...(await result.data()),
        })),
      )

      if (!cancelled) {
        setHits(data)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [open, query])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          <span className="hidden sm:inline">Search docs…</span>
          <kbd className="hidden rounded border border-border bg-background px-1.5 py-px font-mono text-[0.7rem] sm:inline">
            ⌘K
          </kbd>
        </button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-24 z-[120] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl bg-popover shadow-modal"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Search documentation
          </DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Search docs…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {unavailable ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Search is available in production builds. Run{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  pnpm build && pnpm preview
                </code>{" "}
                to try it locally.
              </p>
            ) : hits.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {query.trim() ? "No results found." : "Type to search the docs."}
              </p>
            ) : (
              <ul>
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <a
                      className="flex flex-col gap-1 rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                      href={hit.url}
                      onClick={() => setOpen(false)}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileText
                          aria-hidden="true"
                          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        />
                        {hit.meta?.title ?? hit.url}
                      </span>
                      <span
                        className="line-clamp-2 text-xs leading-5 text-muted-foreground [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-foreground"
                        dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
