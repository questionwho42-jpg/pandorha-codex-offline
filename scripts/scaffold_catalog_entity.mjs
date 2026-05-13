import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
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

const result = await scaffoldCatalogEntity(validation.options);
if (!result.success) {
	exitWithError(result.error);
}

console.log(`Created catalog entity scaffold at ${result.targetDir}`);

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
	if (options.layer !== "entities") {
		return {
			success: false,
			error: "Catalog entity scaffolds are restricted to the entities layer.",
		};
	}

	if (!options.slice || !slicePattern.test(options.slice)) {
		return {
			success: false,
			error: "Invalid slice. Use lowercase English slugs like ancestry-trait.",
		};
	}

	if (!options.service || !servicePattern.test(options.service)) {
		return {
			success: false,
			error: "Invalid service. Use a PascalCase name ending in Service.",
		};
	}

	const root = path.resolve(options.root);
	const targetDir = path.resolve(root, "src", "entities", options.slice);
	const entitiesDir = path.resolve(root, "src", "entities");

	if (!isPathInside(targetDir, entitiesDir)) {
		return {
			success: false,
			error: "Invalid slice. Target path escapes src/entities.",
		};
	}

	return {
		success: true,
		options: {
			force: options.force,
			root,
			layer: options.layer,
			slice: options.slice,
			service: options.service,
			targetDir,
		},
	};
}

async function scaffoldCatalogEntity(options) {
	if (!options.force && (await pathExists(options.targetDir))) {
		return {
			success: false,
			error: `Target already exists: ${options.targetDir}`,
		};
	}

	const names = createNames(options.slice, options.service);
	const files = createFiles(names);

	for (const [relativePath, content] of Object.entries(files)) {
		const filePath = path.join(options.targetDir, relativePath);
		await mkdir(path.dirname(filePath), { recursive: true });
		await writeFile(filePath, content, "utf8");
	}

	return { success: true, targetDir: options.targetDir };
}

function createNames(slice, serviceName) {
	const pascal = toPascalCase(slice);
	const camel = toCamelCase(slice);
	const snake = slice.replaceAll("-", "_");
	const constant = snake.toUpperCase();
	const repositoryName = serviceName.replace(/Service$/, "Repository");
	const inMemoryRepositoryName = `InMemory${repositoryName}`;

	return {
		camel,
		constant,
		inMemoryRepositoryName,
		pascal,
		repositoryName,
		serviceName,
		slice,
		snake,
		tableName: `${snake}s`,
	};
}

