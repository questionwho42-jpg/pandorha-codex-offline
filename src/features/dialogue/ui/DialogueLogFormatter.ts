/**
 * 🧅 INTERFACE / COMPONENTE ABSTRATO
 * Define o contrato comum para todos os formatadores de log de diálogo.
 */
export interface IDialogueLogFormatter {
	format(log: string): string;
}

/**
 * 🧅 COMPONENTE CONCRETO
 * O objeto base puro que apenas limpa ou retorna o log original sem alterações estéticas.
 */
export class BaseDialogueLogFormatter implements IDialogueLogFormatter {
	public format(log: string): string {
		// Retorna o log puro com segurança contra injeção básica substituindo caracteres HTML
		return log
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
}

/**
 * 🧅 DECORADOR BASE (DialogueLogFormatterDecorator)
 * Classe abstrata que implementa a interface comum e envolve outra instância no construtor.
 * Repassa de forma recursiva a formatação para o componente interno (wrapped).
 */
export abstract class DialogueLogFormatterDecorator
	implements IDialogueLogFormatter
{
	public constructor(protected readonly wrapped: IDialogueLogFormatter) {}

	public format(log: string): string {
		return this.wrapped.format(log);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 1: Destaque de Esforço Extra (EeHighlightDecorator)
 * Varre o log procurando termos de "EE" ou "Esforço Extra" e envolve-os em marcação
 * de cor dourada/bronze premium, característica do sistema de energia de Pandorha.
 */
export class EeHighlightDecorator extends DialogueLogFormatterDecorator {
	public override format(log: string): string {
		const formatted = super.format(log);
		// Encontra menções como "Consome X EE", "Esforço Extra insuficiente", "3 EE"
		return formatted.replace(
			/(\d+\s*EE|Esforço Extra)/gi,
			`<span class="text-bronze font-bold shadow-[0_0_8px_rgba(168,120,50,0.3)]">$1</span>`,
		);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 2: Destaque de Testes d20 (ChallengeHighlightDecorator)
 * Destaca se o teste social ou mental teve Sucesso ou Falha, aplicando cores
 * de verde místico (sucesso) ou escarlate (falha).
 */
export class ChallengeHighlightDecorator extends DialogueLogFormatterDecorator {
	public override format(log: string): string {
		const formatted = super.format(log);

		// Destaca "Sucesso no teste de ..." ou "Sucesso"
		let step = formatted.replace(
			/(Sucesso no teste de [A-Z]+|Sucesso)/gi,
			`<span class="text-emerald-400 font-bold tracking-wider">$1</span>`,
		);

		// Destaca "Falha no teste de ..." ou "Falha"
		step = step.replace(
			/(Falha no teste de [A-Z]+|Falha)/gi,
			`<span class="text-rose-400 font-bold tracking-wider">$1</span>`,
		);

		// Destaca rolagens específicas como "(d20: X + modificador: Y = Z vs CD: W)"
		step = step.replace(
			/(\(d20:.*?\))/gi,
			`<span class="text-bone/60 italic text-xs">$1</span>`,
		);

		return step;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 3: Destaque de Pistas e Descobertas (ClueHighlightDecorator)
 * Varre o log localizando IDs ou menções de pistas destravadas e envolve-as em
 * uma aura de cor azul éter brilhante (tecnologia/misticismo de Pandorha).
 */
export class ClueHighlightDecorator extends DialogueLogFormatterDecorator {
	public override format(log: string): string {
		const formatted = super.format(log);
		// Encontra menções a pistas como "clue-XXXX" ou termos como "Pista desvendada"
		return formatted.replace(
			/(clue-[a-z0-9-]+|pista[s]? desvendada[s]?)/gi,
			`<span class="text-ether font-semibold border-b border-ether/40 pb-0.5">$1</span>`,
		);
	}
}
