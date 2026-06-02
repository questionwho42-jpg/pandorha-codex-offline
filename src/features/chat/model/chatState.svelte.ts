export type RollType = "Normal" | "Vantagem" | "Desvantagem";

export interface ChatMessage {
	id: string;
	timestamp: string;
	sender?: string;
	type: "roll" | "system" | "combat" | "camp" | "narrative";
	content: string;
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

	// Logs de chat globais
	public messages = $state<ChatMessage[]>([]);

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
	): number {
		const array = new Uint32Array(2);
		crypto.getRandomValues(array);
		const d1 = ((array[0] ?? 0) % 20) + 1;
		const d2 = ((array[1] ?? 0) % 20) + 1;

		let finalDie = d1;
		let results = [d1];
		let detailsStr = `d20 [${d1}]`;

		if (this.rollType === "Vantagem") {
			finalDie = Math.max(d1, d2);
			results = [d1, d2];
			detailsStr = `d20 com Vantagem [${d1}, ${d2}] -> escolhe ${finalDie}`;
		} else if (this.rollType === "Desvantagem") {
			finalDie = Math.min(d1, d2);
			results = [d1, d2];
			detailsStr = `d20 com Desvantagem [${d1}, ${d2}] -> escolhe ${finalDie}`;
		}

		const total = finalDie + attributeValue + this.customBonus;
		const bonusStr =
			this.customBonus !== 0
				? ` ${this.customBonus >= 0 ? "+" : ""}${this.customBonus} (Bônus)`
				: "";
		const attrStr =
			attributeValue !== 0
				? ` ${attributeValue >= 0 ? "+" : ""}${attributeValue} (${attributeLabel})`
				: "";

		const content = `🎲 **${characterName}** rolou **${attributeLabel}**: **${total}**\n*Detalhes: ${detailsStr}${attrStr}${bonusStr} = ${total}*`;

		this.addMessage({
			type: "roll",
			sender: characterName,
			content,
			rollDetails: {
				die1: d1,
				die2: this.rollType !== "Normal" ? d2 : undefined,
				modifier: attributeValue,
				bonus: this.customBonus,
				rollType: this.rollType,
				results,
				finalResult: total,
			},
		});

		return total;
	}
}

export const chatState = new ChatState();
