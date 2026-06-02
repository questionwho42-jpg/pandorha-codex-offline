import type { DialogueChoiceRecord } from "./dialogueChoiceSchema";
import { dialogueChoiceSelectSchema } from "./dialogueChoiceSchema";

const SOURCE_FILE = "docs/system/survival/regras-negociacao.md";

const rawDialogueChoiceCatalog = [
	{
		id: "persuade",
		label: "Persuadir",
		visibleText: "Apelar para confiança, lógica social e benefício mútuo.",
		tag: "persuade",
		appealModifier: 0,
		sourceFile: SOURCE_FILE,
		summary:
			"Escolha social padrão para convencer um NPC usando Social + Interação + Nível.",
	},
	{
		id: "bargain",
		label: "Barganhar",
		visibleText: "Oferecer uma troca clara para tornar o acordo mais atraente.",
		tag: "bargain",
		appealModifier: 1,
		sourceFile: SOURCE_FILE,
		summary:
			"Escolha de negociação comercial inspirada em barganha e margem de preço.",
	},
	{
		id: "threaten",
		label: "Pressionar",
		visibleText: "Forçar uma concessão com risco de piorar a relação.",
		tag: "threaten",
		appealModifier: -1,
		sourceFile: SOURCE_FILE,
		summary:
			"Escolha de intimidação de treino; a aplicação real de Social + Conflito fica para fase futura.",
	},
] satisfies readonly DialogueChoiceRecord[];

export const DIALOGUE_CHOICE_CATALOG = rawDialogueChoiceCatalog.map((record) =>
	dialogueChoiceSelectSchema.parse(record),
) satisfies readonly DialogueChoiceRecord[];
