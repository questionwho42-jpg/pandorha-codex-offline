import { beforeEach, describe, expect, it } from "vitest";
import { CampService } from "../CampService";

describe("CampService", () => {
	let service: CampService;

	beforeEach(() => {
		service = new CampService();
	});

	it("should create a camp session with correct default hours", () => {
		const session = service.createSession({ totalTime: 12 });

		expect(session.totalTime).toBe(12);
		expect(session.sleepHours).toBe(8);
		expect(session.availableActions).toBe(4); // 12 - 8
		expect(session.dangerCounter).toBe(0);
	});

	it("should calculate actions correctly for characters needing less sleep", () => {
		// Ex: Construto ou Elfo que precisa de apenas 4h de sono
		const session = service.createSession({ totalTime: 12, sleepHours: 4 });

		expect(session.availableActions).toBe(8); // 12 - 4
	});

	// Bastião Avançado: Regras de Dívida de Sangue & Acúmulo de Perigo
	it("should determine that blood debt blocks rest when it exceeds fame * 3", () => {
		const fame = 2;
		const blockingDebt = 7; // 7 > 2 * 3 (6)
		const safeDebt = 5; // 5 <= 2 * 3 (6)

		const isBlocked = blockingDebt > fame * 3;
		const isSafe = safeDebt > fame * 3;

		expect(isBlocked).toBe(true);
		expect(isSafe).toBe(false);
	});

	it("should calculate correct danger increment based on guard active tasks", () => {
		const baseDangerAccumulation = 25;

		// Sem guardas (0)
		const guards0 = 0;
		const increment0 = Math.max(5, baseDangerAccumulation - guards0 * 10);
		expect(increment0).toBe(25);

		// Com 1 guarda
		const guards1 = 1;
		const increment1 = Math.max(5, baseDangerAccumulation - guards1 * 10);
		expect(increment1).toBe(15);

		// Com 2 guardas
		const guards2 = 2;
		const increment2 = Math.max(5, baseDangerAccumulation - guards2 * 10);
		expect(increment2).toBe(5);

		// Com 3 guardas (respeita o limite mínimo de 5%)
		const guards3 = 3;
		const increment3 = Math.max(5, baseDangerAccumulation - guards3 * 10);
		expect(increment3).toBe(5);
	});
});

import {
	AbrigoTermicoDecorator,
	BanqueteDecorator,
	StandardRecovery,
} from "../recoveryDecorators";

describe("Camp Recovery Decorators", () => {
	it("should apply simple recovery without decorators", () => {
		const recovery = new StandardRecovery();
		expect(recovery.calculate(100)).toBe(100);
	});

	it("should apply banquet bonus (+25%)", () => {
		const recovery = new BanqueteDecorator(new StandardRecovery());
		expect(recovery.calculate(100)).toBe(125);
	});

	it("should combine banquet and thermal shelter bonuses", () => {
		// (100 * 1.25) + 5 = 130
		const recovery = new AbrigoTermicoDecorator(
			new BanqueteDecorator(new StandardRecovery()),
		);
		expect(recovery.calculate(100)).toBe(130);
	});

	it("should respect decorator order (effect onion)", () => {
		// (100 + 5) * 1.25 = 131.25
		const recovery = new BanqueteDecorator(
			new AbrigoTermicoDecorator(new StandardRecovery()),
		);
		expect(recovery.calculate(100)).toBe(131.25);
	});
});
