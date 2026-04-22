import * as React from "react";
import {
	PACKAGE_MANAGER_CHANGE_EVENT,
	PACKAGE_MANAGER_STORAGE_KEY,
	type PackageManager,
	type PackageManagerCommandMap,
	SUPPORTED_PACKAGE_MANAGERS,
} from "../../lib/package-manager-install";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

type CopyState = "idle" | "done" | "error";

type Props = {
	title?: string;
	description?: string;
	commands: PackageManagerCommandMap;
	managers: PackageManager[];
	defaultManager: PackageManager;
};

function isPackageManager(value: unknown): value is PackageManager {
	if (typeof value !== "string") {
		return false;
	}

	return SUPPORTED_PACKAGE_MANAGERS.includes(value as PackageManager);
}

function getAvailableManagers(
	commands: PackageManagerCommandMap,
	managers: PackageManager[],
): PackageManager[] {
	return managers.filter((manager) => {
		const command = commands[manager];
		return typeof command === "string" && command.trim().length > 0;
	});
}

function resolveDefaultManager(
	requestedDefault: PackageManager,
	availableManagers: PackageManager[],
): PackageManager {
	if (availableManagers.includes(requestedDefault)) {
		return requestedDefault;
	}

	if (availableManagers.includes("npm")) {
		return "npm";
	}

	return availableManagers[0] ?? "npm";
}

function readStoredManager(
	availableManagers: PackageManager[],
): PackageManager | undefined {
	const stored = window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
	if (!stored || !isPackageManager(stored)) {
		return undefined;
	}

	return availableManagers.includes(stored) ? stored : undefined;
}

export function PackageManagerInstallClient({
	title,
	description,
	commands,
	managers,
	defaultManager,
}: Props) {
	const availableManagers = React.useMemo(
		() => getAvailableManagers(commands, managers),
		[commands, managers],
	);
	const fallbackManager = React.useMemo(
		() => resolveDefaultManager(defaultManager, availableManagers),
		[defaultManager, availableManagers],
	);

	const [activeManager, setActiveManager] =
		React.useState<PackageManager>(fallbackManager);
	const [copyState, setCopyState] = React.useState<CopyState>("idle");
	const resetCopyStateTimeoutRef = React.useRef<number | undefined>(undefined);

	const selectManager = React.useCallback(
		(
			nextManager: PackageManager,
			options?: { persist?: boolean; broadcast?: boolean },
		) => {
			if (!availableManagers.includes(nextManager)) {
				return;
			}

			setActiveManager(nextManager);
			setCopyState("idle");

			const persist = options?.persist ?? true;
			const broadcast = options?.broadcast ?? true;

			if (persist) {
				window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, nextManager);
			}

			if (broadcast) {
				window.dispatchEvent(
					new CustomEvent(PACKAGE_MANAGER_CHANGE_EVENT, {
						detail: { manager: nextManager },
					}),
				);
			}
		},
		[availableManagers],
	);

	React.useEffect(() => {
		if (availableManagers.length === 0) {
			return;
		}

		const stored = readStoredManager(availableManagers);
		if (stored) {
			setActiveManager(stored);
			return;
		}

		setActiveManager(fallbackManager);
	}, [availableManagers, fallbackManager]);

	React.useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (
				event.key !== PACKAGE_MANAGER_STORAGE_KEY ||
				!event.newValue ||
				!isPackageManager(event.newValue)
			) {
				return;
			}

			if (!availableManagers.includes(event.newValue)) {
				return;
			}

			setActiveManager(event.newValue);
			setCopyState("idle");
		};

		const handleCustomChange = (event: Event) => {
			const detail = (event as CustomEvent<{ manager?: unknown }>).detail;
			if (!detail || !isPackageManager(detail.manager)) {
				return;
			}

			if (!availableManagers.includes(detail.manager)) {
				return;
			}

			setActiveManager(detail.manager);
			setCopyState("idle");
		};

		window.addEventListener("storage", handleStorage);
		window.addEventListener(
			PACKAGE_MANAGER_CHANGE_EVENT,
			handleCustomChange as EventListener,
		);

		return () => {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener(
				PACKAGE_MANAGER_CHANGE_EVENT,
				handleCustomChange as EventListener,
			);
		};
	}, [availableManagers]);

	React.useEffect(() => {
		return () => {
			if (resetCopyStateTimeoutRef.current !== undefined) {
				window.clearTimeout(resetCopyStateTimeoutRef.current);
			}
		};
	}, []);

	if (availableManagers.length === 0) {
		return null;
	}

	const activeCommand = commands[activeManager] ?? "";

	const resetCopyStateLater = () => {
		if (resetCopyStateTimeoutRef.current !== undefined) {
			window.clearTimeout(resetCopyStateTimeoutRef.current);
		}

		resetCopyStateTimeoutRef.current = window.setTimeout(() => {
			setCopyState("idle");
		}, 1400);
	};

	const copyCommand = async () => {
		if (!navigator.clipboard?.writeText) {
			setCopyState("error");
			resetCopyStateLater();
			return;
		}

		try {
			await navigator.clipboard.writeText(activeCommand);
			setCopyState("done");
		} catch {
			setCopyState("error");
		}

		resetCopyStateLater();
	};

	const handleTabsValueChange = (nextValue: string) => {
		if (!isPackageManager(nextValue)) {
			return;
		}

		selectManager(nextValue);
	};

	return (
		<div className="pm-install-root" data-pm-install>
			{(title || description) && (
				<div className="pm-install-header">
					{title && <p className="pm-install-title">{title}</p>}
					{description && (
						<p className="pm-install-description">{description}</p>
					)}
				</div>
			)}

			<Tabs
				className="pm-install-shell"
				value={activeManager}
				onValueChange={handleTabsValueChange}
			>
				<TabsList className="pm-install-tab-list" aria-label="Package manager">
					{availableManagers.map((manager) => (
						<TabsTrigger
							key={manager}
							className="pm-install-tab-button"
							value={manager}
						>
							<span className="pm-install-tab-label">{manager}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<TabsContent className="pm-install-panel" value={activeManager}>
					<Button
						type="button"
						variant="outline"
						size="icon"
						className="pm-install-copy-button"
						data-copy-state={copyState}
						aria-label={
							copyState === "done"
								? "Command copied"
								: copyState === "error"
									? "Copy command failed"
									: "Copy command"
						}
						title={
							copyState === "done"
								? "Copied"
								: copyState === "error"
									? "Copy failed"
									: "Copy"
						}
						onClick={copyCommand}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="pm-install-copy-icon pm-install-copy-icon-copy"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<rect x="9" y="9" width="13" height="13" rx="2"></rect>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
						</svg>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="pm-install-copy-icon pm-install-copy-icon-done"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M20 6 9 17l-5-5"></path>
						</svg>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="pm-install-copy-icon pm-install-copy-icon-error"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="9"></circle>
							<path d="M12 8v5"></path>
							<path d="M12 16h.01"></path>
						</svg>
					</Button>

					<pre className="pm-install-pre" data-pm-install-pre="true">
						<code>{activeCommand}</code>
					</pre>
				</TabsContent>
			</Tabs>
		</div>
	);
}
