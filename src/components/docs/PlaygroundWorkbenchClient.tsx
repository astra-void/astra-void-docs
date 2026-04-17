import * as latticeAccordion from "@lattice-ui/accordion";
import * as latticeAvatar from "@lattice-ui/avatar";
import * as latticeCheckbox from "@lattice-ui/checkbox";
import * as latticeCombobox from "@lattice-ui/combobox";
import * as latticeCore from "@lattice-ui/core";
import * as latticeDialog from "@lattice-ui/dialog";
import * as latticeFocus from "@lattice-ui/focus";
import * as latticeLayer from "@lattice-ui/layer";
import * as latticeMenu from "@lattice-ui/menu";
import * as latticePopover from "@lattice-ui/popover";
import * as latticePopper from "@lattice-ui/popper";
import * as latticeProgress from "@lattice-ui/progress";
import * as latticeRadioGroup from "@lattice-ui/radio-group";
import * as latticeScrollArea from "@lattice-ui/scroll-area";
import * as latticeSelect from "@lattice-ui/select";
import * as latticeSlider from "@lattice-ui/slider";
import * as latticeStyle from "@lattice-ui/style";
import * as latticeSwitch from "@lattice-ui/switch";
import * as latticeSystem from "@lattice-ui/system";
import * as latticeTabs from "@lattice-ui/tabs";
import * as latticeTextField from "@lattice-ui/text-field";
import * as latticeTextarea from "@lattice-ui/textarea";
import * as latticeToast from "@lattice-ui/toast";
import * as latticeToggleGroup from "@lattice-ui/toggle-group";
import * as latticeTooltip from "@lattice-ui/tooltip";
import { compile_tsx, transformPreviewSource } from "@loom-dev/compiler/wasm";
import {
	createPreviewElement,
	installPreviewBrowserGlobals,
} from "@loom-dev/preview/client";
import * as previewRuntime from "@loom-dev/preview-runtime";
import * as React from "react";
import * as ts from "typescript";

type PlaygroundTemplate = {
	slug: string;
	title: string;
	fileName: string;
	sourceCode: string;
};

type PreviewModule = Parameters<typeof createPreviewElement>[0]["module"];
type PreviewEntry = Parameters<typeof createPreviewElement>[0]["entry"];
type PreviewTransformDiagnostic = {
	code: string;
	severity: "error" | "info" | "warning";
	summary: string;
};

const COMPILE_DEBOUNCE_MS = 180;
const RBX_STYLE_HELPER_NAME = "__rbxStyle";
const RUNTIME_MODULE_SPECIFIER = "@loom-dev/preview-runtime";
const RBX_STYLE_IMPORT = `import { ${RBX_STYLE_HELPER_NAME} } from "${RUNTIME_MODULE_SPECIFIER}";\n`;

const STATIC_MODULE_MAP: Record<string, unknown> = {
	"@lattice-ui/accordion": latticeAccordion,
	"@lattice-ui/avatar": latticeAvatar,
	"@lattice-ui/checkbox": latticeCheckbox,
	"@lattice-ui/combobox": latticeCombobox,
	"@lattice-ui/core": latticeCore,
	"@lattice-ui/dialog": latticeDialog,
	"@lattice-ui/focus": latticeFocus,
	"@lattice-ui/layer": latticeLayer,
	"@lattice-ui/menu": latticeMenu,
	"@lattice-ui/popover": latticePopover,
	"@lattice-ui/popper": latticePopper,
	"@lattice-ui/progress": latticeProgress,
	"@lattice-ui/radio-group": latticeRadioGroup,
	"@lattice-ui/scroll-area": latticeScrollArea,
	"@lattice-ui/select": latticeSelect,
	"@lattice-ui/slider": latticeSlider,
	"@lattice-ui/style": latticeStyle,
	"@lattice-ui/switch": latticeSwitch,
	"@lattice-ui/system": latticeSystem,
	"@lattice-ui/tabs": latticeTabs,
	"@lattice-ui/text-field": latticeTextField,
	"@lattice-ui/textarea": latticeTextarea,
	"@lattice-ui/toast": latticeToast,
	"@lattice-ui/toggle-group": latticeToggleGroup,
	"@lattice-ui/tooltip": latticeTooltip,
	"@rbxts/react": React,
	"@loom-dev/preview-runtime": previewRuntime,
};

const MODULE_NAMES = Object.keys(STATIC_MODULE_MAP).sort();

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

function useDebouncedValue<T>(value: T, waitMs: number) {
	const [debounced, setDebounced] = React.useState(value);

	React.useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebounced(value);
		}, waitMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [value, waitMs]);

	return debounced;
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

function formatTranspileDiagnostics(diagnostics: readonly ts.Diagnostic[]) {
	return diagnostics
		.map((diagnostic) => {
			const message = ts.flattenDiagnosticMessageText(
				diagnostic.messageText,
				"\n",
			);

			if (diagnostic.file && typeof diagnostic.start === "number") {
				const position = diagnostic.file.getLineAndCharacterOfPosition(
					diagnostic.start,
				);

				return `${String(position.line + 1)}:${String(position.character + 1)} ${message}`;
			}

			return message;
		})
		.join("\n");
}

