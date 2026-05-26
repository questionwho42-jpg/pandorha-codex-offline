import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const expectedChoices = ["persuade", "bargain", "threaten"];
const expectedNodeCount = 4;
const expectedOptionCount = 3;

const parsedArgs = parseArgs(process.argv.slice(2));

if (!parsedArgs.success) {
	exitWithError(parsedArgs.error);
} else {
	const result = await runDialogueSeedSmoke(parsedArgs.root);
	if (!result.success) {
		exitWithError(result.errors.join("\n"));
	} else {
		console.log("dialogue seed smoke is valid");
	}
}

async function runDialogueSeedSmoke(root) {
	const errors = [];
	const npcCatalogResult = await readCatalogArray(
		root,
		"src/entities/npc/model/npcCatalog.ts",
		"NPC_CATALOG",
	);
	const nodeCatalogResult = await readCatalogArray(
		root,
		"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts",
		"rawDialogueNodeCatalog",
	);
	const optionCatalogResult = await readCatalogArray(
		root,
		"src/entities/dialogue-tree/model/dialogueTreeCatalog.ts",
		"rawDialogueOptionCatalog",
	);

	for (const result of [
		npcCatalogResult,
		nodeCatalogResult,
		optionCatalogResult,
	]) {
		if (!result.success) {
			errors.push(result.error);
		}
	}

	if (
		!npcCatalogResult.success ||
		!nodeCatalogResult.success ||
		!optionCatalogResult.success
	) {
		return { success: false, errors };
	}

	const trainingNpcs = npcCatalogResult.records.filter((npc) =>
		isString(npc.id) ? npc.id.startsWith("training-") : false,
	);
	if (trainingNpcs.length === 0) {
		errors.push("NPC_CATALOG has no training NPCs to validate.");
	}

	for (const npc of trainingNpcs) {
		validateNpcDialogueSeed({
			npc,
			nodes: nodeCatalogResult.records,
			options: optionCatalogResult.records,
			errors,
		});
	}

	return errors.length === 0 ? { success: true } : { success: false, errors };
}

function validateNpcDialogueSeed({ npc, nodes, options, errors }) {
	const npcId = String(npc.id);
	const sourceFile = isString(npc.sourceFile) ? npc.sourceFile : null;
	const npcNodes = nodes.filter((node) => node.npcId === npcId);
	const nodeIds = new Set(npcNodes.map((node) => node.id));
	const npcOptions = options.filter((option) => nodeIds.has(option.nodeId));
	const startNodes = npcNodes.filter((node) => node.kind === "start");

	if (!sourceFile) {
		errors.push(`${npcId}: NPC sourceFile is missing or invalid.`);
	}

	if (npcNodes.length !== expectedNodeCount) {
		errors.push(
			`${npcId}: expected ${expectedNodeCount} dialogue nodes, found ${npcNodes.length}.`,
		);
	}

	if (startNodes.length !== 1) {
		errors.push(`${npcId}: expected exactly 1 start dialogue node.`);
	}

	if (npcOptions.length !== expectedOptionCount) {
		errors.push(
			`${npcId}: expected ${expectedOptionCount} dialogue options, found ${npcOptions.length}.`,
		);
	}

	const startNodeId = startNodes[0]?.id;
	for (const node of npcNodes) {
		if (node.sourceFile !== sourceFile) {
			errors.push(
				`${npcId}: node ${node.id} sourceFile must match NPC sourceFile.`,
			);
		}
	}

	for (const option of npcOptions) {
		validateDialogueSeedOption({
			npcId,
			option,
			nodeIds,
			sourceFile,
			startNodeId,
			errors,
		});
	}

	const sortedChoices = [...npcOptions]
		.sort((left, right) => Number(left.sortOrder) - Number(right.sortOrder))
		.map((option) => option.choiceId);
	if (sortedChoices.join("|") !== expectedChoices.join("|")) {
		errors.push(
			`${npcId}: expected choices ${expectedChoices.join(", ")} in sortOrder.`,
		);
	}
}

function validateDialogueSeedOption({
	npcId,
	option,
	nodeIds,
	sourceFile,
	startNodeId,
	errors,
}) {
	if (option.nodeId !== startNodeId) {
		errors.push(
			`${npcId}: option ${option.id} must start from ${startNodeId}.`,
		);
	}

	if (!nodeIds.has(option.nextNodeId)) {
		errors.push(
			`${npcId}: option ${option.id} nextNodeId ${option.nextNodeId} is missing.`,
		);
	}

	if (option.sourceFile !== sourceFile) {
		errors.push(
			`${npcId}: option ${option.id} sourceFile must match NPC sourceFile.`,
		);
	}

	if (
		option.minimumMentalHp !== undefined &&
		!isNonEmptyString(option.blockedReason)
	) {
		errors.push(
			`${npcId}: option ${option.id} has minimumMentalHp without blockedReason.`,
		);
	}

	if (option.choiceId === "threaten" && option.minimumMentalHp === undefined) {
		errors.push(
			`${npcId}: option ${option.id} must define minimumMentalHp for Pressionar.`,
		);
	}
}