function createFiles(names) {
	return {
		"index.ts": renderIndex(names),
		[`model/${names.camel}Schema.ts`]: renderSchema(names),
		[`model/${names.camel}Catalog.ts`]: renderCatalog(names),
		[`model/${names.camel}Types.ts`]: renderTypes(names),
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
export * from "./model/${names.camel}Catalog";
export * from "./model/${names.camel}Schema";
export * from "./model/${names.camel}Types";
export * from "./testing/${names.inMemoryRepositoryName}";
`;
}

function renderSchema(names) {
	return `import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

const catalogId = z.string().trim().regex(/^[a-z][a-z0-9-]*$/).max(80);
const visibleLabel = z.string().trim().min(1).max(120);
const sourceFile = z.string().trim().min(1).max(180);
const ruleText = z.string().trim().min(1).max(1000);

export const ${names.camel} = sqliteTable("${names.tableName}", {
\tid: text("id").primaryKey(),
\tlabel: text("label").notNull(),
\tsourceFile: text("source_file").notNull(),
\tsummary: text("summary").notNull(),
});

export const ${names.camel}InsertSchema = createInsertSchema(${names.camel}).extend({
\tid: catalogId,
\tlabel: visibleLabel,
\tsourceFile,
\tsummary: ruleText,
});

export const ${names.camel}SelectSchema = createSelectSchema(${names.camel}).extend({
\tid: catalogId,
\tlabel: visibleLabel,
\tsourceFile,
\tsummary: ruleText,
});

export const ${names.camel}IdSchema = catalogId;

export type ${names.pascal}Id = z.infer<typeof ${names.camel}IdSchema>;
export type New${names.pascal}Record = z.infer<typeof ${names.camel}InsertSchema>;
export type ${names.pascal}Record = z.infer<typeof ${names.camel}SelectSchema>;
`;
}

function renderCatalog(names) {
	return `import type { ${names.pascal}Record } from "./${names.camel}Schema";

// TODO: Replace this placeholder only after reading the official rule sources.
export const ${names.camel}Catalog = [] satisfies readonly ${names.pascal}Record[];
`;
}

function renderTypes(names) {
	return `export type ${names.pascal}FailureCode =
\t| "INVALID_${names.constant}_ID"
\t| "MISSING_${names.constant}"
\t| "CORRUPTED_${names.constant}_RECORD"
\t| "REPOSITORY_FAILURE";

export type ${names.pascal}Failure = {
\treadonly code: ${names.pascal}FailureCode;
\treadonly message: string;
\treadonly details?: Readonly<Record<string, unknown>>;
};
`;
}

function renderRepository(names) {
	return `import type { Result } from "$lib/shared/lib/result";
import type { ${names.pascal}Record, ${names.pascal}Id } from "../model/${names.camel}Schema";
import type { ${names.pascal}Failure } from "../model/${names.camel}Types";

export type ${names.repositoryName} = {
\treadonly listRecords: () => Promise<
\t\tResult<readonly ${names.pascal}Record[], ${names.pascal}Failure>
\t>;
\treadonly findRecordById: (
\t\tid: ${names.pascal}Id,
\t) => Promise<Result<${names.pascal}Record, ${names.pascal}Failure>>;
};
`;
}

function renderService(names) {
	return `import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
\ttype ${names.pascal}Record,
\t${names.camel}IdSchema,
\t${names.camel}SelectSchema,
} from "../model/${names.camel}Schema";
import type { ${names.pascal}Failure } from "../model/${names.camel}Types";
import type { ${names.repositoryName} } from "./${names.repositoryName}";

export class ${names.serviceName} {
\tpublic constructor(private readonly repository: ${names.repositoryName}) {}

\tpublic async listRecords(): Promise<
\t\tResult<readonly ${names.pascal}Record[], ${names.pascal}Failure>
\t> {
\t\tconst listed = await this.repository.listRecords();
\t\tif (!listed.success) {
\t\t\treturn fail(listed.error);
\t\t}

\t\tconst validated: ${names.pascal}Record[] = [];
\t\tfor (const record of listed.data) {
\t\t\tconst parsed = ${names.camel}SelectSchema.safeParse(record);
\t\t\tif (!parsed.success) {
\t\t\t\treturn fail({
\t\t\t\t\tcode: "CORRUPTED_${names.constant}_RECORD",
\t\t\t\t\tmessage: "${names.pascal} record failed output validation.",
\t\t\t\t});
\t\t\t}

\t\t\tvalidated.push(parsed.data);
\t\t}

\t\treturn ok(validated);
\t}

\tpublic async findRecordById(
\t\tid: unknown,
\t): Promise<Result<${names.pascal}Record, ${names.pascal}Failure>> {
\t\tconst parsedId = ${names.camel}IdSchema.safeParse(id);
\t\tif (!parsedId.success) {
\t\t\treturn fail({
\t\t\t\tcode: "INVALID_${names.constant}_ID",
\t\t\t\tmessage: "${names.pascal} id does not match the catalog id format.",
\t\t\t});
\t\t}

\t\tconst found = await this.repository.findRecordById(parsedId.data);
\t\tif (!found.success) {
\t\t\treturn fail(found.error);
\t\t}

\t\tconst parsedRecord = ${names.camel}SelectSchema.safeParse(found.data);
\t\tif (!parsedRecord.success) {
\t\t\treturn fail({
\t\t\t\tcode: "CORRUPTED_${names.constant}_RECORD",
\t\t\t\tmessage: "${names.pascal} record failed output validation.",
\t\t\t});
\t\t}

\t\treturn ok(parsedRecord.data);
\t}
}
`;
}

function renderFakeRepository(names) {
	return `import { fail, ok, type Result } from "$lib/shared/lib/result";
import { ${names.camel}Catalog } from "../model/${names.camel}Catalog";
import type { ${names.pascal}Record, ${names.pascal}Id } from "../model/${names.camel}Schema";
import type { ${names.pascal}Failure } from "../model/${names.camel}Types";
import type { ${names.repositoryName} } from "../domain/${names.repositoryName}";

export class ${names.inMemoryRepositoryName} implements ${names.repositoryName} {
\tprivate readonly records: readonly ${names.pascal}Record[];
\tprivate shouldFail = false;

\tpublic constructor(records: readonly ${names.pascal}Record[] = ${names.camel}Catalog) {
\t\tthis.records = [...records];
\t}

\tpublic failNextCall(): void {
\t\tthis.shouldFail = true;
\t}

\tpublic async listRecords(): Promise<
\t\tResult<readonly ${names.pascal}Record[], ${names.pascal}Failure>
\t> {
\t\tif (this.consumeFailure()) {
\t\t\treturn repositoryFailure();
\t\t}

\t\treturn ok(this.records);
\t}

\tpublic async findRecordById(
\t\tid: ${names.pascal}Id,
\t): Promise<Result<${names.pascal}Record, ${names.pascal}Failure>> {
\t\tif (this.consumeFailure()) {
\t\t\treturn repositoryFailure();
\t\t}

\t\tconst record = this.records.find((candidate) => candidate.id === id);
\t\tif (!record) {
\t\t\treturn fail({
\t\t\t\tcode: "MISSING_${names.constant}",
\t\t\t\tmessage: "${names.pascal} record was not found.",
\t\t\t\tdetails: { id },
\t\t\t});
\t\t}

\t\treturn ok(record);
\t}

\tprivate consumeFailure(): boolean {
\t\tif (!this.shouldFail) {
\t\t\treturn false;
\t\t}

\t\tthis.shouldFail = false;
\t\treturn true;
\t}
}

function repositoryFailure(): Result<never, ${names.pascal}Failure> {
\treturn fail({
\t\tcode: "REPOSITORY_FAILURE",
\t\tmessage: "${names.pascal} repository failed.",
\t});
}
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
	return `# ${names.pascal} Tech Memory

- Generated by \`scripts/scaffold_catalog_entity.mjs\`.
- This scaffold is only structure. Official catalog data must be added manually after reading source rules.
- Keep service logic behind Result return values and validate repository output with Zod.
`;
}

function renderScalingRoadmap(names) {
	return `# ${names.pascal} Scaling Roadmap

- Add official records only after confirming the source files.
- Add the service to coverage once real logic replaces the placeholder tests.
- Evaluate shared catalog helpers only after at least one more similar entity proves the duplication.
`;
}

function renderPlainEnglish(names) {
	return `# ${names.pascal} Para Usuario

Este modulo sera um catalogo consultavel. Por enquanto o scaffold cria apenas a estrutura para que os dados oficiais sejam inseridos com testes e revisao.
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
