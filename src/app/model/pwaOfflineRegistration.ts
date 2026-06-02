import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { PwaOfflineStatus } from "./pwaStatusView";

const DEFAULT_SERVICE_WORKER_PATH = "/pandorha-sw.js";

export interface PwaOfflineRegistrationFailure {
	readonly code:
		| "SERVICE_WORKER_UNSUPPORTED"
		| "SERVICE_WORKER_REGISTRATION_FAILED";
	readonly message: string;
	readonly details?: unknown;
}

export interface PwaOfflineRegistrationInput {
	readonly navigatorRef?: Navigator;
	readonly serviceWorkerPath?: string;
}

export async function registerPwaOfflineSupport(
	input: PwaOfflineRegistrationInput = {},
): Promise<Result<PwaOfflineStatus, PwaOfflineRegistrationFailure>> {
	const navigatorRef =
		input.navigatorRef ?? (typeof navigator === "undefined" ? null : navigator);
	if (!navigatorRef || !("serviceWorker" in navigatorRef)) {
		return fail({
			code: "SERVICE_WORKER_UNSUPPORTED",
			message: "Service workers are not available in this browser.",
		});
	}

	try {
		await navigatorRef.serviceWorker.register(
			input.serviceWorkerPath ?? DEFAULT_SERVICE_WORKER_PATH,
		);
		await navigatorRef.serviceWorker.ready;
		return ok({ kind: "ready" });
	} catch (error: unknown) {
		return fail({
			code: "SERVICE_WORKER_REGISTRATION_FAILED",
			message: "Service worker registration failed.",
			details: {
				cause: error instanceof Error ? error.message : String(error),
			},
		});
	}
}
