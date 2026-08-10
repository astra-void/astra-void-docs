import { PACKAGE_STATUS_LABELS, type PackageStatus } from "@/lib/package-status"
import { getUtilityGroup, isAllRuntime } from "@/lib/vela-utilities"

/**
 * Turns the MDX body of a docs entry back into plain Markdown for the `.md`
 * and llms.txt endpoints.
 *
 * The docs components carry real reference data — a `<PropTable>` holds every
 * prop of a primitive — so shipping the raw MDX would hand a reader JSX where
 * the page shows a table. Each known component renders to the Markdown
 * equivalent of what it paints; everything else is passed through untouched.
 *
 * The scanner walks the body once so fenced code blocks and inline code spans
 * stay verbatim: `<Callout>` in prose is a component, the same text inside a
 * ```tsx fence is example source.
 */

type JsxAttributes = Record<string, unknown>

type JsxElement = {
  name: string
  attrs: JsxAttributes
  children: string
  end: number
}

const DOC_COMPONENT_IMPORT =
  /^import\s+(?:[\w*\s,]+|\{[^}]*\})\s+from\s+["']@\/components\/docs\/mdx["'];?[ \t]*$/

/** Rewrites the target of every Markdown link that sits outside of code. */
export type LinkResolver = (href: string) => string

export function mdxToMarkdown(body: string, resolveLink?: LinkResolver) {
  return normalizeBlankLines(transform(body, resolveLink))
}

function transform(input: string, resolveLink?: LinkResolver): string {
  let out = ""
  let index = 0

  while (index < input.length) {
    if (index === 0 || input[index - 1] === "\n") {
      const line = readLine(input, index)

      const fenceEnd = matchFence(input, line)
      if (fenceEnd !== null) {
        out += input.slice(index, fenceEnd)
        index = fenceEnd
        continue
      }

      if (DOC_COMPONENT_IMPORT.test(line.text)) {
        index = line.end
        continue
      }
    }

    const char = input[index]

    if (char === "`") {
      const codeEnd = matchInlineCode(input, index)
      if (codeEnd !== null) {
        out += input.slice(index, codeEnd)
        index = codeEnd
        continue
      }
    }

    if (char === "<") {
      const element = matchComponent(input, index)
      if (element) {
        out += renderComponent(element, resolveLink)
        index = element.end
        continue
      }
    }

    if (resolveLink && char === "]" && input[index + 1] === "(") {
      const link = /^\]\((\/[^)\s]*)\)/.exec(input.slice(index))
      if (link) {
        out += `](${resolveLink(link[1])})`
        index += link[0].length
        continue
      }
    }

    out += char
    index += 1
  }

  return out
}

function readLine(input: string, index: number) {
  const newline = input.indexOf("\n", index)
  const stop = newline === -1 ? input.length : newline

  return { text: input.slice(index, stop), end: newline === -1 ? stop : stop + 1 }
}

