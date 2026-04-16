import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(__dirname, "..");
const DEFAULT_LATTICE_REPO = path.resolve(
	DOCS_ROOT,
	"..",
	"..",
	"rojo",
	"lattice-ui",
);
const OUTPUT_PATH = path.join(
	DOCS_ROOT,
	"src",
	"data",
	"lattice-snapshot.generated.ts",
);
const CHECK_MODE = process.argv.includes("--check");
const SOURCE_REPO = path.resolve(
	process.env.LATTICE_UI_REPO ?? DEFAULT_LATTICE_REPO,
);

async function main() {
	await ensureReadableDirectory(SOURCE_REPO);

	const snapshot = await buildSnapshot(SOURCE_REPO);
	const nextFileContent = renderSnapshotModule(snapshot);
	const currentFileContent = await readIfExists(OUTPUT_PATH);

	if (CHECK_MODE) {
		if (currentFileContent !== nextFileContent) {
			process.stderr.write(
				[
					"Lattice snapshot is out of date.",
					`Source repo: ${SOURCE_REPO}`,
					"Run `node ./scripts/sync-lattice-snapshot.mjs` to refresh the checked-in snapshot.",
					"",
				].join("\n"),
			);
			process.exitCode = 1;
			return;
		}

		process.stdout.write(`Lattice snapshot is up to date: ${OUTPUT_PATH}\n`);
		return;
	}

	if (currentFileContent === nextFileContent) {
		process.stdout.write(`No snapshot changes required: ${OUTPUT_PATH}\n`);
		return;
	}

	await fs.writeFile(OUTPUT_PATH, nextFileContent, "utf8");
	process.stdout.write(`Wrote lattice snapshot: ${OUTPUT_PATH}\n`);
}

async function ensureReadableDirectory(directoryPath) {
	let stat;
	try {
		stat = await fs.stat(directoryPath);
	} catch (error) {
		throw new Error(
			`Unable to read lattice-ui repo at "${directoryPath}". Set LATTICE_UI_REPO to override the source path.`,
			{ cause: error },
		);
	}

	if (!stat.isDirectory()) {
		throw new Error(`Lattice source path is not a directory: ${directoryPath}`);
	}
}

async function readIfExists(filePath) {
	try {
		return await fs.readFile(filePath, "utf8");
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"code" in error &&
			error.code === "ENOENT"
		) {
			return null;
		}

		throw error;
	}
}

