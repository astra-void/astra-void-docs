import {
	createPreviewElement,
	installPreviewBrowserGlobals,
} from "@loom-dev/preview/client";
import * as React from "react";

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
		typeof value === "function" || (isRecord(value) && "$$typeof" in value)
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
	const game = (
		globalThis as typeof globalThis & {
			game?: {
				GetService?: (serviceName: string) =>
					| {
							LocalPlayer?: {
								PlayerGui?: unknown;
							};
					  }
					| undefined;
			};
		}
	).game;

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

function DemoLoadingPanel() {
	return (
		<div className="loom-demo-state" role="status" aria-live="polite">
			<span className="loom-demo-spinner" aria-hidden="true"></span>
			<p className="loom-demo-state-title">Starting live demo</p>
			<p className="loom-demo-state-message">
				Preparing the preview runtime for this example.
			</p>
		</div>
	);
}

function DemoErrorPanel({
	title,
	message,
	technicalDetails,
	onRetry,
	playgroundHref,
}: {
	title?: string;
	message: string;
	technicalDetails?: string;
	onRetry: () => void;
	playgroundHref?: string;
}) {
	return (
		<div className="loom-demo-state loom-demo-state-error" role="alert">
			<p className="loom-demo-state-title">{title ?? "Demo unavailable"}</p>
			<p className="loom-demo-state-message">{message}</p>
			<div className="loom-demo-state-actions">
				<button
					type="button"
					onClick={onRetry}
					className="loom-demo-state-action"
				>
					Retry
				</button>
				{playgroundHref ? (
					<a
						href={playgroundHref}
						className="loom-demo-state-action is-secondary"
					>
						Open playground
					</a>
				) : null}
			</div>
			{technicalDetails ? (
				<details className="loom-demo-state-details">
					<summary>Technical details</summary>
					<pre className="loom-demo-state-pre">{technicalDetails}</pre>
				</details>
			) : null}
		</div>
	);
}

class ErrorBoundary extends React.Component<
	{
		children: React.ReactNode;
		onRetry: () => void;
		playgroundHref?: string;
	},
	{ error: Error | null }
> {
	constructor(props: {
		children: React.ReactNode;
		onRetry: () => void;
		playgroundHref?: string;
	}) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	componentDidUpdate(
		prevProps: Readonly<{
			children: React.ReactNode;
			onRetry: () => void;
			playgroundHref?: string;
		}>,
	) {
		if (this.state.error && prevProps.children !== this.props.children) {
			this.setState({ error: null });
		}
	}

	render() {
		if (this.state.error) {
			return (
				<DemoErrorPanel
					title="Preview crashed"
					message="This demo hit a render error. Try reloading it or continue in the playground."
					technicalDetails={this.state.error.stack ?? this.state.error.message}
					onRetry={this.props.onRetry}
					playgroundHref={this.props.playgroundHref}
				/>
			);
		}

		return this.props.children;
	}
}

export function LoomLiveDemoClient({
	slug,
	playgroundHref,
}: {
	slug: string;
	playgroundHref?: string;
}) {
	const [previewElement, setPreviewElement] =
		React.useState<React.ReactElement | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	const [reloadToken, setReloadToken] = React.useState(0);

	const handleRetry = React.useCallback(() => {
		setReloadToken((current) => current + 1);
	}, []);

	React.useEffect(() => {
		let cancelled = false;
		const releaseGlobals = acquirePreviewGlobals();
		const retrySuffix = reloadToken > 0 ? ` after retry ${reloadToken}` : "";

		async function load() {
			try {
				setError(null);
				setPreviewElement(null);

				const loader = components[`../../examples/components/${slug}.tsx`];
				if (!loader) {
					throw new Error(`Demo source file not found${retrySuffix}.`);
				}

				const mod = (await loader()) as PreviewModule;
				const exportName = findComponentExportName(mod);

				if (!exportName) {
					throw new Error(
						`No React component exported from example${retrySuffix}.`,
					);
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
	}, [slug, reloadToken]);

	if (error) {
		return (
			<DemoErrorPanel
				message="We couldn't load this demo right now."
				technicalDetails={error.stack ?? error.message}
				onRetry={handleRetry}
				playgroundHref={playgroundHref}
			/>
		);
	}

	if (!previewElement) {
		return <DemoLoadingPanel />;
	}

	return (
		<div className="loom-live-demo-shell">
			<ErrorBoundary
				key={`${slug}-${reloadToken}`}
				onRetry={handleRetry}
				playgroundHref={playgroundHref}
			>
				{previewElement}
			</ErrorBoundary>
		</div>
	);
}
