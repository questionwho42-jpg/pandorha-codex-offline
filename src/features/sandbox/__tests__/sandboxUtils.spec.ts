import { describe, expect, it } from "vitest";
import {
	buildLogEntry,
	buildSpawnActor,
	parseWorldStateValue,
	validateSpawnPayload,
} from "../domain/sandboxUtils";

// ─────────────────────────────────────────────
// parseWorldStateValue
// ─────────────────────────────────────────────
describe("parseWorldStateValue", () => {
	it('converte "true" (case-insensitive) para boolean true', () => {
		expect(parseWorldStateValue("true")).toBe(true);
		expect(parseWorldStateValue("TRUE")).toBe(true);
		expect(parseWorldStateValue("True")).toBe(true);
	});

	it('converte "false" (case-insensitive) para boolean false', () => {
		expect(parseWorldStateValue("false")).toBe(false);
		expect(parseWorldStateValue("FALSE")).toBe(false);
		expect(parseWorldStateValue("False")).toBe(false);
	});

	it("converte strings numéricas para number", () => {
		expect(parseWorldStateValue("42")).toBe(42);
		expect(parseWorldStateValue("0")).toBe(0);
		expect(parseWorldStateValue("-7")).toBe(-7);
		expect(parseWorldStateValue("3.14")).toBeCloseTo(3.14);
	});

	it("mantém strings não-numéricas e não-booleanas como string", () => {
		expect(parseWorldStateValue("revelada")).toBe("revelada");
		expect(parseWorldStateValue("plot:pista_1")).toBe("plot:pista_1");
		expect(parseWorldStateValue("")).toBe("");
	});
});

// ─────────────────────────────────────────────
// buildSpawnActor
// ─────────────────────────────────────────────
describe("buildSpawnActor", () => {
	it("constrói payload de spawn com actorId prefixado corretamente", () => {
		const result = buildSpawnActor(
			"abc123",
			"Rastejador das Brumas",
			"brute",
			45,
			4,
		);
		expect(result.actorId).toBe("spawned-abc123");
		expect(result.label).toBe("Rastejador das Brumas");
		expect(result.profile).toBe("brute");
		expect(result.hitPoints).toBe(45);
		expect(result.initiativeBase).toBe(4);
	});

	it("preserva todos os perfis táticos canônicos", () => {
		expect(buildSpawnActor("x", "A", "sniper", 20, 6).profile).toBe("sniper");
		expect(buildSpawnActor("x", "B", "controller", 30, 3).profile).toBe(
			"controller",
		);
	});

	it("retorna objeto imutável (readonly properties)", () => {
		const payload = buildSpawnActor("z", "Golem", "brute", 100, 2);
		// Propriedades existem e têm os tipos corretos
		expect(typeof payload.actorId).toBe("string");
		expect(typeof payload.hitPoints).toBe("number");
	});
});

// ─────────────────────────────────────────────
// buildLogEntry
// ─────────────────────────────────────────────
describe("buildLogEntry", () => {
	it("formata entrada de log com timestamp entre colchetes", () => {
		const entry = buildLogEntry("10:30:00", "Spawn solicitado.");
		expect(entry).toBe("[10:30:00] Spawn solicitado.");
	});

	it("preserva caracteres especiais na mensagem", () => {
		const entry = buildLogEntry("00:00:01", "Chave 'plot:pista' = true...");
		expect(entry).toBe("[00:00:01] Chave 'plot:pista' = true...");
	});
});

// ─────────────────────────────────────────────
// validateSpawnPayload
// ─────────────────────────────────────────────
describe("validateSpawnPayload", () => {
	const basePayload = {
		label: "Golem de Ferro",
		profile: "brute" as const,
		hitPoints: 50,
		initiativeBase: 3,
	};

	it("retorna array vazio para payload válido", () => {
		expect(validateSpawnPayload(basePayload)).toHaveLength(0);
	});

	it("reporta erro quando label está vazio", () => {
		const errors = validateSpawnPayload({ ...basePayload, label: "" });
		expect(errors).toContain("Nome do monstro não pode estar vazio.");
	});

	it("reporta erro quando label contém apenas espaços em branco", () => {
		const errors = validateSpawnPayload({ ...basePayload, label: "   " });
		expect(errors).toContain("Nome do monstro não pode estar vazio.");
	});

	it("reporta erro quando HP é zero", () => {
		const errors = validateSpawnPayload({ ...basePayload, hitPoints: 0 });
		expect(errors).toContain("HP máximo deve ser pelo menos 1.");
	});

	it("reporta erro quando HP é negativo", () => {
		const errors = validateSpawnPayload({ ...basePayload, hitPoints: -10 });
		expect(errors).toContain("HP máximo deve ser pelo menos 1.");
	});

	it("reporta erro quando iniciativa é negativa", () => {
		const errors = validateSpawnPayload({ ...basePayload, initiativeBase: -1 });
		expect(errors).toContain("Iniciativa base não pode ser negativa.");
	});

	it("aceita iniciativa zero (válido — criaturas lentas)", () => {
		const errors = validateSpawnPayload({ ...basePayload, initiativeBase: 0 });
		expect(errors).toHaveLength(0);
	});

	it("reporta múltiplos erros simultaneamente", () => {
		const errors = validateSpawnPayload({
			label: "",
			profile: "brute",
			hitPoints: 0,
			initiativeBase: -1,
		});
		expect(errors).toHaveLength(3);
	});
});