/** Returns the index just past the closing fence, or null when not on one. */
function matchFence(input: string, line: { text: string; end: number }) {
  const open = /^ {0,3}(`{3,}|~{3,})/.exec(line.text)

  if (!open) {
    return null
  }

  const marker = open[1]
  const closing = new RegExp(`^ {0,3}${marker[0]}{${marker.length},}[ \t]*$`)
  let cursor = line.end

  while (cursor < input.length) {
    const next = readLine(input, cursor)

    if (closing.test(next.text)) {
      return next.end
    }

    cursor = next.end
  }

  // An unterminated fence runs to the end of the document, same as Markdown.
  return input.length
}

/** Returns the index just past the closing backtick run, or null. */
function matchInlineCode(input: string, index: number) {
  const open = /^`+/.exec(input.slice(index))

  if (!open) {
    return null
  }

  const marker = open[0]
  let cursor = index + marker.length

  while (cursor < input.length) {
    if (input[cursor] === "\n") {
      return null
    }

    if (input.startsWith(marker, cursor) && input[cursor + marker.length] !== "`") {
      return cursor + marker.length
    }

    cursor += 1
  }

  return null
}

function matchComponent(input: string, index: number): JsxElement | null {
  const opening = /^<([A-Z][A-Za-z0-9]*)/.exec(input.slice(index, index + 64))

  if (!opening) {
    return null
  }

  const name = opening[1]

  if (!(name in COMPONENT_RENDERERS)) {
    return null
  }

  const tag = parseAttributes(input, index + opening[0].length)

  if (!tag) {
    return null
  }

  if (tag.selfClosing) {
    return { name, attrs: tag.attrs, children: "", end: tag.end }
  }

  // None of the docs components nest inside themselves, so the first matching
  // close tag is the right one.
  const closing = `</${name}>`
  const closeStart = input.indexOf(closing, tag.end)

  if (closeStart === -1) {
    return null
  }

  return {
    name,
    attrs: tag.attrs,
    children: input.slice(tag.end, closeStart),
    end: closeStart + closing.length,
  }
}

function parseAttributes(input: string, start: number) {
  const attrs: JsxAttributes = {}
  let index = start

  while (index < input.length) {
    while (index < input.length && /\s/.test(input[index])) {
      index += 1
    }

    if (input.startsWith("/>", index)) {
      return { attrs, end: index + 2, selfClosing: true }
    }

    if (input[index] === ">") {
      return { attrs, end: index + 1, selfClosing: false }
    }

    // The colon is for Astro's client directives (`client:load`), which are
    // attributes as far as this parser is concerned.
    const name = /^[A-Za-z_][\w:-]*/.exec(input.slice(index))

    if (!name) {
      return null
    }

    index += name[0].length

    while (index < input.length && /\s/.test(input[index])) {
      index += 1
    }

    if (input[index] !== "=") {
      attrs[name[0]] = true
      continue
    }

    index += 1

    while (index < input.length && /\s/.test(input[index])) {
      index += 1
    }

    const quote = input[index]

    if (quote === '"' || quote === "'") {
      const close = input.indexOf(quote, index + 1)

      if (close === -1) {
        return null
      }

      attrs[name[0]] = input.slice(index + 1, close)
      index = close + 1
      continue
    }

    if (quote === "{") {
      const expression = readBracedExpression(input, index)

      if (!expression) {
        return null
      }

      attrs[name[0]] = evaluateExpression(expression.text)
      index = expression.end
      continue
    }

    return null
  }

  return null
}

/** Reads a `{...}` attribute value, skipping braces that live inside strings. */
function readBracedExpression(input: string, start: number) {
  let depth = 0
  let quote: string | null = null
  let index = start

  while (index < input.length) {
    const char = input[index]

    if (quote) {
      if (char === "\\") {
        index += 2
        continue
      }

      if (char === quote) {
        quote = null
      }
    } else if (char === '"' || char === "'" || char === "`") {
      quote = char
    } else if (char === "{") {
      depth += 1
    } else if (char === "}") {
      depth -= 1

      if (depth === 0) {
        return { text: input.slice(start + 1, index), end: index + 1 }
      }
    }

    index += 1
  }

  return null
}

/**
 * Attribute expressions are object and array literals authored in this repo's
 * own content, evaluated at build time to read the data back out of them.
 */
function evaluateExpression(expression: string): unknown {
  try {
    return new Function(`return (${expression})`)()
  } catch {
    return expression
  }
}

const COMPONENT_RENDERERS: Record<
  string,
  (attrs: JsxAttributes, children: string) => string
> = {
  Callout: renderCallout,
  ForwardedProps: renderForwardedProps,
  LoomPreview: renderPreview,
  PackageInstall: renderPackageInstall,
  PackageMeta: renderPackageMeta,
  PrimitiveAnatomy: (_attrs, children) => children,
  PropTable: renderPropTable,
  // Inline next to a heading that already says the same word on the page.
  StatusBadge: () => "",
  UtilityTable: renderUtilityTable,
  VelaPreview: renderPreview,
  // A filter over rows the utility reference already prints in full; repeating
  // all 200 of them here would only pad llms.txt.
  VelaCheatSheet: () =>
    "\n_Every utility class on one filterable page. The same rows, with the prose that explains them, are in the Utility reference._\n",
}

function renderComponent(element: JsxElement, resolveLink?: LinkResolver) {
  const children = element.children
    ? transform(element.children, resolveLink).trim()
    : ""

  return COMPONENT_RENDERERS[element.name](element.attrs, children)
}

function renderCallout(attrs: JsxAttributes, children: string) {
  const title = asString(attrs.title) ?? "Note"
  const quoted = `**${title}**\n\n${children}`
    .split("\n")
    .map((line) => (line ? `> ${line}` : ">"))
    .join("\n")

  return `\n${quoted}\n`
}

function renderPropTable(attrs: JsxAttributes) {
  const rows = Array.isArray(attrs.rows) ? attrs.rows : []

  if (rows.length === 0) {
    return ""
  }

  const body = rows
    .map((row) => {
      const record = (row ?? {}) as Record<string, unknown>
      const name = asString(record.name) ?? ""
      const label = record.required ? `\`${name}\` (required)` : `\`${name}\``

      return `| ${cell(label)} | ${cell(`\`${asString(record.type) ?? ""}\``)} | ${cell(
        asString(record.description) ?? "",
      )} |`
    })
    .join("\n")

  return `\n| Prop | Type | Description |\n| --- | --- | --- |\n${body}\n`
}

/**
 * The utility reference's tables are data, so the Markdown view rebuilds them
 * from the same rows the page renders — same columns, and the `runtime` flag
 * spelled out where the page draws a pill.
 */
function renderUtilityTable(attrs: JsxAttributes) {
  const family = asString(attrs.family)

  if (!family) {
    return ""
  }

  const group = getUtilityGroup(family)
  const allRuntime = isAllRuntime(group)

  const showValues = group.rows.some((row) => row.values)
  const showRuntime = !allRuntime && group.rows.some((row) => row.runtime)
  const showNotes = showRuntime || group.rows.some((row) => row.notes)

  const headers = [
    group.classLabel ?? "Class",
    ...(showValues ? ["Values"] : []),
    group.targetLabel ?? "Roblox target",
    ...(showNotes ? ["Notes"] : []),
  ]

  const body = group.rows
    .map((row) => {
      const notes = [
        showRuntime && row.runtime ? "Runtime-structural" : "",
        row.notes ?? "",
      ]
        .filter(Boolean)
        .join(". ")

      const columns = [
        row.classes.map((name) => `\`${name}\``).join(", "),
        ...(showValues ? [row.values ?? "—"] : []),
        row.target,
        ...(showNotes ? [notes] : []),
      ]

      return `| ${columns.map(cell).join(" | ")} |`
    })
    .join("\n")

  return `\n| ${headers.join(" | ")} |\n|${headers.map(() => " --- ").join("|")}|\n${body}\n`
}

