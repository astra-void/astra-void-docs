import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  themes: ["github-light", "github-dark"],
  themeCssSelector: (theme) =>
    theme.type === "dark" ? ".dark" : ":root:not(.dark)",
  useDarkModeMediaQuery: false,
  frames: {
    showCopyToClipboardButton: true,
  },
  styleOverrides: {
    borderRadius: "0.75rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    codeBackground: "var(--card)",
    codeFontFamily:
      "'Geist Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    codeFontSize: "0.8125rem",
    codeLineHeight: "1.7",
    codePaddingBlock: "0.875rem",
    codePaddingInline: "1rem",
    frames: {
      shadowColor: "transparent",
      terminalBackground: "var(--card)",
      terminalTitlebarBackground: "transparent",
      terminalTitlebarBorderBottomColor: "var(--border)",
    },
  },
});
