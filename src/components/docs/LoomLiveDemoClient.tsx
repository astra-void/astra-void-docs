import * as React from "react";
import {
  createPreviewElement,
  installPreviewBrowserGlobals,
} from "@loom-dev/preview/client";

const components = import.meta.glob("../../examples/components/*.tsx");

type PreviewModule = Parameters<typeof createPreviewElement>[0]["module"];
type PreviewEntry = Parameters<typeof createPreviewElement>[0]["entry"];

let previewGlobalsRefCount = 0;
let restorePreviewGlobals: (() => void) | null = null;

function acquirePreviewGlobals() {
  if (previewGlobalsRefCount === 0) {
    restorePreviewGlobals = installPreviewBrowserGlobals();
  }

  previewGlobalsRefCount += 1;

  return () => {
    previewGlobalsRefCount = Math.max(0, previewGlobalsRefCount - 1);

    if (previewGlobalsRefCount === 0) {
      restorePreviewGlobals?.();
      restorePreviewGlobals = null;
    }
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRenderableComponentExport(value: unknown) {
  return (
    typeof value === "function" ||
    (isRecord(value) && "$$typeof" in value)
  );
}

function findComponentExportName(module: PreviewModule): string | null {
  const namedExportNames = Object.entries(module)
    .filter(([exportName, exportValue]) => {
      if (exportName === "default" || exportName === "preview") {
        return false;
      }

      return isRenderableComponentExport(exportValue);
    })
    .map(([exportName]) => exportName);

  const preferredExportName =
    namedExportNames.find((exportName) => exportName.endsWith("Example")) ??
    namedExportNames[0];

  if (preferredExportName) {
    return preferredExportName;
  }

  return isRenderableComponentExport(module.default) ? "default" : null;
}

function resolvePlayerGui() {
  const game = (globalThis as typeof globalThis & {
    game?: {
      GetService?: (serviceName: string) => {
        LocalPlayer?: {
          PlayerGui?: unknown;
        };
      } | undefined;
    };
  }).game;

  return game?.GetService?.("Players")?.LocalPlayer?.PlayerGui;
}

function createPreviewModule(module: PreviewModule): PreviewModule {
  const playerGui = resolvePlayerGui();

  if (!playerGui) {
    return module;
  }

  const preview = isRecord(module.preview) ? module.preview : {};
  const props = isRecord(preview.props) ? preview.props : {};

  return {
    ...module,
    preview: {
      ...preview,
      props: {
        ...props,
        playerGui,
      },
    },
  };
}

function createPreviewEntry(exportName: string): PreviewEntry {
  return {
    renderTarget: {
      kind: "component",
      exportName,
      usesPreviewProps: true,
    },
  } as PreviewEntry;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-red-500 text-sm">
          Render error: {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

export function LoomLiveDemoClient({ slug }: { slug: string }) {
  const [previewElement, setPreviewElement] =
    React.useState<React.ReactElement | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const releaseGlobals = acquirePreviewGlobals();

    async function load() {
      try {
        setError(null);
        setPreviewElement(null);

        const loader = components[`../../examples/components/${slug}.tsx`];
        if (!loader) {
          throw new Error("Demo source file not found.");
        }

        const mod = (await loader()) as PreviewModule;
        const exportName = findComponentExportName(mod);

        if (!exportName) {
          throw new Error("No React component exported from example.");
        }

        const nextPreviewElement = createPreviewElement({
          entry: createPreviewEntry(exportName),
          module: createPreviewModule(mod),
          wrapInShell: true,
        });

        if (!cancelled) {
          setPreviewElement(nextPreviewElement);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError as Error);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      releaseGlobals();
    };
  }, [slug]);

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        Demo unavailable: {error.message}
      </div>
    );
  }

  if (!previewElement) {
    return (
      <div className="p-4 text-muted-foreground text-sm animate-pulse">
        Booting preview...
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full overflow-hidden bg-[#1e1e1e]">
      <ErrorBoundary key={slug}>{previewElement}</ErrorBoundary>
    </div>
  );
}