function renderPackageMeta(attrs: JsxAttributes) {
  const parts = [`\`${asString(attrs.packageName) ?? ""}\``]
  const status = asString(attrs.status) as PackageStatus | undefined

  if (status && status in PACKAGE_STATUS_LABELS) {
    parts.push(PACKAGE_STATUS_LABELS[status])
  }

  const importName = asString(attrs.importName)

  if (importName) {
    parts.push(`import \`${importName}\``)
  }

  const dependencies = asStringArray(attrs.dependencies)

  if (dependencies.length > 0) {
    const names = dependencies
      .map((dependency) => `\`${dependency.replace("@lattice-ui/react-", "")}\``)
      .join(", ")

    parts.push(`depends on ${names}`)
  }

  return `\n${parts.join(" · ")}\n`
}

function renderPackageInstall(attrs: JsxAttributes) {
  const packageName = asString(attrs.packageName) ?? ""
  const flag = attrs.dev ? "-D " : ""

  return `\n\`\`\`bash\npnpm add ${flag}${packageName}\n\`\`\`\n`
}

function renderForwardedProps(attrs: JsxAttributes) {
  const instance = asString(attrs.instance) ?? "instance"
  const owns = asStringArray(attrs.owns)
  const sentences = [
    `Renders a \`${instance}\`. Unknown props forward onto it and are type-checked against it, so a prop \`${instance}\` does not accept is a compile error.`,
  ]

  if (owns.length > 0) {
    const names = joinWithAnd(owns.map((name) => `\`${name}\``))
    const because = asString(attrs.ownedBecause)

    sentences.push(
      `The primitive owns ${names}${because ? ` ${because}` : ""}, so values you pass for ${
        owns.length === 1 ? "it" : "those"
      } are ignored.`,
    )
  }

  return `\n${sentences.join(" ")}\n`
}

function renderPreview(attrs: JsxAttributes) {
  const label = asString(attrs.label)

  return label
    ? `\n_Interactive preview: ${label}_\n`
    : "\n_Interactive preview._\n"
}

function joinWithAnd(items: string[]) {
  if (items.length < 2) {
    return items.join("")
  }

  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

function cell(value: string) {
  return value.replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|")
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : []
}

function normalizeBlankLines(value: string) {
  // Dropping an inline component can leave the line it sat on padded; nothing
  // in the content relies on trailing whitespace, so trim every line.
  const trimmed = value.replace(/[ \t]+$/gm, "")

  return `${trimmed.replace(/\n{3,}/g, "\n\n").trim()}\n`
}
