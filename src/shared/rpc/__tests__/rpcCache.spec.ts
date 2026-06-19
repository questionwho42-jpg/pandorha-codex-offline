import { beforeEach, describe, expect, it } from "vitest";
import { RpcCache } from "../model/rpcCache";

describe("RpcCache", () => {
	let cache: RpcCache;

	beforeEach(() => {
		cache = new RpcCache();
	});

	it("should return null for non-cached requests", () => {
		const result = cache.get("FIND_CHARACTER", { id: "1" });
		expect(result).toBeNull();
	});

	it("should cache and return values based on type and payload", () => {
		const payload = { id: "1" };
		const responseData = { name: "Vanguard Hero" };

		cache.set("FIND_CHARACTER", payload, responseData);

		const cachedResult = cache.get("FIND_CHARACTER", payload);
		expect(cachedResult).toEqual(responseData);

		// Diferente payload não deve retornar o mesmo valor
		const differentResult = cache.get("FIND_CHARACTER", { id: "2" });
		expect(differentResult).toBeNull();
	});

	it("should not clear cache when a query request is invalidated", () => {
		cache.set("FIND_CHARACTER", { id: "1" }, { name: "Hero" });
		cache.invalidate("LIST_QUESTS"); // Query request, não deve invalidar

		expect(cache.get("FIND_CHARACTER", { id: "1" })).not.toBeNull();
	});

	it("should clear all cache when a mutation request (e.g. SAVE_CHARACTER) is invalidated", () => {
		cache.set("FIND_CHARACTER", { id: "1" }, { name: "Hero" });
		cache.set("LIST_QUESTS", {}, [{ id: "q1" }]);

		cache.invalidate("SAVE_CHARACTER"); // Mutacão, deve limpar tudo

		expect(cache.get("FIND_CHARACTER", { id: "1" })).toBeNull();
		expect(cache.get("LIST_QUESTS", {})).toBeNull();
	});

	it("should clear all cache when other write commands are called (e.g. CREATE, DELETE, CLONE)", () => {
		cache.set("FIND_CHARACTER", { id: "1" }, { name: "Hero" });
		cache.invalidate("DELETE_CLOCK");

		expect(cache.get("FIND_CHARACTER", { id: "1" })).toBeNull();
	});

	it("should expire cache entries after TTL duration", () => {
		const shortCache = new RpcCache(50);
		shortCache.set("FIND_CHARACTER", { id: "1" }, { name: "Hero" });

		// Imediatamente deve retornar
		expect(shortCache.get("FIND_CHARACTER", { id: "1" })).toEqual({
			name: "Hero",
		});

		// Avançar o tempo em 100ms
		const originalDateNow = Date.now;
		let mockTime = Date.now();
		Date.now = () => mockTime;

		mockTime += 100; // Avança 100ms

		expect(shortCache.get("FIND_CHARACTER", { id: "1" })).toBeNull();

		// Restaurar original
		Date.now = originalDateNow;
	});
});