function toCommonJsCompatModule(value: unknown): Record<string, unknown> {
	if (!isRecord(value)) {
		return {
			__esModule: true,
			default: value,
		};
	}

	const compatValue: Record<string, unknown> = {
		...value,
	};

	if (!Object.hasOwn(compatValue, "default")) {
		compatValue.default = value;
	}

	if (!Object.hasOwn(compatValue, "__esModule")) {
		compatValue.__esModule = true;
	}

	return compatValue;
}

function executeCommonJsModule(sourceCode: string): PreviewModule {
	const localRequire = (specifier: string) => {
		if (!Object.hasOwn(STATIC_MODULE_MAP, specifier)) {
			throw new Error(
				`Unsupported import "${specifier}". Allowed imports: ${MODULE_NAMES.join(", ")}`,
			);
		}

		return toCommonJsCompatModule(STATIC_MODULE_MAP[specifier]);
	};

	const moduleRecord = {
		exports: {} as unknown,
	};

	const evaluator = new Function(
		"module",
		"exports",
		"require",
		`"use strict";\n${sourceCode}\nreturn module.exports;`,
	) as (
		moduleArg: { exports: unknown },
		exportsArg: unknown,
		requireArg: (specifier: string) => unknown,
	) => unknown;

	const result = evaluator(moduleRecord, moduleRecord.exports, localRequire);
	const exportedValue = result ?? moduleRecord.exports;

	if (isRecord(exportedValue)) {
		return exportedValue as PreviewModule;
	}

	return {
		default: exportedValue,
	} as PreviewModule;
}

function compilePreviewModule(sourceCode: string, slug: string) {
	const filePath = `/src/examples/components/${slug}.tsx`;
	const transformed = transformPreviewSource(sourceCode, {
		filePath,
		mode: "compatibility",
		reactAliases: ["@rbxts/react"],
		reactRobloxAliases: ["@rbxts/react-roblox"],
		runtimeModule: RUNTIME_MODULE_SPECIFIER,
		target: "docs-examples",
	});
	const diagnostics = Array.isArray(transformed.diagnostics)
		? (transformed.diagnostics as PreviewTransformDiagnostic[])
		: [];

	if (transformed.code == null) {
		const diagnosticMessage =
			diagnostics
				.map((diagnostic) => `${diagnostic.code}: ${diagnostic.summary}`)
				.join("\n") || "Preview transform did not emit executable code.";
		throw new Error(diagnosticMessage);
	}

	let compiledCode = compile_tsx(transformed.code);

	if (
		compiledCode.includes(RBX_STYLE_HELPER_NAME) &&
		!compiledCode.includes(RBX_STYLE_IMPORT.trim())
	) {
		compiledCode = `${RBX_STYLE_IMPORT}${compiledCode}`;
	}

	const transpiled = ts.transpileModule(compiledCode, {
		compilerOptions: {
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			jsx: ts.JsxEmit.React,
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2020,
			verbatimModuleSyntax: false,
		},
		reportDiagnostics: true,
		fileName: filePath,
	});

	if (transpiled.diagnostics && transpiled.diagnostics.length > 0) {
		throw new Error(formatTranspileDiagnostics(transpiled.diagnostics));
	}

	const module = executeCommonJsModule(transpiled.outputText);

	return {
		diagnostics,
		module,
	};
}

class PreviewErrorBoundary extends React.Component<
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
				<div className="absolute inset-0 z-10 overflow-auto bg-red-500/10 p-4 text-sm text-red-200">
					Runtime error: {this.state.error.message}
				</div>
			);
		}

		return this.props.children;
	}
}

