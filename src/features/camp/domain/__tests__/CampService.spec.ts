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
