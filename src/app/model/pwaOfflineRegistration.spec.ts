import { describe, expect, it } from "vitest";
import { registerPwaOfflineSupport } from "./pwaOfflineRegistration";

describe("registerPwaOfflineSupport", () => {
	it("returns the ready status with the service worker registration", async () => {
		let registeredPath = "";
		const registration = {
			waiting: { postMessage: () => undefined },
		} as unknown as ServiceWorkerRegistration;
		const serviceWorker = {
			register: async (path: string) => {
				registeredPath = path;
				return registration;
			},
			ready: Promise.resolve(registration),
		};

		const result = await registerPwaOfflineSupport({
			navigatorRef: { serviceWorker } as unknown as Navigator,
			serviceWorkerPath: "/custom-sw.js",
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			return;
		}
		expect(registeredPath).toBe("/custom-sw.js");
		expect(result.data.status).toEqual({ kind: "ready" });
		expect(result.data.registration).toBe(registration);
	});

	it("returns an explicit unsupported failure without browser service workers", async () => {
		const result = await registerPwaOfflineSupport({
			navigatorRef: {} as Navigator,
		});

		expect(result).toMatchObject({
			success: false,
			error: { code: "SERVICE_WORKER_UNSUPPORTED" },
		});
	});
});
