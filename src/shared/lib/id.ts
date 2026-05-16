/**
 * Gera um ID único resiliente.
 * Prefere crypto.randomUUID() se disponível (ambiente seguro).
 * Caso contrário, utiliza uma combinação de timestamp e performance counters.
 */
export function generateId(prefix = ""): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	const t = Date.now().toString(36);
	const p = (typeof performance !== "undefined" ? performance.now() : 0)
		.toString(36)
		.replace(".", "");

	const id = `${t}-${p}`;
	return prefix ? `${prefix}-${id}` : id;
}
