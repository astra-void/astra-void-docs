export const SUPPORTED_PACKAGE_MANAGERS = [
	"npm",
	"pnpm",
	"yarn",
	"bun",
] as const;

export type PackageManager = (typeof SUPPORTED_PACKAGE_MANAGERS)[number];

export type PackageManagerCommandMap = Partial<Record<PackageManager, string>>;

export type ResolvedPackageManagerInstall = {
	title?: string;
	description?: string;
	commands: PackageManagerCommandMap;
	managers: PackageManager[];
	defaultManager: PackageManager;
};

export const PACKAGE_MANAGER_STORAGE_KEY = "lattice-ui-docs:pm-install:manager";
export const PACKAGE_MANAGER_CHANGE_EVENT = "lattice-ui-docs:pm-install:change";

function toStringValue(value: unknown): string | undefined {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	return undefined;
}

function normalizeManager(value: unknown): PackageManager | undefined {
	const raw = toStringValue(value)?.toLowerCase();
	if (!raw) {
		return undefined;
	}

	return SUPPORTED_PACKAGE_MANAGERS.find((manager) => manager === raw);
}

function parseManagerList(value: unknown): PackageManager[] {
	const raw = toStringValue(value);
	if (!raw) {
		return [];
	}

	const normalized = raw
		.split(/[,\s]+/g)
		.map((entry) => entry.trim().toLowerCase())
		.filter((entry) => entry.length > 0);

	const seen = new Set<PackageManager>();
	const managers: PackageManager[] = [];

	for (const candidate of normalized) {
		const manager = normalizeManager(candidate);
		if (!manager || seen.has(manager)) {
			continue;
		}

		seen.add(manager);
		managers.push(manager);
	}

	return managers;
}

function parseBooleanish(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	const raw = toStringValue(value)?.toLowerCase();
	if (!raw) {
		return false;
	}

	return raw === "true" || raw === "1" || raw === "yes";
}

function parsePackageList(value: unknown): string[] {
	const raw = toStringValue(value);
	if (!raw) {
		return [];
	}

	return raw
		.split(/[,\s]+/g)
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

function buildNpmInstallCommand(packages: string[], dev: boolean) {
	return `npm install${dev ? " --save-dev" : ""} ${packages.join(" ")}`;
}

function buildPnpmInstallCommand(packages: string[], dev: boolean) {
	return `pnpm add${dev ? " -D" : ""} ${packages.join(" ")}`;
}

function buildYarnInstallCommand(packages: string[], dev: boolean) {
	return `yarn add${dev ? " --dev" : ""} ${packages.join(" ")}`;
}

function buildBunInstallCommand(packages: string[], dev: boolean) {
	return `bun add${dev ? " -d" : ""} ${packages.join(" ")}`;
}

export function buildInstallCommand(
	manager: PackageManager,
	packages: string[],
	options?: { dev?: boolean },
): string {
	const dev = options?.dev ?? false;

	if (manager === "npm") {
		return buildNpmInstallCommand(packages, dev);
	}

	if (manager === "pnpm") {
		return buildPnpmInstallCommand(packages, dev);
	}

	if (manager === "yarn") {
		return buildYarnInstallCommand(packages, dev);
	}

	return buildBunInstallCommand(packages, dev);
}

function getExplicitCommands(
	input: Record<string, unknown>,
): PackageManagerCommandMap {
	const commands: PackageManagerCommandMap = {};

	for (const manager of SUPPORTED_PACKAGE_MANAGERS) {
		const value = toStringValue(input[manager]);
		if (!value) {
			continue;
		}

		commands[manager] = value;
	}

	return commands;
}

function buildGeneratedCommands(
	packages: string[],
	managers: PackageManager[],
	dev: boolean,
): PackageManagerCommandMap {
	if (packages.length === 0) {
		return {};
	}

	const commands: PackageManagerCommandMap = {};
	for (const manager of managers) {
		commands[manager] = buildInstallCommand(manager, packages, { dev });
	}

	return commands;
}

function resolveDefaultManager(
	requestedDefault: unknown,
	availableManagers: PackageManager[],
): PackageManager {
	const candidate = normalizeManager(requestedDefault);
	if (candidate && availableManagers.includes(candidate)) {
		return candidate;
	}

	if (availableManagers.includes("npm")) {
		return "npm";
	}

	return availableManagers[0] ?? "npm";
}

export function resolvePackageManagerInstallInput(
	input: Record<string, unknown>,
): ResolvedPackageManagerInstall {
	const managersFromInput = parseManagerList(input.managers);
	const candidateManagers =
		managersFromInput.length > 0
			? managersFromInput
			: [...SUPPORTED_PACKAGE_MANAGERS];

	const explicitCommands = getExplicitCommands(input);
	const packages = parsePackageList(
		input.packages ?? input.package ?? input.pkg,
	);
	const generatedCommands = buildGeneratedCommands(
		packages,
		candidateManagers,
		parseBooleanish(input.dev),
	);
	const commands: PackageManagerCommandMap = {
		...generatedCommands,
		...explicitCommands,
	};

	const managers = candidateManagers.filter((manager) => {
		const command = commands[manager];
		return typeof command === "string" && command.trim().length > 0;
	});

	const fallbackCommand = toStringValue(input.command);
	if (managers.length === 0 && fallbackCommand) {
		const fallbackManager = resolveDefaultManager(
			input.defaultManager,
			candidateManagers,
		);
		commands[fallbackManager] = fallbackCommand;
		managers.push(fallbackManager);
	}

	const defaultManager = resolveDefaultManager(input.defaultManager, managers);

	return {
		title: toStringValue(input.title),
		description: toStringValue(input.description),
		commands,
		managers,
		defaultManager,
	};
}
