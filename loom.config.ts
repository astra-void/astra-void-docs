import { createStaticTargetsDiscovery, defineConfig } from "@loom-dev/preview";

export default defineConfig({
	runtimeModule: "@loom-dev/preview-runtime",
	targetDiscovery: createStaticTargetsDiscovery([
		{
			name: "docs-examples",
			packageName: "astra-void-docs",
			packageRoot: ".",
			sourceRoot: "./src/examples/components",
		},
	]),
	transformMode: "compatibility",
	workspaceRoot: ".",
});
