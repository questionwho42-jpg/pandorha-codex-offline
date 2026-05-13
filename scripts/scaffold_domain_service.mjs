import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const allowedLayers = new Set(["shared", "entities", "features"]);
const slicePattern = /^[a-z][a-z0-9-]*$/;
const servicePattern = /^[A-Z][A-Za-z0-9]*Service$/;

const parsedArgs = parseArgs(process.argv.slice(2));
if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const validation = validateOptions(parsedArgs.options);
if (!validation.success) {
	exitWithError(validation.error);
}

const result = await scaffoldDomainService(validation.options);
if (!result.success) {
	exitWithError(result.error);
}

console.log(`Created domain service scaffold at ${result.targetDir}`);

function parseArgs(args) {
	const options = {
		force: false,
		root: repoRoot,
	};

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];

		if (arg === "--force") {
			options.force = true;
			continue;
		}

		if (!arg.startsWith("--")) {
			return { success: false, error: `Unexpected argument: ${arg}` };
		}

		const value = args[index + 1];
		if (!value || value.startsWith("--")) {
			return { success: false, error: `Missing value for ${arg}` };
		}

		if (arg === "--root") {
			options.root = value;
		} else if (arg === "--layer") {
			options.layer = value;
		} else if (arg === "--slice") {
			options.slice = value;
		} else if (arg === "--service") {
			options.service = value;
		} else {
			return { success: false, error: `Unsupported option: ${arg}` };
		}

		index += 1;
	}

	return { success: true, options };
}

function validateOptions(options) {
	if (!options.layer || !allowedLayers.has(options.layer)) {
		return {
			success: false,
			error: "Domain service scaffolds support shared, entities, or features layers.",
		};
	}

	if (!options.slice || !slicePattern.test(options.slice)) {
		return {
			success: false,
			error: "Invalid slice. Use lowercase English slugs like inventory.",
		};
	}

	if (!options.service || !servicePattern.test(options.service)) {
		return {
			success: false,
			error: "Invalid service. Use a PascalCase name ending in Service.",
		};
	}

	const root = path.resolve(options.root);
	const layerDir = path.resolve(root, "src", options.layer);
	const targetDir = path.resolve(layerDir, options.slice);

	if (!isPathInside(targetDir, layerDir)) {
		return {
			success: false,
			error: "Invalid slice. Target path escapes the selected FSD layer.",
		};
	}

	return {
		success: true,
		options: {
			force: options.force,
			layer: options.layer,
			root,
			service: options.service,
			slice: options.slice,
			targetDir,
		},
	};
}

async function scaffoldDomainService(options) {
	if (!options.force && (await pathExists(options.targetDir))) {
		return {
			success: false,
			error: `Target already exists: ${options.targetDir}`,
		};
	}

	const names = createNames(options);
	const files = createFiles(names);

	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(options.targetDir, relativePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		await writeFile(filePath, content, "utf8");
	}

	return { success: true, targetDir: options.targetDir };
}

function createNames(options) {
	const serviceStem = options.service.replace(/Service$/, "");
	const serviceCamel = `${serviceStem.charAt(0).toLowerCase()}${serviceStem.slice(1)}`;
	const slicePascal = toPascalCase(options.slice);

	return {
		layer: options.layer,
		serviceCamel,
		serviceName: options.service,
		serviceStem,
		slice: options.slice,
		slicePascal,
	};
}

function createFiles(names) {
	return {
		"index.ts": renderIndex(names),
		[`domain/${names.serviceName}.ts`]: renderService(names),
		[`model/${names.serviceCamel}Types.ts`]: renderTypes(names),
		[`__tests__/${names.serviceName}.spec.ts`]: renderSpec(names),
		".context/tech-memory.md": renderTechMemory(names),
		".context/scaling-roadmap.md": renderScalingRoadmap(names),
		".context/plain-english.md": renderPlainEnglish(names),
	};
}

function renderIndex(names) {
	return `export * from "./domain/${names.serviceName}";
export * from "./model/${names.serviceCamel}Types";
`;
}

function renderService(names) {
	return `import { fail, type Result } from "$lib/shared/lib/result";
import type {
\t${names.serviceStem}Failure,
\t${names.serviceStem}Output,
} from "../model/${names.serviceCamel}Types";

export class ${names.serviceName} {
\tpublic evaluate(
\t\t_input: unknown,
\t): Result<${names.serviceStem}Output, ${names.serviceStem}Failure> {
\t\treturn fail({
\t\t\tcode: "NOT_IMPLEMENTED",
\t\t\tmessage: "${names.serviceName} scaffold requires TDD implementation.",
\t\t});
\t}
}
`;
}

function renderTypes(names) {
	return `export type ${names.serviceStem}FailureCode = "NOT_IMPLEMENTED" | "INVALID_INPUT";

export type ${names.serviceStem}Failure = {
\treadonly code: ${names.serviceStem}FailureCode;
\treadonly message: string;
\treadonly details?: Readonly<Record<string, unknown>>;
};

export type ${names.serviceStem}Output = Readonly<Record<string, unknown>>;
`;
}

function renderSpec(names) {
	return `import { describe, it } from "vitest";

describe("${names.serviceName}", () => {
\tit.todo("replace scaffold placeholder with failing tests before implementation");
});
`;
}

function renderTechMemory(names) {
	return `# ${names.serviceName} Tech Memory

- Generated by \`scripts/scaffold_domain_service.mjs\`.
- Replace the placeholder by writing failing tests first.
- Add \`src/${names.layer}/${names.slice}/domain/${names.serviceName}.ts\` to \`vitest.config.mjs\` coverage before implementing real service logic.
`;
}

function renderScalingRoadmap(names) {
	return `# ${names.serviceName} Scaling Roadmap

- Keep this service pure until a real integration requires adapters.
- Add fakes in a testing folder only when dependencies appear.
- Promote repeated patterns to shared helpers only after duplication is proven.
`;
}

function renderPlainEnglish(names) {
	return `# ${names.serviceName} Para Usuario

Este modulo prepara um servico de regra sem interface visual. Ele so deve ganhar comportamento depois que os testes da regra forem escritos.
`;
}

function toPascalCase(value) {
	return value
		.split("-")
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join("");
}

function isPathInside(child, parent) {
	const relative = path.relative(parent, child);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function pathExists(filePath) {
	try {
		await stat(filePath);
		return true;
	} catch (error) {
		if (getErrorCode(error) === "ENOENT") {
			return false;
		}

		return true;
	}
}

function getErrorCode(error) {
	if (typeof error === "object" && error !== null && "code" in error) {
		return error.code;
	}

	return null;
}

function exitWithError(message) {
	console.error(message);
	process.exit(1);
}
