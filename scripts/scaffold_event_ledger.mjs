import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const allowedLayers = new Set(["shared", "entities", "features"]);
const slicePattern = /^[a-z][a-z0-9-]*$/;
const servicePattern = /^[A-Z][A-Za-z0-9]*ReplayService$/;

const parsedArgs = parseArgs(process.argv.slice(2));
if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
}

const validation = validateOptions(parsedArgs.options);
if (!validation.success) {
	exitWithError(validation.error);
}

const result = await scaffoldEventLedger(validation.options);
if (!result.success) {
	exitWithError(result.error);
}

console.log(`Created event ledger scaffold at ${result.targetDir}`);

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
			error:
				"Event ledger scaffolds support shared, entities, or features layers.",
		};
	}

	if (!options.slice || !slicePattern.test(options.slice)) {
		return {
			success: false,
			error:
				"Invalid slice. Use lowercase English slugs like inventory-ledger.",
		};
	}

	if (!options.service || !servicePattern.test(options.service)) {
		return {
			success: false,
			error: "Invalid service. Use a PascalCase name ending in ReplayService.",
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

async function scaffoldEventLedger(options) {
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
	const slicePascal = toPascalCase(options.slice);
	const sliceCamel = toCamelCase(options.slice);
	const serviceStem = options.service.replace(/ReplayService$/, "");
	const repositoryName = `${serviceStem}Repository`;
	const inMemoryRepositoryName = `InMemory${repositoryName}`;

	return {
		eventSchemaFile: `${sliceCamel}EventSchema`,
		eventTypesFile: `${sliceCamel}EventTypes`,
		inMemoryRepositoryName,
		layer: options.layer,
		repositoryName,
		serviceName: options.service,
		serviceStem,
		slice: options.slice,
		sliceCamel,
		slicePascal,
	};
}

function createFiles(names) {
	return {
		"index.ts": renderIndex(names),
		[`model/${names.eventSchemaFile}.ts`]: renderSchema(names),
		[`model/${names.eventTypesFile}.ts`]: renderTypes(names),
		[`domain/${names.repositoryName}.ts`]: renderRepository(names),
		[`domain/${names.serviceName}.ts`]: renderService(names),
		[`testing/${names.inMemoryRepositoryName}.ts`]: renderFakeRepository(names),
		[`__tests__/${names.serviceName}.spec.ts`]: renderSpec(names),
		".context/tech-memory.md": renderTechMemory(names),
		".context/scaling-roadmap.md": renderScalingRoadmap(names),
		".context/plain-english.md": renderPlainEnglish(names),
	};
}

function renderIndex(names) {
	return `export * from "./domain/${names.repositoryName}";
export * from "./domain/${names.serviceName}";
export * from "./model/${names.eventSchemaFile}";
export * from "./model/${names.eventTypesFile}";
export * from "./testing/${names.inMemoryRepositoryName}";
`;
}

function renderSchema(names) {
	return `import { z } from "zod/v4";

export const ${names.sliceCamel}AggregateIdSchema = z.string().trim().min(1).max(120);
export const ${names.sliceCamel}EventIdSchema = z.string().trim().min(1).max(120);
export const ${names.sliceCamel}EventTypeSchema = z.string().trim().regex(/^[a-z][a-z0-9.-]*$/).max(120);
export const ${names.sliceCamel}TimestampSchema = z.string().datetime();

export const ${names.sliceCamel}EventSchema = z.object({
\tid: ${names.sliceCamel}EventIdSchema,
\taggregateId: ${names.sliceCamel}AggregateIdSchema,
\ttype: ${names.sliceCamel}EventTypeSchema,
\toccurredAt: ${names.sliceCamel}TimestampSchema,
\tpayload: z.record(z.string(), z.unknown()).default({}),
});

export type ${names.slicePascal}EventRecord = z.infer<typeof ${names.sliceCamel}EventSchema>;
export type ${names.slicePascal}AggregateId = z.infer<typeof ${names.sliceCamel}AggregateIdSchema>;
`;
}

function renderTypes(names) {
	return `import type { ${names.slicePascal}EventRecord } from "./${names.eventSchemaFile}";

export type ${names.serviceStem}FailureCode =
\t| "INVALID_AGGREGATE_ID"
\t| "CORRUPTED_EVENT"
\t| "REPOSITORY_FAILURE";

export type ${names.serviceStem}Failure = {
\treadonly code: ${names.serviceStem}FailureCode;
\treadonly message: string;
\treadonly details?: Readonly<Record<string, unknown>>;
};

export type ${names.serviceStem}ReplayOutput = {
\treadonly aggregateId: string;
\treadonly events: readonly ${names.slicePascal}EventRecord[];
};
`;
}

function renderRepository(names) {
	return `import type { Result } from "$lib/shared/lib/result";
import type {
\t${names.slicePascal}AggregateId,
\t${names.slicePascal}EventRecord,
} from "../model/${names.eventSchemaFile}";
import type { ${names.serviceStem}Failure } from "../model/${names.eventTypesFile}";

export type ${names.repositoryName} = {
\treadonly listEvents: (
\t\taggregateId: ${names.slicePascal}AggregateId,
\t) => Promise<Result<readonly ${names.slicePascal}EventRecord[], ${names.serviceStem}Failure>>;
};
`;
}

function renderService(names) {
	return `import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
\t${names.sliceCamel}AggregateIdSchema,
\t${names.sliceCamel}EventSchema,
} from "../model/${names.eventSchemaFile}";
import type {
\t${names.serviceStem}Failure,
\t${names.serviceStem}ReplayOutput,
} from "../model/${names.eventTypesFile}";
import type { ${names.repositoryName} } from "./${names.repositoryName}";

export class ${names.serviceName} {
\tpublic constructor(private readonly repository: ${names.repositoryName}) {}

\tpublic async replay(
\t\taggregateId: unknown,
\t): Promise<Result<${names.serviceStem}ReplayOutput, ${names.serviceStem}Failure>> {
\t\tconst parsedAggregateId = ${names.sliceCamel}AggregateIdSchema.safeParse(aggregateId);
\t\tif (!parsedAggregateId.success) {
\t\t\treturn fail({
\t\t\t\tcode: "INVALID_AGGREGATE_ID",
\t\t\t\tmessage: "${names.serviceName} requires a valid aggregate id.",
\t\t\t});
\t\t}

\t\tconst listed = await this.repository.listEvents(parsedAggregateId.data);
\t\tif (!listed.success) {
\t\t\treturn fail(listed.error);
\t\t}

\t\tconst events = [];
\t\tfor (const event of listed.data) {
\t\t\tconst parsedEvent = ${names.sliceCamel}EventSchema.safeParse(event);
\t\t\tif (!parsedEvent.success) {
\t\t\t\treturn fail({
\t\t\t\t\tcode: "CORRUPTED_EVENT",
\t\t\t\t\tmessage: "${names.serviceName} received an invalid event record.",
\t\t\t\t});
\t\t\t}

\t\t\tevents.push(parsedEvent.data);
\t\t}

\t\tevents.sort((left, right) =>
\t\t\tleft.occurredAt.localeCompare(right.occurredAt) || left.id.localeCompare(right.id),
\t\t);

\t\treturn ok({
\t\t\taggregateId: parsedAggregateId.data,
\t\t\tevents,
\t\t});
\t}
}
`;
}

function renderFakeRepository(names) {
	return `import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
\t${names.slicePascal}AggregateId,
\t${names.slicePascal}EventRecord,
} from "../model/${names.eventSchemaFile}";
import type { ${names.serviceStem}Failure } from "../model/${names.eventTypesFile}";
import type { ${names.repositoryName} } from "../domain/${names.repositoryName}";

export class ${names.inMemoryRepositoryName} implements ${names.repositoryName} {
\tprivate readonly events: readonly ${names.slicePascal}EventRecord[];
\tprivate shouldFail = false;

\tpublic constructor(events: readonly ${names.slicePascal}EventRecord[] = []) {
\t\tthis.events = [...events];
\t}

\tpublic failNextCall(): void {
\t\tthis.shouldFail = true;
\t}

\tpublic async listEvents(
\t\taggregateId: ${names.slicePascal}AggregateId,
\t): Promise<Result<readonly ${names.slicePascal}EventRecord[], ${names.serviceStem}Failure>> {
\t\tif (this.consumeFailure()) {
\t\t\treturn fail({
\t\t\t\tcode: "REPOSITORY_FAILURE",
\t\t\t\tmessage: "${names.repositoryName} failed.",
\t\t\t});
\t\t}

\t\treturn ok(this.events.filter((event) => event.aggregateId === aggregateId));
\t}

\tprivate consumeFailure(): boolean {
\t\tif (!this.shouldFail) {
\t\t\treturn false;
\t\t}

\t\tthis.shouldFail = false;
\t\treturn true;
\t}
}
`;
}

function renderSpec(names) {
	return `import { describe, it } from "vitest";

describe("${names.serviceName}", () => {
\tit.todo("replace scaffold placeholder with failing replay tests before implementation");
});
`;
}

function renderTechMemory(names) {
	return `# ${names.slicePascal} Tech Memory

- Generated by \`scripts/scaffold_event_ledger.mjs\`.
- This scaffold creates event contracts, repository boundaries, an in-memory fake, and a replay service.
- It intentionally does not create migrations or encode RPG rules.
`;
}

function renderScalingRoadmap(names) {
	return `# ${names.slicePascal} Scaling Roadmap

- Add domain-specific events only after an approved rule or process gate exists.
- Add persistence adapters and migrations in a separate task.
- Promote shared event helpers only after another ledger proves the duplication.
`;
}

function renderPlainEnglish(names) {
	return `# ${names.slicePascal} Para Usuario

Este modulo prepara um livro de eventos. Ele guarda uma sequencia de fatos e consegue reproduzir esses fatos em ordem, mas ainda nao decide regras de jogo nem salva dados em banco.
`;
}

function toPascalCase(value) {
	return value
		.split("-")
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join("");
}

function toCamelCase(value) {
	const pascal = toPascalCase(value);
	return `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;
}

function isPathInside(child, parent) {
	const relative = path.relative(parent, child);
	return (
		relative === "" ||
		(!relative.startsWith("..") && !path.isAbsolute(relative))
	);
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
