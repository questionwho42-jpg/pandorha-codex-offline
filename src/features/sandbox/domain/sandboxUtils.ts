/**
 * sandboxUtils.ts
 *
 * Pure domain utilities for the GM Sandbox feature.
 * These functions are extracted from GMSandboxPanel.svelte to enable
 * deterministic unit testing without a browser or Worker dependency.
 */

/** Tactical role types accepted by the spawn system. */
export type TacticalProfile = "brute" | "sniper" | "controller";

/** Parsed scalar value that can be stored in World State. */
export type WorldStateScalar = boolean | number | string;

/**
 * Parses a raw string input from the GM Sandbox into a typed World State value.
 *
 * Conversion rules (in priority order):
 * 1. "true" (case-insensitive) → boolean `true`
 * 2. "false" (case-insensitive) → boolean `false`
 * 3. Any numeric string → `number`
 * 4. Anything else → unchanged `string`
 */
export function parseWorldStateValue(raw: string): WorldStateScalar {
	if (raw.toLowerCase() === "true") return true;
	if (raw.toLowerCase() === "false") return false;
	if (raw.trim() === "") return raw;
	const asNumber = Number(raw);
	if (!Number.isNaN(asNumber)) return asNumber;
	return raw;
}

/** Shape of the actor payload sent to FORCE_SPAWN_ACTOR RPC. */
export interface SpawnActorPayload {
	readonly actorId: string;
	readonly label: string;
	readonly profile: TacticalProfile;
	readonly hitPoints: number;
	readonly initiativeBase: number;
}

/**
 * Builds a SpawnActorPayload from GM Sandbox inputs.
 * The `actorId` prefix is deterministic; the suffix must be supplied by the caller
 * (allowing tests to avoid crypto.randomUUID()).
 */
export function buildSpawnActor(
	idSuffix: string,
	label: string,
	profile: TacticalProfile,
	hitPoints: number,
	initiativeBase: number,
): SpawnActorPayload {
	return {
		actorId: `spawned-${idSuffix}`,
		label,
		profile,
		hitPoints,
		initiativeBase,
	};
}

/**
 * Builds a timestamped log entry string for the GM Sandbox console.
 * The `timestamp` parameter should be a locale-formatted time string (HH:MM:SS).
 */
export function buildLogEntry(timestamp: string, message: string): string {
	return `[${timestamp}] ${message}`;
}

/**
 * Validates that a spawn actor payload has non-empty label, positive HP,
 * and a known tactical profile.
 *
 * Returns an array of validation error messages. Empty array = valid.
 */
export function validateSpawnPayload(
	payload: Omit<SpawnActorPayload, "actorId">,
): string[] {
	const errors: string[] = [];
	if (!payload.label.trim()) {
		errors.push("Nome do monstro não pode estar vazio.");
	}
	if (payload.hitPoints < 1) {
		errors.push("HP máximo deve ser pelo menos 1.");
	}
	if (payload.initiativeBase < 0) {
		errors.push("Iniciativa base não pode ser negativa.");
	}
	const validProfiles: TacticalProfile[] = ["brute", "sniper", "controller"];
	if (!validProfiles.includes(payload.profile)) {
		errors.push(`Perfil tático inválido: ${payload.profile}.`);
	}
	return errors;
}
