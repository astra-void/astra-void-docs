import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import type { IconType } from "react-icons"
import {
  LuBraces,
  LuCodeXml,
  LuFileCode2,
  LuFileJson2,
  LuTerminal,
} from "react-icons/lu"
import { SiAstro, SiJavascript, SiReact, SiTypescript } from "react-icons/si"

function toMaskUrl(Icon: IconType) {
  const svg = renderToStaticMarkup(
    createElement(Icon, {
      "aria-hidden": true,
      focusable: "false",
    }),
  )

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export const codeBlockIconVars = {
  generic: toMaskUrl(LuFileCode2),
  typescript: toMaskUrl(SiTypescript),
  react: toMaskUrl(SiReact),
  javascript: toMaskUrl(SiJavascript),
  astro: toMaskUrl(SiAstro),
  terminal: toMaskUrl(LuTerminal),
  braces: toMaskUrl(LuBraces),
  json: toMaskUrl(LuFileJson2),
  xml: toMaskUrl(LuCodeXml),
} as const