async function readCatalogArray(root, relativePath, declarationName) {
	const filePath = path.join(root, relativePath);
	const contentResult = await readText(filePath);
	if (!contentResult.success) {
		return contentResult;
	}

	const sourceFile = ts.createSourceFile(
		filePath,
		contentResult.content,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);
	const stringConstants = collectStringConstants(sourceFile);
	const declaration = findArrayDeclaration(sourceFile, declarationName);
	if (!declaration.success) {
		return {
			success: false,
			error: `${relativePath}: ${declaration.error}`,
		};
	}

	const recordsResult = parseArrayRecords(
		declaration.expression,
		stringConstants,
		relativePath,
		declarationName,
	);
	if (!recordsResult.success) {
		return recordsResult;
	}

	return { success: true, records: recordsResult.records };
}

async function readText(filePath) {
	try {
		return { success: true, content: await readFile(filePath, "utf8") };
	} catch (error) {
		return {
			success: false,
			error: `Could not read ${filePath}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		};
	}
}

function collectStringConstants(sourceFile) {
	const constants = new Map();

	for (const statement of sourceFile.statements) {
		if (!ts.isVariableStatement(statement)) {
			continue;
		}

		for (const declaration of statement.declarationList.declarations) {
			if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
				continue;
			}

			const value = parseExpressionValue(
				unwrapExpression(declaration.initializer),
				constants,
			);
			if (isString(value)) {
				constants.set(declaration.name.text, value);
			}
		}
	}

	return constants;
}

function findArrayDeclaration(sourceFile, declarationName) {
	let found = null;

	function visit(node) {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isIdentifier(node.name) &&
			node.name.text === declarationName &&
			node.initializer
		) {
			const expression = unwrapExpression(node.initializer);
			if (ts.isArrayLiteralExpression(expression)) {
				found = expression;
			}
		}

		if (!found) {
			ts.forEachChild(node, visit);
		}
	}

	visit(sourceFile);

	return found
		? { success: true, expression: found }
		: {
				success: false,
				error: `Could not find array declaration ${declarationName}.`,
			};
}

function parseArrayRecords(
	arrayExpression,
	stringConstants,
	relativePath,
	name,
) {
	const records = [];

	for (const element of arrayExpression.elements) {
		const expression = unwrapExpression(element);
		if (!ts.isObjectLiteralExpression(expression)) {
			return {
				success: false,
				error: `${relativePath}: ${name} contains a non-object element.`,
			};
		}

		const recordResult = parseObjectRecord(expression, stringConstants);
		if (!recordResult.success) {
			return {
				success: false,
				error: `${relativePath}: ${recordResult.error}`,
			};
		}
		records.push(recordResult.record);
	}

	return { success: true, records };
}

function parseObjectRecord(objectExpression, stringConstants) {
	const record = {};

	for (const property of objectExpression.properties) {
		if (!ts.isPropertyAssignment(property)) {
			continue;
		}

		const key = getPropertyName(property.name);
		if (!key) {
			return { success: false, error: "Could not parse object property name." };
		}

		const value = parseExpressionValue(
			unwrapExpression(property.initializer),
			stringConstants,
		);
		if (value === undefined) {
			return {
				success: false,
				error: `Could not parse value for property ${key}.`,
			};
		}
		record[key] = value;
	}

	return { success: true, record };
}

function parseExpressionValue(expression, stringConstants) {
	if (
		ts.isStringLiteral(expression) ||
		ts.isNoSubstitutionTemplateLiteral(expression)
	) {
		return expression.text;
	}

	if (ts.isNumericLiteral(expression)) {
		return Number(expression.text);
	}

	if (ts.isIdentifier(expression)) {
		return stringConstants.get(expression.text);
	}

	return undefined;
}

function getPropertyName(name) {
	if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
		return name.text;
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

function isString(value) {
	return typeof value === "string";
}

function isNonEmptyString(value) {
	return isString(value) && value.trim().length > 0;
}

function parseArgs(args) {
	let root = repoRoot;

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg !== "--root") {
			return { success: false, error: `Unsupported option: ${arg}` };
		}

		const value = args[index + 1];
		if (!value) {
			return { success: false, error: "--root requires a path." };
		}
		root = path.resolve(value);
		index += 1;
	}

	return { success: true, root };
}

function exitWithError(message) {
	console.error(message);
	process.exitCode = 1;
}
