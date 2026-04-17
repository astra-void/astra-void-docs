import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { loadPreviewConfig } from "@loom-dev/preview";
import {
	createPreviewVitePlugin,
	createScopedPreviewPlugins,
} from "@loom-dev/preview/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import wasmPluginModule from "vite-plugin-wasm";

const require = createRequire(import.meta.url);
const docsSiteUrl = process.env.DOCS_SITE_URL;
const packageJson = require("./package.json");
const resolvedPreviewConfig = await loadPreviewConfig({ cwd: process.cwd() });
const previewPackageRoot = path.dirname(
	path.dirname(fileURLToPath(import.meta.resolve("@loom-dev/preview"))),
);
const previewRuntimePackageRoot = path.dirname(
	path.dirname(fileURLToPath(import.meta.resolve("@loom-dev/preview-runtime"))),
);
const previewRobloxEnvEntry = path.resolve(
	previewPackageRoot,
	"dist/source/robloxEnv.js",
);
const previewRuntimeSourceEntry = path.resolve(
	previewRuntimePackageRoot,
	"src/index.ts",
);
const unresolvedEnvShimPath = path.resolve(
	process.cwd(),
	"src/shims/loom-unresolved-env.ts",
);
function isLatticePackageName(packageName) {
	return packageName.startsWith("@lattice-ui/");
}

function readPackageJson(packageRoot) {
	return require(path.join(packageRoot, "package.json"));
}

function collectLatticePackageAliases(rootDependencies) {
	const aliasesByName = new Map();
	const pendingPackages = Object.keys(rootDependencies ?? {})
		.filter(isLatticePackageName)
		.map((packageName) => ({ packageName, resolver: require }));

	while (pendingPackages.length > 0) {
		const pendingPackage = pendingPackages.shift();
		if (!pendingPackage || aliasesByName.has(pendingPackage.packageName)) {
			continue;
		}

		const packageRoot = path.dirname(
			path.dirname(pendingPackage.resolver.resolve(pendingPackage.packageName)),
		);
		const packageMetadata = readPackageJson(packageRoot);

		aliasesByName.set(pendingPackage.packageName, {
			find: pendingPackage.packageName,
			replacement: path.join(packageRoot, "src/index.ts"),
		});

		const packageResolver = createRequire(
			path.join(packageRoot, "package.json"),
		);
		const dependencyNames = Object.keys(
			packageMetadata.dependencies ?? {},
		).filter(isLatticePackageName);

		for (const dependencyName of dependencyNames) {
			pendingPackages.push({
				packageName: dependencyName,
				resolver: packageResolver,
			});
		}
	}

	return [...aliasesByName.values()].sort((left, right) =>
		left.find.localeCompare(right.find),
	);
}

const latticePackageAliases = collectLatticePackageAliases(
	packageJson.dependencies,
);
const latticePackageTargets = latticePackageAliases.map((alias) => {
	const sourceRoot = path.dirname(alias.replacement);

	return {
		name: alias.find.replace("@lattice-ui/", "lattice-"),
		packageName: alias.find,
		packageRoot: path.dirname(sourceRoot),
		sourceRoot,
	};
});
const previewTransformTargets = [
	...resolvedPreviewConfig.targets,
	...latticePackageTargets,
];
const wasm = wasmPluginModule.default ?? wasmPluginModule;
const previewPluginScopeConfig = {
	...resolvedPreviewConfig,
	targets: previewTransformTargets,
	workspaceRoot:
		resolvedPreviewConfig.targets[0]?.sourceRoot ??
		resolvedPreviewConfig.workspaceRoot,
};
const previewPlugins = createScopedPreviewPlugins(
	createPreviewVitePlugin({
		projectName: resolvedPreviewConfig.projectName,
		reactAliases: resolvedPreviewConfig.reactAliases,
		reactRobloxAliases: resolvedPreviewConfig.reactRobloxAliases,
		runtimeModule: resolvedPreviewConfig.runtimeModule,
		runtimeAliases: resolvedPreviewConfig.runtimeAliases,
		targets: previewTransformTargets,
		transformMode: resolvedPreviewConfig.transformMode,
		workspaceRoot: resolvedPreviewConfig.workspaceRoot,
	}),
	previewPluginScopeConfig,
);
const scopedPreviewPlugins = createScopedPreviewPlugins(
	[wasm()],
	previewPluginScopeConfig,
);

export default defineConfig({
	base: "/",
	...(docsSiteUrl ? { site: docsSiteUrl } : {}),
	integrations: [mdx(), react()],
	vite: {
		assetsInclude: ["**/*.wasm"],
		optimizeDeps: {
			exclude: [
				"@loom-dev/compiler",
				"@loom-dev/compiler/wasm",
				"@loom-dev/layout-engine",
				"layout-engine",
				...latticePackageAliases.map((alias) => alias.find),
				"@rbxts/react",
				"@rbxts/react-roblox",
				"@rbxts/services",
			],
		},
		plugins: [...previewPlugins, ...scopedPreviewPlugins, tailwindcss()],
		resolve: {
			alias: [
				...latticePackageAliases,
				{
					find: previewRobloxEnvEntry,
					replacement: unresolvedEnvShimPath,
				},
				{
					find: "@loom-dev/preview-runtime",
					replacement: previewRuntimeSourceEntry,
				},
			],
		},
		server: {
			fs: {
				allow: resolvedPreviewConfig.server.fsAllow,
			},
		},
	},
});
