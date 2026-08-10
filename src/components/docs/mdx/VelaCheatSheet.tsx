import * as React from "react"

import {
  UTILITY_CATEGORIES,
  VELA_UTILITY_GROUPS,
  VELA_UTILITY_ROW_COUNT,
  getUtilityGroupHref,
  isAllRuntime,
  utilityCellToHtml,
  utilityRowHaystack,
  type UtilityGroup,
  type UtilityRow,
} from "@/lib/vela-utilities"

/**
 * Every utility class at once, filtered as you type.
 *
 * The reference page answers "what does this family do" and needs its prose to
 * do it; this answers "what is the class called" and "what does it touch", which
 * is a scanning problem. Both read the same rows, so neither can drift.
 *
 * Rendered on the server and hydrated, so the full list is in the HTML for
 * Pagefind and for a reader with no JS — the filter is the only part that needs
 * the client.
 */

/** Precomputed once: the filter runs on every keystroke over 200 rows. */
const INDEX = VELA_UTILITY_GROUPS.map((group) => ({
  group,
  allRuntime: isAllRuntime(group),
  rows: group.rows.map((row) => ({
    row,
    haystack: utilityRowHaystack(group, row),
  })),
}))

type CategoryFilter = "All" | (typeof UTILITY_CATEGORIES)[number]

function Markdown({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: utilityCellToHtml(value) }}
    />
  )
}

function Row({
  row,
  showRuntime,
}: {
  row: UtilityRow
  showRuntime: boolean
}) {
  return (
    <div className="grid gap-x-6 gap-y-1 border-t border-border/60 px-4 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="min-w-0">
        <span className="docs-utility-classes">
          {row.classes.map((name) => (
            <code key={name}>
              {name}
            </code>
          ))}
        </span>
        {row.values ? (
          <Markdown
            className="mt-1 block text-xs text-muted-foreground"
            value={row.values}
          />
        ) : null}
      </div>
      <div className="min-w-0 text-sm text-foreground/80">
        {showRuntime && row.runtime ? (
          <span
            className="docs-utility-runtime"
            title="Moves the element onto the runtime path"
          >
            runtime
          </span>
        ) : null}
        <Markdown value={row.target} />
        {row.notes ? (
          <Markdown
            className="mt-1 block text-xs text-muted-foreground"
            value={row.notes}
          />
        ) : null}
      </div>
    </div>
  )
}

function Group({
  group,
  rows,
  allRuntime,
}: {
  group: UtilityGroup
  rows: UtilityRow[]
  allRuntime: boolean
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/80">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          <a
            className="hover:underline hover:decoration-foreground/30 hover:underline-offset-4"
            href={getUtilityGroupHref(group)}
          >
            {group.label}
          </a>
          {allRuntime ? (
            <span className="docs-utility-runtime ml-2">runtime</span>
          ) : null}
        </h3>
        <span className="text-xs text-muted-foreground">{group.category}</span>
        <Markdown
          className="w-full text-xs leading-relaxed text-muted-foreground"
          value={group.summary}
        />
      </header>
      {rows.map((row, index) => (
        <Row key={index} row={row} showRuntime={!allRuntime} />
      ))}
    </section>
  )
}

export function VelaCheatSheet() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<CategoryFilter>("All")
  const [runtimeOnly, setRuntimeOnly] = React.useState(false)

  const needle = query.trim().toLowerCase()

  const results = React.useMemo(() => {
    return INDEX.flatMap((entry) => {
      if (category !== "All" && entry.group.category !== category) {
        return []
      }

      const rows = entry.rows
        .filter(({ row }) => !runtimeOnly || row.runtime)
        .filter(({ haystack }) => !needle || haystack.includes(needle))
        .map(({ row }) => row)

      return rows.length > 0
        ? [{ group: entry.group, rows, allRuntime: entry.allRuntime }]
        : []
    })
  }, [category, needle, runtimeOnly])

  const matched = results.reduce((total, entry) => total + entry.rows.length, 0)
  const filtering = Boolean(needle) || category !== "All" || runtimeOnly

  return (
    <div className="not-prose space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Filter utility classes"
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by class, value, or Roblox property — bg-, UIStroke, TextSize…"
          type="search"
          value={query}
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground">
          <input
            checked={runtimeOnly}
            className="size-3.5 accent-current"
            onChange={(event) => setRuntimeOnly(event.target.checked)}
            type="checkbox"
          />
          Runtime path only
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["All", ...UTILITY_CATEGORIES] as CategoryFilter[]).map((name) => (
          <button
            aria-pressed={category === name}
            className={
              category === name
                ? "rounded-md border border-foreground/20 bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                : "rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            }
            key={name}
            onClick={() => setCategory(name)}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtering
          ? `${matched} of ${VELA_UTILITY_ROW_COUNT} rows`
          : `${VELA_UTILITY_ROW_COUNT} rows across ${VELA_UTILITY_GROUPS.length} families. Every family links to its section in the reference.`}
      </p>

      {results.length === 0 ? (
        <p className="rounded-lg border border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing matches <code>{query}</code>. A class
          that is not on this page is one Vela does not compile — the reference
          lists{" "}
          <a
            className="text-link underline decoration-link/40 underline-offset-4"
            href="/vela-rbxts/reference/utilities/#not-implemented"
          >
            what has no Roblox equivalent
          </a>
          .
        </p>
      ) : (
        <div className="space-y-4">
          {results.map((entry) => (
            <Group
              allRuntime={entry.allRuntime}
              group={entry.group}
              key={entry.group.id}
              rows={entry.rows}
            />
          ))}
        </div>
      )}
    </div>
  )
}
