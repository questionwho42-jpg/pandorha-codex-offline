import { generateId } from "../../../shared/lib/id";
import type { CampSession, CampSessionCreateOptions } from "./types";

export class CampService {
	/**
	 * Inicia uma nova sessão de acampamento baseada no tempo total disponível.
	 * Segue a regra do Capítulo 28: Ações = [Tempo Total] - 8 horas (ou horas de sono específicas).
	 */
	createSession(options: CampSessionCreateOptions): CampSession {
		const sleepHours = options.sleepHours ?? 8;
		const availableActions = Math.max(0, options.totalTime - sleepHours);

		return {
			id: generateId("cmp"),
			totalTime: options.totalTime,
			sleepHours,
			availableActions,
			dangerCounter: 0,
			activeActivities: [],
		};
	}
}
