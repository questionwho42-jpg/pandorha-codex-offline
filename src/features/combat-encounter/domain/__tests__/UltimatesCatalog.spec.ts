import { describe, expect, it } from "vitest";
import { findUltimateByClass, ULTIMATES_CATALOG } from "../UltimatesCatalog";

describe("UltimatesCatalog", () => {
	it("should find ultimate by exact classId", () => {
		const ultimate = findUltimateByClass("weaver");
		expect(ultimate).toBeDefined();
		expect(ultimate?.id).toBe("surto_tempo");
		expect(ultimate?.statusEffectType).toBe("surto_tempo");
	});

	it("should find ultimate with alias for vanguard/vanguarda", () => {
		const ult1 = findUltimateByClass("vanguard");
		const ult2 = findUltimateByClass("vanguarda");
		expect(ult1).toBeDefined();
		expect(ult2).toBeDefined();
		expect(ult1?.id).toBe("avatar_guerra");
		expect(ult2?.id).toBe("avatar_guerra");
	});

	it("should return undefined for unknown classIds", () => {
		const ultimate = findUltimateByClass("unknown");
		expect(ultimate).toBeUndefined();
	});

	it("should have exactly 4 class level 5 ultimates defined", () => {
		expect(ULTIMATES_CATALOG.length).toBe(4);
	});
});