export default function PlaygroundWorkbenchClient({
	templates,
}: {
	templates: PlaygroundTemplate[];
}) {
	const sortedTemplates = React.useMemo(
		() =>
			[...templates].sort((left, right) =>
				left.title.localeCompare(right.title),
			),
		[templates],
	);
	const firstTemplate = sortedTemplates[0] ?? null;
	const [selectedSlug, setSelectedSlug] = React.useState(
		firstTemplate?.slug ?? "",
	);
	const selectedTemplate = React.useMemo(
		() =>
			sortedTemplates.find((template) => template.slug === selectedSlug) ??
			firstTemplate,
		[firstTemplate, selectedSlug, sortedTemplates],
	);
	const [code, setCode] = React.useState(firstTemplate?.sourceCode ?? "");
	const debouncedCode = useDebouncedValue(code, COMPILE_DEBOUNCE_MS);
	const [previewElement, setPreviewElement] =
		React.useState<React.ReactElement | null>(null);
	const [previewKey, setPreviewKey] = React.useState(0);
	const [error, setError] = React.useState<Error | null>(null);
	const [isCompiling, setIsCompiling] = React.useState(false);
	const [diagnostics, setDiagnostics] = React.useState<
		PreviewTransformDiagnostic[]
	>([]);

	React.useEffect(() => {
		if (!selectedTemplate) {
			return;
		}

		setCode(selectedTemplate.sourceCode);
	}, [selectedTemplate]);

	React.useEffect(() => {
		if (!selectedTemplate) {
			setPreviewElement(null);
			setError(new Error("No starter templates were found."));
			setDiagnostics([]);
			return;
		}

		let cancelled = false;
		const releaseGlobals = acquirePreviewGlobals();
		setIsCompiling(true);

		try {
			const compiled = compilePreviewModule(
				debouncedCode,
				selectedTemplate.slug,
			);
			const exportName = findComponentExportName(compiled.module);

			if (!exportName) {
				throw new Error(
					"No React component export found. Export a component such as MyExample.",
				);
			}

			const nextPreviewElement = createPreviewElement({
				entry: createPreviewEntry(exportName),
				module: createPreviewModule(compiled.module),
				wrapInShell: true,
			});

			if (!cancelled) {
				setPreviewElement(nextPreviewElement);
				setPreviewKey((value) => value + 1);
				setError(null);
				setDiagnostics(compiled.diagnostics);
			}
		} catch (nextError) {
			if (!cancelled) {
				setPreviewElement(null);
				setDiagnostics([]);
				setError(nextError as Error);
			}
		} finally {
			if (!cancelled) {
				setIsCompiling(false);
			}
		}

		return () => {
			cancelled = true;
			releaseGlobals();
		};
	}, [debouncedCode, selectedTemplate]);

	if (!firstTemplate || !selectedTemplate) {
		return (
			<div className="rounded-md border p-4 text-sm text-muted-foreground">
				No starter templates were found in src/examples/components.
			</div>
		);
	}

	const isDebouncing = code !== debouncedCode;
	const hasCustomCode = code !== selectedTemplate.sourceCode;
	const showInitialPreviewSkeleton =
		!previewElement && !error && previewKey === 0;

	return (
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<section className="space-y-3">
				<div className="flex flex-wrap items-center gap-3">
					<label
						htmlFor="playground-template"
						className="text-sm font-medium text-foreground"
					>
						Starter template
					</label>

					<select
						id="playground-template"
						className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
						value={selectedTemplate.slug}
						onChange={(event) => {
							setSelectedSlug(event.currentTarget.value);
						}}
					>
						{sortedTemplates.map((template) => (
							<option key={template.slug} value={template.slug}>
								{template.title}
							</option>
						))}
					</select>

					<button
						type="button"
						disabled={!hasCustomCode}
						onClick={() => {
							setCode(selectedTemplate.sourceCode);
						}}
						className="inline-flex h-9 items-center rounded-md border bg-background px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
					>
						Reset
					</button>

					<span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
						{selectedTemplate.fileName}
					</span>
				</div>

				<textarea
					className="min-h-128 w-full rounded-md border bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					value={code}
					onChange={(event) => {
						setCode(event.currentTarget.value);
					}}
					spellCheck={false}
				/>

				<p className="text-xs text-muted-foreground">
					Changes apply automatically after {COMPILE_DEBOUNCE_MS} ms.
				</p>
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-foreground">
						Live Preview
					</h3>
					<span className="text-xs text-muted-foreground">
						{isDebouncing || isCompiling ? "Updating..." : "Up to date"}
					</span>
				</div>

				<div className="relative min-h-128 overflow-hidden rounded-md border bg-[#1e1e1e]">
					{previewElement ? (
						<PreviewErrorBoundary
							key={`${selectedTemplate.slug}-${previewKey}`}
						>
							{previewElement}
						</PreviewErrorBoundary>
					) : null}

					{showInitialPreviewSkeleton ? (
						<div
							className="absolute inset-0 flex flex-col gap-4 p-4"
							role="status"
							aria-live="polite"
						>
							<div className="h-4 w-40 animate-pulse rounded-md bg-white/15" />
							<div className="space-y-3">
								<div className="h-16 animate-pulse rounded-md bg-white/10" />
								<div className="h-20 animate-pulse rounded-md bg-white/10" />
								<div className="h-10 w-5/6 animate-pulse rounded-md bg-white/10" />
							</div>
							<div className="mt-auto text-xs text-zinc-300/80">
								Preparing live preview...
							</div>
						</div>
					) : null}

					{error ? (
						<div className="absolute inset-x-0 bottom-0 z-10 m-3 whitespace-pre-wrap rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
							{error.message}
						</div>
					) : null}
				</div>

				{diagnostics.length > 0 ? (
					<div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
						<p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">
							Transform diagnostics
						</p>
						<ul className="m-0 list-disc space-y-1 pl-4">
							{diagnostics.map((diagnostic) => (
								<li
									key={`${diagnostic.severity}-${diagnostic.code}-${diagnostic.summary}`}
								>
									{diagnostic.code}: {diagnostic.summary}
								</li>
							))}
						</ul>
					</div>
				) : null}
			</section>
		</div>
	);
}
