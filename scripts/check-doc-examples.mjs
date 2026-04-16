import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, "..");
const examplesTsconfig = path.join(docsRoot, "tsconfig.examples.json");
const tscPath = path.join(
	docsRoot,
	"node_modules",
	"typescript",
	"lib",
	"tsc.js",
);

if (!fs.existsSync(tscPath)) {
	console.error(`Missing TypeScript compiler: ${tscPath}`);
	process.exit(1);
}

const child = spawn(
	process.execPath,
	[tscPath, "-p", examplesTsconfig, "--pretty", "false"],
	{
		cwd: docsRoot,
		stdio: "inherit",
	},
);

child.on("exit", (code) => {
	process.exit(code ?? 1);
});
