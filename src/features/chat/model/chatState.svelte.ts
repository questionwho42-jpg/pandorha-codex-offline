export type RollType = "Normal" | "Vantagem" | "Desvantagem";

export interface ChatMessage {
	id: string;
	timestamp: string;
	sender?: string;
	type: "roll" | "system" | "combat" | "camp" | "narrative";
	content: string;
	isGmOnly?: boolean;
	rollDetails?: {
		die1: number;
		die2?: number | undefined;
		modifier: number;
		bonus: number;
		rollType: RollType;
		results: number[];
		finalResult: number;
	};
}

class ChatState {
	// Modificadores globais de rolagem (Runas do Svelte 5)
	public rollType = $state<RollType>("Normal");
	public customBonus = $state<number>(0);

	// Personagem Ativo / Status Effects Ativos focado no cockpit
	public activeCharacterId = $state<string | null>(null);
	public activeCharacterName = $state<string | null>(null);
	public activeStatusEffects = $state<
		readonly {
			id: string;
			type: string;
			label: string;
			severity: number;
			isAggravated: boolean;
			metadata?: string | null;
		}[]
	>([]);
	public activeAxes = $state<readonly { label: string; value: number }[]>([]);
	public activeApplications = $state<
		readonly { label: string; value: number }[]
	>([]);

	// Logs de chat globais
	public messages = $state<ChatMessage[]>([]);

	public setActiveCharacter(
		char: {
			id: string;
			name: string;
			statusEffects: readonly {
				id: string;
				type: string;
				label: string;
				severity: number;
				isAggravated: boolean;
				metadata?: string | null;
			}[];
			axes: readonly { label: string; value: number }[];
			applications: readonly { label: string; value: number }[];
		} | null,
	) {
		if (char) {
			this.activeCharacterId = char.id;
			this.activeCharacterName = char.name;
			this.activeStatusEffects = char.statusEffects;
			this.activeAxes = char.axes;
			this.activeApplications = char.applications;
		} else {
			this.activeCharacterId = null;
			this.activeCharacterName = null;
			this.activeStatusEffects = [];
			this.activeAxes = [];
			this.activeApplications = [];
		}
	}

	public getStatusModifiersForAttribute(
		attributeLabel: string,
		effects: readonly {
			type: string;
			label: string;
			severity: number;
			isAggravated: boolean;
			metadata?: string | null;
		}[] = this.activeStatusEffects,
	): {
		forcedRollType: RollType | null;
		statusBonus: number;
		appliedEffects: string[];
	} {
		let hasVantagem = false;
		let hasDesvantagem = false;
		let statusBonus = 0;
		const appliedEffects: string[] = [];

		const normalizedLabel = attributeLabel.trim().toLowerCase();

		for (const effect of effects) {
			// 1. Unconscious / Moribund gives Desvantagem on all checks
			if (effect.type === "unconscious" || effect.type === "moribund") {
				hasDesvantagem = true;
				appliedEffects.push(effect.label);
			}

			// 2. Immobilized gives Desvantagem on Físico and Conflito checks
			if (effect.type === "immobilized") {
				if (normalizedLabel === "físico" || normalizedLabel === "conflito") {
					hasDesvantagem = true;
					appliedEffects.push(effect.label);
				}
			}

			// 3. Latent Discoordination gives Desvantagem on the reconditioned axis
			if (effect.type === "latent_discoordination") {
				const affectedAxis = effect.metadata?.trim().toLowerCase();
				let matches = false;
				if (affectedAxis === "physical" && normalizedLabel === "físico") {
					matches = true;
				}
				if (affectedAxis === "mental" && normalizedLabel === "mental") {
					matches = true;
				}
				if (affectedAxis === "social" && normalizedLabel === "social") {
					matches = true;
				}

				if (matches) {
					hasDesvantagem = true;
					appliedEffects.push(effect.label);
				}
			}

			// 4. Avatar da Guerra gives Vantagem on Físico and Conflito
			if (effect.type === "avatar_guerra") {
				if (normalizedLabel === "físico" || normalizedLabel === "conflito") {
					hasVantagem = true;
					appliedEffects.push(effect.label);
				}
			}

			// 5. Caçada Selvagem gives +5 bonus on Conflito checks
			if (effect.type === "cacada_selvagem") {
				if (normalizedLabel === "conflito") {
					statusBonus += 5;
					appliedEffects.push(effect.label);
				}
			}

			// 6. Body Fatigue (Fadiga Corporal) gives Desvantagem on Físico
			if (effect.type === "body_fatigue" && normalizedLabel === "físico") {
				hasDesvantagem = true;
				appliedEffects.push(effect.label);
			}

			// 7. Mental Fog (Neblina Mental) gives Desvantagem on Mental
			if (effect.type === "mental_fog" && normalizedLabel === "mental") {
				hasDesvantagem = true;
				appliedEffects.push(effect.label);
			}

			// 8. Spirit Ruin (Ruína Espiritual) gives Desvantagem on Social
			if (effect.type === "spirit_ruin" && normalizedLabel === "social") {
				hasDesvantagem = true;
				appliedEffects.push(effect.label);
			}
		}

		let forcedRollType: RollType | null = null;
		if (hasVantagem && hasDesvantagem) {
			forcedRollType = "Normal";
		} else if (hasVantagem) {
			forcedRollType = "Vantagem";
		} else if (hasDesvantagem) {
			forcedRollType = "Desvantagem";
		}

		return {
			forcedRollType,
			statusBonus,
			appliedEffects,
		};
	}

