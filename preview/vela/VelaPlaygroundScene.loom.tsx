/**
 * The Vela playground's render target.
 *
 * Unlike the `*.vela.tsx` examples beside it, this scene has no `className` on
 * it and never goes through the compiler: it renders code it is *given*. The
 * docs page (`/vela-playground/`) lowers the editor's source with the real
 * compiler — the wasm build of the same crate `rbxtsc` loads — compiles the
 * lowered TSX to CommonJS with sucrase, and posts it in. So what renders here
 * is Vela's own output, exactly as the checked-in examples are.
 *
 * Protocol (parent → frame):
 *   { type: "vela-playground-run", code: <compiled CJS>, version: number }
 * Frame → parent:
 *   { type: "vela-playground-ready" }
 *   { type: "vela-playground-result", version, ok, message? }
 *
 * The compiled module may export either `preview` (`{ render() }`, the scene
 * convention used across this folder) or a default component.
 */
import React from "@rbxts/react";
import * as Services from "@rbxts/services";
import * as Stage from "./VelaStage";
import { BACKDROP, useDocTheme } from "./VelaStage";

/**
 * What playground code may import: the two specifiers an example in this folder
 * writes, so a scene copied out of it runs verbatim, plus `@rbxts/services` —
 * which nobody writes by hand here, but Vela's runtime path emits an import of
 * when a `className` cannot be resolved statically.
 */
const PLAYGROUND_MODULES: Record<string, unknown> = {
  "@rbxts/react": React,
  "@rbxts/services": Services,
  "./VelaStage": Stage,
};

type CompiledModule = (
  requireModule: (id: string) => unknown,
  moduleExports: Record<string, unknown>,
  module: { exports: Record<string, unknown> },
  react: unknown,
) => void;

type PlaygroundMessage = {
  type?: string;
  code?: string;
  version?: number;
};

type HostMessageEvent = { data?: PlaygroundMessage };

/**
 * The browser globals this scene needs. Declared locally (rather than pulled
 * from `lib.dom`) because the surrounding project is typed against Roblox — the
 * playground is the one target that knowingly talks to its host page.
 */
interface PlaygroundWindow {
  Function: new (...args: Array<string>) => CompiledModule;
  addEventListener: (type: string, listener: (event: HostMessageEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: HostMessageEvent) => void) => void;
  parent: { postMessage: (message: unknown, targetOrigin: string) => void };
}

declare const window: PlaygroundWindow;

function postToHost(message: unknown) {
  window.parent.postMessage(message, "*");
}

function describeError(err: unknown) {
  const asError = err as { message?: unknown } | undefined;
  if (asError && typeIs(asError.message, "string")) {
    return asError.message as string;
  }
  return tostring(err);
}

/**
 * Evaluate one compiled playground module and pull an element out of it.
 * Throws on anything the host should surface as a red error panel.
 */
function evaluate(code: string): React.Element {
  const factory = new window.Function("require", "exports", "module", "React", code);

  const moduleExports: Record<string, unknown> = {};
  factory(
    (id: string) => {
      const found = PLAYGROUND_MODULES[id];
      if (found === undefined) {
        error(`Cannot import "${id}" in the playground.`);
      }
      return found;
    },
    moduleExports,
    { exports: moduleExports },
    React,
  );

  const preview = moduleExports.preview as { render?: () => React.Element } | undefined;
  if (preview && typeIs(preview.render, "function")) {
    return (preview.render as () => React.Element)();
  }

  const fallback = (moduleExports.default ?? moduleExports.App) as
    | React.FunctionComponent
    | undefined;
  if (fallback !== undefined) {
    return React.createElement(fallback);
  }

  error(
    "Nothing to render — export `const preview = { render: () => <…/> }` or a default component.",
  );
}

function PlaygroundStage() {
  const theme = useDocTheme();
  const [content, setContent] = React.useState<React.Element | undefined>(undefined);

  React.useEffect(() => {
    const onMessage = (event: HostMessageEvent) => {
      const data = event.data;
      if (!data || data.type !== "vela-playground-run" || data.code === undefined) {
        return;
      }

      const version = data.version ?? 0;
      try {
        const element = evaluate(data.code);
        // React state setters treat a function argument as an updater, and an
        // element is not one — wrap it so the element itself is stored.
        setContent(() => element);
        postToHost({ type: "vela-playground-result", version, ok: true });
      } catch (err) {
        postToHost({
          type: "vela-playground-result",
          version,
          ok: false,
          message: describeError(err),
        });
      }
    };

    window.addEventListener("message", onMessage);
    postToHost({ type: "vela-playground-ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // The backdrop is the stage's, so playground code that skips `VelaStage`
  // still sits on the page's own color rather than on nothing.
  return (
    <frame BackgroundColor3={BACKDROP[theme]} BorderSizePixel={0} Size={UDim2.fromScale(1, 1)}>
      {content ?? (
        <textlabel
          AnchorPoint={new Vector2(0.5, 0.5)}
          BackgroundTransparency={1}
          Position={UDim2.fromScale(0.5, 0.5)}
          Size={UDim2.fromOffset(320, 20)}
          Text="Waiting for playground code…"
          TextColor3={Color3.fromRGB(144, 161, 185)}
          TextSize={14}
        />
      )}
    </frame>
  );
}

export const preview = {
  render: () => <PlaygroundStage />,
  title: "Playground",
} as const;
