import { z } from "zod/v4";
import type {
	JsonObject,
	JsonValue,
	RpcBridgeFailure,
	RpcBridgeFailureCode,
	RpcCommandType,
} from "./rpcTypes";

const isoTimestamp = z.string().trim().datetime({ offset: true });
const primarySaveId = z.literal("primary");

export const rpcMessageIdSchema = z.string().uuid();
export const rpcCommandTypeSchema = z.enum([
	"INIT_DATABASE",
	"SAVE_GAME_SNAPSHOT",
	"LOAD_GAME_SNAPSHOT",
	"SAVE_CHARACTER",
	"FIND_CHARACTER",
	"SAVE_STATUS_EFFECT",
	"FIND_STATUS_EFFECTS",
	"DELETE_STATUS_EFFECT",
]);

export const jsonSerializableValueSchema = z.custom<JsonValue>(
	(value) => isJsonSerializable(value),
	"Value must be JSON-serializable.",
);

export const jsonSerializableObjectSchema = z.custom<JsonObject>(
	(value) => isPlainJsonObject(value),
	"Value must be a JSON-serializable object.",
);

export const saveGameSnapshotSchema = z.object({
	version: z.literal(1),
	savedAt: isoTimestamp,
	characters: z.array(jsonSerializableObjectSchema),
	worldState: z.array(jsonSerializableObjectSchema),
});

export const initDatabaseRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("INIT_DATABASE"),
	payload: z.object({
		requestedAt: isoTimestamp,
	}),
});

export const saveGameSnapshotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_GAME_SNAPSHOT"),
	payload: z.object({
		saveId: primarySaveId,
		snapshot: saveGameSnapshotSchema,
	}),
});

export const loadGameSnapshotRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("LOAD_GAME_SNAPSHOT"),
	payload: z.object({
		saveId: primarySaveId,
	}),
});

export const saveCharacterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_CHARACTER"),
	payload: z.object({
		character: jsonSerializableObjectSchema,
	}),
});

export const findCharacterRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_CHARACTER"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const saveStatusEffectRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("SAVE_STATUS_EFFECT"),
	payload: z.object({
		effect: jsonSerializableObjectSchema,
	}),
});

export const findStatusEffectsRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("FIND_STATUS_EFFECTS"),
	payload: z.object({
		characterId: z.string().min(1),
	}),
});

export const deleteStatusEffectRequestSchema = z.object({
	messageId: rpcMessageIdSchema,
	type: z.literal("DELETE_STATUS_EFFECT"),
	payload: z.object({
		id: z.string().min(1),
	}),
});

export const rpcRequestSchema = z.discriminatedUnion("type", [
	initDatabaseRequestSchema,
	saveGameSnapshotRequestSchema,
	loadGameSnapshotRequestSchema,
	saveCharacterRequestSchema,
	findCharacterRequestSchema,
	saveStatusEffectRequestSchema,
	findStatusEffectsRequestSchema,
	deleteStatusEffectRequestSchema,
]);

const rpcErrorSchema = z.object({
	code: z
		.string()
		.trim()
		.regex(/^[A-Z][A-Z0-9_]*$/),
	message: z.string().trim().min(1).max(500),
	details: jsonSerializableValueSchema.optional(),
});

export const rpcSuccessResponseSchema = z.object({
	messageId: rpcMessageIdSchema,
	success: z.literal(true),
	data: jsonSerializableValueSchema.optional(),
});

export const rpcFailureResponseSchema = z.object({
	messageId: rpcMessageIdSchema,
	success: z.literal(false),
	error: rpcErrorSchema,
});

export const rpcResponseSchema = z.discriminatedUnion("success", [
	rpcSuccessResponseSchema,
	rpcFailureResponseSchema,
]);

export interface CreateRpcSuccessResponseInput {
	readonly messageId: string;
	readonly data?: JsonValue;
}

export interface CreateRpcFailureResponseInput {
	readonly messageId: string;
	readonly code: string;
	readonly message: string;
	readonly details?: JsonValue;
}

export function createRpcSuccessResponse(
	input: CreateRpcSuccessResponseInput,
): RpcResponse {
	if (input.data === undefined) {
		return {
			messageId: input.messageId,
			success: true,
		};
	}

	return {
		messageId: input.messageId,
		success: true,
		data: input.data,
	};
}

export function createRpcFailureResponse(
	input: CreateRpcFailureResponseInput,
): RpcResponse {
	if (input.details === undefined) {
		return {
			messageId: input.messageId,
			success: false,
			error: {
				code: input.code,
				message: input.message,
			},
		};
	}

	return {
		messageId: input.messageId,
		success: false,
		error: {
			code: input.code,
			message: input.message,
			details: input.details,
		},
	};
}

export function createRpcBridgeFailure(
	code: RpcBridgeFailureCode,
	message: string,
	details?: unknown,
): RpcBridgeFailure {
	if (details === undefined) {
		return { code, message };
	}

	return { code, message, details };
}

function isJsonSerializable(value: unknown): value is JsonValue {
	if (value === null) {
		return true;
	}

	if (typeof value === "string" || typeof value === "boolean") {
		return true;
	}

	if (typeof value === "number") {
		return Number.isFinite(value);
	}

	if (Array.isArray(value)) {
		return value.every((entry) => isJsonSerializable(entry));
	}

	if (isPlainRecord(value)) {
		return Object.values(value).every((entry) => isJsonSerializable(entry));
	}

	return false;
}

function isPlainJsonObject(value: unknown): value is JsonObject {
	if (!isPlainRecord(value)) {
		return false;
	}

	return Object.values(value).every((entry) => isJsonSerializable(entry));
}

function isPlainRecord(
	value: unknown,
): value is Readonly<Record<string, unknown>> {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value) as unknown;
	return prototype === Object.prototype || prototype === null;
}

export type RpcRequest = z.infer<typeof rpcRequestSchema>;
export type RpcResponse = z.infer<typeof rpcResponseSchema>;
export type SaveGameSnapshot = z.infer<typeof saveGameSnapshotSchema>;
export type {
	JsonObject,
	JsonValue,
	RpcBridgeFailure,
	RpcBridgeFailureCode,
	RpcCommandType,
};
