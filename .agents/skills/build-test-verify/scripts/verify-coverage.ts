import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * @description Valida programaticamente se a cobertura de código atingiu 100%
 * Exigido pela skill build-test-verify do Pandorha Engine.
 */
async function verifyCoverage() {
	const coveragePath = join(process.cwd(), "coverage/coverage-summary.json");

	try {
		const summary = JSON.parse(readFileSync(coveragePath, "utf-8"));
		const totalLines = summary.total.lines.pct;

		if (totalLines < 100) {
			console.error(
				`❌ FALHA DE COBERTURA: ${totalLines}% detectado. O Pandorha Engine exige 100%.`,
			);
			process.exit(1);
		}

		console.log("✅ COBERTURA 100%: Requisito de QA cumprido.");
		process.exit(0);
	} catch (_error) {
		console.error(
			"❌ Erro ao ler relatório de cobertura. Certifique-se de rodar vitest com --coverage.",
		);
		process.exit(1);
	}
}

verifyCoverage();