	public addMessage(msg: Omit<ChatMessage, "id" | "timestamp">) {
		const id = `msg-${Date.now()}-${crypto.randomUUID()}`;
		const timestamp = new Date().toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		this.messages.push({
			...msg,
			id,
			timestamp,
		});
	}

	public clearMessages() {
		this.messages = [];
	}

	// Executa uma rolagem d20 com os modificadores globais ativos
	public rollD20(
		characterName: string,
		attributeLabel: string,
		attributeValue: number,
		statusEffects: readonly {
			type: string;
			label: string;
			severity: number;
			isAggravated: boolean;
			metadata?: string | null;
		}[] = [],
	): number {
		const effectsToUse =
			statusEffects.length > 0
				? statusEffects
				: this.activeCharacterName === characterName
					? this.activeStatusEffects
					: [];

		const { forcedRollType, statusBonus, appliedEffects } =
			this.getStatusModifiersForAttribute(attributeLabel, effectsToUse);

		const array = new Uint32Array(2);
		crypto.getRandomValues(array);
		const d1 = ((array[0] ?? 0) % 20) + 1;
		const d2 = ((array[1] ?? 0) % 20) + 1;

		let finalRollType = this.rollType;
		let forceExplanation = "";

		if (forcedRollType !== null) {
			finalRollType = forcedRollType;
			if (appliedEffects.length > 0) {
				const effectsList = appliedEffects.join(", ");
				if (forcedRollType === "Normal") {
					forceExplanation = ` (Normalizado: Vantagem e Desvantagem se anulam por ${effectsList})`;
				} else {
					forceExplanation = ` (Forçado por ${effectsList})`;
				}
			}
		}

		let finalDie = d1;
		let results = [d1];
		let detailsStr = `d20 [${d1}]${forceExplanation}`;

		if (finalRollType === "Vantagem") {
			finalDie = Math.max(d1, d2);
			results = [d1, d2];
			detailsStr = `d20 com Vantagem [${d1}, ${d2}] -> escolhe ${finalDie}${forceExplanation}`;
		} else if (finalRollType === "Desvantagem") {
			finalDie = Math.min(d1, d2);
			results = [d1, d2];
			detailsStr = `d20 com Desvantagem [${d1}, ${d2}] -> escolhe ${finalDie}${forceExplanation}`;
		}

		const total = finalDie + attributeValue + this.customBonus + statusBonus;
		const bonusStr =
			this.customBonus !== 0
				? ` ${this.customBonus >= 0 ? "+" : ""}${this.customBonus} (Bônus)`
				: "";
		const attrStr =
			attributeValue !== 0
				? ` ${attributeValue >= 0 ? "+" : ""}${attributeValue} (${attributeLabel})`
				: "";
		const statusBonusStr =
			statusBonus !== 0
				? ` +${statusBonus} (${appliedEffects.join(", ")})`
				: "";

		const content = `🎲 **${characterName}** rolou **${attributeLabel}**: **${total}**\n*Detalhes: ${detailsStr}${attrStr}${bonusStr}${statusBonusStr} = ${total}*`;

		this.addMessage({
			type: "roll",
			sender: characterName,
			content,
			rollDetails: {
				die1: d1,
				die2: finalRollType !== "Normal" ? d2 : undefined,
				modifier: attributeValue,
				bonus: this.customBonus,
				rollType: finalRollType,
				results,
				finalResult: total,
			},
		});

		return total;
	}
}

export const chatState = new ChatState();
