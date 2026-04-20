type DirectiveNode = {
	type: string;
	name?: string;
	attributes?: Record<string, unknown>;
	children?: unknown[];
};

type TreeNode = {
	children?: unknown[];
};

function isDirectiveNode(value: unknown): value is DirectiveNode {
	return typeof value === "object" && value !== null && "type" in value;
}

function isPmInstallDirective(value: unknown): value is DirectiveNode {
	if (!isDirectiveNode(value)) {
		return false;
	}

	const directiveTypes = new Set([
		"containerDirective",
		"leafDirective",
		"textDirective",
	]);

	return directiveTypes.has(value.type) && value.name === "pm-install";
}

function stringifyAttributeValue(value: unknown): string | undefined {
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

function readTextContent(node: unknown): string {
	if (typeof node !== "object" || node === null) {
		return "";
	}

	if (
		"type" in node &&
		(node as { type?: string }).type === "text" &&
		"value" in node &&
		typeof (node as { value?: unknown }).value === "string"
	) {
		return (node as { value: string }).value;
	}

	if (
		"value" in node &&
		typeof (node as { value?: unknown }).value === "string"
	) {
		return (node as { value: string }).value;
	}

	if (
		"children" in node &&
		Array.isArray((node as { children?: unknown[] }).children)
	) {
		return (node as { children: unknown[] }).children
			.map((child) => readTextContent(child))
			.join("");
	}

	return "";
}

function createMdxAttributes(node: DirectiveNode) {
	const attributes = [] as Array<{
		type: "mdxJsxAttribute";
		name: string;
		value?: string;
	}>;

	const inputAttributes = node.attributes ?? {};
	for (const [name, rawValue] of Object.entries(inputAttributes)) {
		const value = stringifyAttributeValue(rawValue);
		if (!value) {
			continue;
		}

		attributes.push({
			type: "mdxJsxAttribute",
			name,
			value,
		});
	}

	const hasDescription = attributes.some(
		(attribute) => attribute.name === "description",
	);
	if (
		!hasDescription &&
		Array.isArray(node.children) &&
		node.children.length > 0
	) {
		const content = readTextContent(node).trim();
		if (content.length > 0) {
			attributes.push({
				type: "mdxJsxAttribute",
				name: "description",
				value: content,
			});
		}
	}

	return attributes;
}

function createReplacementNode(node: DirectiveNode) {
	const attributes = createMdxAttributes(node);

	if (node.type === "textDirective") {
		return {
			type: "mdxJsxTextElement",
			name: "PackageManagerInstall",
			attributes,
			children: [],
		};
	}

	return {
		type: "mdxJsxFlowElement",
		name: "PackageManagerInstall",
		attributes,
		children: [],
	};
}

function transformTree(node: unknown) {
	if (typeof node !== "object" || node === null) {
		return;
	}

	const tree = node as TreeNode;
	if (!Array.isArray(tree.children)) {
		return;
	}

	for (let index = 0; index < tree.children.length; index += 1) {
		const child = tree.children[index];

		if (isPmInstallDirective(child)) {
			tree.children[index] = createReplacementNode(child);
			continue;
		}

		transformTree(child);
	}
}

export function remarkPmInstallDirective() {
	return (tree: unknown) => {
		transformTree(tree);
	};
}