async function readText(repoRoot, relativePath) {
	return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

async function readJson(repoRoot, relativePath) {
	const content = await readText(repoRoot, relativePath);
	return JSON.parse(content);
}

async function buildSnapshot(repoRoot) {
	const [
		cliPackageJson,
		cliSource,
		componentsRegistry,
		presetsRegistry,
		readme,
		changelog,
		packageDirs,
	] = await Promise.all([
		readJson(repoRoot, "packages/cli/package.json"),
		readText(repoRoot, "packages/cli/src/cli.ts"),
		readJson(repoRoot, "packages/cli/registry/components.json"),
		readJson(repoRoot, "packages/cli/registry/presets.json"),
		readText(repoRoot, "README.md"),
		readText(repoRoot, "CHANGELOG.md"),
		listPackageDirs(path.join(repoRoot, "packages")),
	]);

	const cli = buildCliSnapshot(cliPackageJson, cliSource, repoRoot);
	const workspace = buildWorkspaceSnapshot(readme, changelog);
	const packages = {};

	for (const slug of packageDirs) {
		const registryEntry = componentsRegistry.packages?.[slug];
		if (!registryEntry) {
			continue;
		}

		const experimentalEntry = workspace.stability.experimental.find(
			(entry) => entry.slug === slug,
		);
		const indexPath = path.join(repoRoot, "packages", slug, "src", "index.ts");
		packages[slug] = {
			slug,
			npm: registryEntry.npm,
			peers: sortStrings(registryEntry.peers ?? []),
			providers: (registryEntry.providers ?? []).map(parseProviderRequirement),
			notes: registryEntry.notes ?? [],
			exports: collectRuntimeExports(indexPath),
			maturity: experimentalEntry ? "experimental" : "stable",
			maturityNote:
				experimentalEntry?.note ?? "Part of the stable direction toward v1.0.",
		};
	}

	return {
		sourceRepo: path.basename(repoRoot),
		cli,
		registry: {
			packages: Object.fromEntries(
				Object.entries(componentsRegistry.packages ?? {})
					.sort(([left], [right]) => left.localeCompare(right))
					.map(([slug, entry]) => [
						slug,
						{
							npm: entry.npm,
							peers: sortStrings(entry.peers ?? []),
							providers: (entry.providers ?? []).map(parseProviderRequirement),
							notes: entry.notes ?? [],
						},
					]),
			),
			presets: Object.fromEntries(
				Object.entries(presetsRegistry.presets ?? {})
					.sort(([left], [right]) => left.localeCompare(right))
					.map(([presetName, members]) => [presetName, members]),
			),
		},
		packages,
		workspace,
	};
}

async function listPackageDirs(packagesRoot) {
	const entries = await fs.readdir(packagesRoot, { withFileTypes: true });
	return entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((left, right) => left.localeCompare(right));
}

function buildCliSnapshot(cliPackageJson, cliSource, repoRoot) {
	const helpText = extractHelpText(cliSource);
	const commands = parseHelpCommands(helpText);
	const phaseMap = parseCommandPhases(repoRoot);

	for (const [commandName, command] of Object.entries(commands)) {
		command.outputPhases = phaseMap[commandName] ?? [];
	}

	return {
		packageName: cliPackageJson.name,
		version: cliPackageJson.version,
		binaries: Object.keys(cliPackageJson.bin ?? {}).sort((left, right) =>
			left.localeCompare(right),
		),
		globalOptions: parseHelpList(helpText, "Global options:"),
		commands,
		examples: parseHelpList(helpText, "Examples:"),
	};
}

function extractHelpText(source) {
	const match = source.match(/const HELP_TEXT = `([\s\S]*?)`;/u);
	if (!match) {
		throw new Error("Unable to find HELP_TEXT in packages/cli/src/cli.ts");
	}

	return match[1];
}

function parseHelpCommands(helpText) {
	const commandsBlock = sliceBetween(
		helpText,
		"Commands:\n",
		"\nGlobal options:",
	);
	const entries = [
		...commandsBlock.matchAll(/^ {2}([^\n]+)\n {4}([^\n]+)$/gmu),
	];
	const commands = {};

	for (const [, signature, description] of entries) {
		const trimmedSignature = signature.trim();
		const commandName = trimmedSignature.split(/\s+/u)[0];
		commands[commandName] = {
			signature: trimmedSignature,
			description: description.trim(),
			flags: [...new Set(trimmedSignature.match(/--[a-z-]+/gmu) ?? [])],
			outputPhases: [],
		};
	}

	return commands;
}

function parseHelpList(helpText, heading) {
	const headingIndex = helpText.indexOf(heading);
	if (headingIndex === -1) {
		return [];
	}

	const tail = helpText.slice(headingIndex + heading.length);
	const nextHeadingMatch = tail.match(/\n[A-Z][^\n]+:\n/u);
	const block = nextHeadingMatch ? tail.slice(0, nextHeadingMatch.index) : tail;

	return block
		.split("\n")
		.map((line) => line.trim())
		.filter(
			(line) =>
				line.startsWith("-") ||
				line.startsWith("npx ") ||
				line.startsWith("lattice "),
		);
}

function parseCommandPhases(repoRoot) {
	const commandsRoot = path.join(
		repoRoot,
		"packages",
		"cli",
		"src",
		"commands",
	);
	const commandFiles = [
		["create", "create.ts"],
		["init", "init.ts"],
		["add", "add.ts"],
		["remove", "remove.ts"],
		["upgrade", "upgrade.ts"],
		["doctor", "doctor.ts"],
	];

	return Object.fromEntries(
		commandFiles.map(([commandName, fileName]) => {
			const source =
				ts.sys.readFile(path.join(commandsRoot, fileName), "utf8") ?? "";
			const phases = [
				...source.matchAll(/logger\.section\("([^"]+)"\)/gmu),
			].map((match) => match[1]);
			return [commandName, [...new Set(phases)]];
		}),
	);
}

function buildWorkspaceSnapshot(readme, changelog) {
	const stabilitySection = sliceBetween(
		readme,
		"## Stability and Versioning\n",
		"\n## Roadmap",
	);
	const roadmapSection = sliceBetween(readme, "## Roadmap\n", "");
	const unreleasedSection = sliceBetween(
		changelog,
		"## [Unreleased]\n",
		"\n## [",
	);
	const latestReleaseMatch = changelog.match(
		/^## \[(?<version>[^\]]+)\] - (?<date>[^\n]+)\n(?<body>[\s\S]*?)(?=^## \[|$)/mu,
	);

	return {
		stability: {
			stableDirection: parseStableDirection(stabilitySection),
			experimental: parseExperimentalPackages(stabilitySection),
		},
		roadmap: parseRoadmap(roadmapSection),
		changelog: {
			unreleased: parseChangelogSections(unreleasedSection),
			latestRelease: latestReleaseMatch?.groups
				? {
						version: latestReleaseMatch.groups.version,
						date: latestReleaseMatch.groups.date,
						summary: parseLeadParagraphs(latestReleaseMatch.groups.body),
						migrationNotes: parseMigrationNotes(latestReleaseMatch.groups.body),
						sections: parseChangelogSections(latestReleaseMatch.groups.body),
					}
				: null,
		},
	};
}

function parseStableDirection(markdown) {
	const stableSection = sliceBetween(
		markdown,
		"### Stable direction\n\n",
		"\n### Experimental or feature-limited",
	);
	const packages = [];

	for (const line of stableSection.split("\n")) {
		packages.push(
			...[...line.matchAll(/`([^`]+)`/gmu)].map((match) => match[1]),
		);
	}

	return sortStrings(packages);
}

function parseExperimentalPackages(markdown) {
	const section = sliceBetween(
		markdown,
		"### Experimental or feature-limited\n\n",
		"",
	);

	return section
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.startsWith("- "))
		.map((line) => {
			const match = line.match(/- `([^`]+)` - (.+)$/u);
			return match ? { slug: match[1], note: match[2] } : null;
		})
		.filter(Boolean);
}

function parseRoadmap(markdown) {
	const sectionRegex = /^### (?<title>[^\n]+)\n\n(?<body>(?:- .+\n?)*)/gmu;
	const sections = [];

	for (const match of markdown.matchAll(sectionRegex)) {
		sections.push({
			title: match.groups.title,
			bullets: match.groups.body
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line.startsWith("- "))
				.map((line) => line.slice(2)),
		});
	}

	return sections;
}

function parseLeadParagraphs(markdown) {
	return markdown
		.split("\n\n")
		.map((block) => block.trim())
		.filter(
			(block) =>
				block.length > 0 &&
				!block.startsWith("Migration notes:") &&
				!block.startsWith("### "),
		)
		.slice(0, 1);
}

function parseMigrationNotes(markdown) {
	const match = markdown.match(/Migration notes:\n\n(?<notes>(?:- .+\n?)+)/u);
	if (!match?.groups?.notes) {
		return [];
	}

	return match.groups.notes
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.startsWith("- "))
		.map((line) => line.slice(2));
}

function parseChangelogSections(markdown) {
	const sectionRegex = /^### (?<title>[^\n]+)\n(?<body>(?:- .+\n?)*)/gmu;
	const sections = {};

	for (const match of markdown.matchAll(sectionRegex)) {
		sections[match.groups.title] = match.groups.body
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.startsWith("- "))
			.map((line) => line.slice(2));
	}

	return sections;
}

function parseProviderRequirement(rawValue) {
	const optional = rawValue.endsWith("?");
	const normalized = optional ? rawValue.slice(0, -1) : rawValue;
	const [packageName, providerName] = normalized.split(":");

	return {
		raw: rawValue,
		packageName,
		providerName: providerName && providerName.length > 0 ? providerName : null,
		optional,
	};
}

function collectRuntimeExports(entryPath) {
	const sourceFileCache = new Map();
	const moduleExportCache = new Map();
	const exportOrder = [];
	const seenExports = new Set();

	function pushExport(name) {
		if (!name || seenExports.has(name)) {
			return;
		}

		seenExports.add(name);
		exportOrder.push(name);
	}

	function getSourceFile(filePath) {
		const normalizedPath = normalizeModulePath(filePath);
		if (sourceFileCache.has(normalizedPath)) {
			return sourceFileCache.get(normalizedPath);
		}

		const sourceText = ts.sys.readFile(normalizedPath, "utf8");
		if (!sourceText) {
			throw new Error(`Unable to read source file: ${normalizedPath}`);
		}

		const sourceFile = ts.createSourceFile(
			normalizedPath,
			sourceText,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TS,
		);
		sourceFileCache.set(normalizedPath, sourceFile);
		return sourceFile;
	}

	function collectModuleNamedExports(filePath, trail = new Set()) {
		const normalizedPath = normalizeModulePath(filePath);
		if (moduleExportCache.has(normalizedPath)) {
			return moduleExportCache.get(normalizedPath);
		}

		if (trail.has(normalizedPath)) {
			return [];
		}

		trail.add(normalizedPath);
		const sourceFile = getSourceFile(normalizedPath);
		const exports = [];
		const seen = new Set();

		function add(name) {
			if (!name || seen.has(name)) {
				return;
			}

			seen.add(name);
			exports.push(name);
		}

		for (const statement of sourceFile.statements) {
			if (ts.isExportDeclaration(statement)) {
				if (statement.isTypeOnly) {
					continue;
				}

				if (
					statement.exportClause &&
					ts.isNamedExports(statement.exportClause)
				) {
					for (const element of statement.exportClause.elements) {
						if (!element.isTypeOnly) {
							add(element.name.text);
						}
					}
					continue;
				}

				if (
					!statement.exportClause &&
					statement.moduleSpecifier &&
					ts.isStringLiteral(statement.moduleSpecifier)
				) {
					const targetPath = resolveImportPath(
						normalizedPath,
						statement.moduleSpecifier.text,
					);
					for (const name of collectModuleNamedExports(
						targetPath,
						new Set(trail),
					)) {
						add(name);
					}
				}
				continue;
			}

			if (hasExportModifier(statement)) {
				if (ts.isVariableStatement(statement)) {
					for (const declaration of statement.declarationList.declarations) {
						if (ts.isIdentifier(declaration.name)) {
							add(declaration.name.text);
						}
					}
					continue;
				}

				if (
					(ts.isFunctionDeclaration(statement) ||
						ts.isClassDeclaration(statement) ||
						ts.isEnumDeclaration(statement)) &&
					statement.name
				) {
					add(statement.name.text);
				}
			}
		}

		moduleExportCache.set(normalizedPath, exports);
		return exports;
	}

	const entryFile = getSourceFile(entryPath);

	for (const statement of entryFile.statements) {
		if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
			for (const declaration of statement.declarationList.declarations) {
				if (!ts.isIdentifier(declaration.name)) {
					continue;
				}

				const exportName = declaration.name.text;
				pushExport(exportName);

				const initializer = declaration.initializer
					? unwrapExpression(declaration.initializer)
					: null;
				if (initializer && ts.isObjectLiteralExpression(initializer)) {
					for (const property of initializer.properties) {
						const memberName = getObjectMemberName(property);
						if (memberName) {
							pushExport(`${exportName}.${memberName}`);
						}
					}
				}
			}
			continue;
		}

		if (ts.isExportDeclaration(statement)) {
			if (statement.isTypeOnly) {
				continue;
			}

			if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
				for (const element of statement.exportClause.elements) {
					if (!element.isTypeOnly) {
						pushExport(element.name.text);
					}
				}
				continue;
			}

			if (
				!statement.exportClause &&
				statement.moduleSpecifier &&
				ts.isStringLiteral(statement.moduleSpecifier)
			) {
				const targetPath = resolveImportPath(
					entryPath,
					statement.moduleSpecifier.text,
				);
				for (const name of collectModuleNamedExports(targetPath)) {
					pushExport(name);
				}
			}
			continue;
		}

		if (hasExportModifier(statement)) {
			if (
				(ts.isFunctionDeclaration(statement) ||
					ts.isClassDeclaration(statement) ||
					ts.isEnumDeclaration(statement)) &&
				statement.name
			) {
				pushExport(statement.name.text);
			}
		}
	}

	return exportOrder;
}

function hasExportModifier(node) {
	return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

function getObjectMemberName(property) {
	if (
		ts.isPropertyAssignment(property) ||
		ts.isShorthandPropertyAssignment(property)
	) {
		return property.name && ts.isIdentifier(property.name)
			? property.name.text
			: null;
	}

	return null;
}

function unwrapExpression(expression) {
	let current = expression;

	while (
		ts.isAsExpression(current) ||
		ts.isSatisfiesExpression(current) ||
		ts.isParenthesizedExpression(current)
	) {
		current = current.expression;
	}

	return current;
}

function normalizeModulePath(filePath) {
	const normalizedPath = path.normalize(filePath);
	const candidates = [
		normalizedPath,
		`${normalizedPath}.ts`,
		`${normalizedPath}.tsx`,
		path.join(normalizedPath, "index.ts"),
	];

	for (const candidate of candidates) {
		if (ts.sys.fileExists(candidate)) {
			return candidate;
		}
	}

	throw new Error(`Unable to resolve module path for ${filePath}`);
}

function resolveImportPath(fromFilePath, specifier) {
	if (!specifier.startsWith(".")) {
		throw new Error(
			`Only relative re-exports are supported in snapshot generation: ${specifier}`,
		);
	}

	return normalizeModulePath(
		path.resolve(path.dirname(fromFilePath), specifier),
	);
}

function sliceBetween(value, startMarker, endMarker) {
	const startIndex = startMarker ? value.indexOf(startMarker) : 0;
	if (startMarker && startIndex === -1) {
		return "";
	}

	const sliceStart = startMarker ? startIndex + startMarker.length : 0;
	if (!endMarker) {
		return value.slice(sliceStart);
	}

	const endIndex = value.indexOf(endMarker, sliceStart);
	if (endIndex === -1) {
		return value.slice(sliceStart);
	}

	return value.slice(sliceStart, endIndex);
}

function sortStrings(values) {
	return [...values].sort((left, right) => left.localeCompare(right));
}

function renderSnapshotModule(snapshot) {
	return [
		'import type { LatticeSnapshot } from "./lattice-snapshot-types";',
		"",
		"// This file is generated by scripts/sync-lattice-snapshot.mjs.",
		"// Do not edit it by hand.",
		`export const latticeSnapshot: LatticeSnapshot = ${serialize(snapshot)};`,
		"",
		"export default latticeSnapshot;",
		"",
	].join("\n");
}

function serialize(value, indentLevel = 0) {
	const indent = "  ".repeat(indentLevel);
	const nextIndent = "  ".repeat(indentLevel + 1);

	if (value === null) {
		return "null";
	}

	if (typeof value === "string") {
		return JSON.stringify(value);
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "[]";
		}

		return `[\n${value.map((item) => `${nextIndent}${serialize(item, indentLevel + 1)}`).join(",\n")}\n${indent}]`;
	}

	const entries = Object.entries(value);
	if (entries.length === 0) {
		return "{}";
	}

	return `{\n${entries
		.map(
			([key, entryValue]) =>
				`${nextIndent}${isIdentifier(key) ? key : JSON.stringify(key)}: ${serialize(entryValue, indentLevel + 1)}`,
		)
		.join(",\n")}\n${indent}}`
		.replace(/\\\{/g, "{")
		.replace(/\\\}/g, "}");
}

function isIdentifier(value) {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(value);
}

main().catch((error) => {
	process.stderr.write(
		`${error instanceof Error ? error.message : String(error)}\n`,
	);
	process.exitCode = 1;
});
