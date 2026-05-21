import {
	type DialogueNodeRecord,
	type DialogueOptionRecord,
	dialogueNodeSelectSchema,
	dialogueOptionSelectSchema,
} from "./dialogueTreeSchema";

const SOURCE_FILE = "docs/system/survival/regras-negociacao.md";
const BROKER_NPC_ID = "training-broker";
const OPENING_NODE_ID = "training-broker-opening";

const rawDialogueNodeCatalog = [
	{
		id: OPENING_NODE_ID,
		npcId: BROKER_NPC_ID,
		label: "Abertura da corretora",
		bodyText: "A corretora cruza os braços e pede uma proposta concreta.",
		kind: "start",
		sourceFile: SOURCE_FILE,
		summary: "Nó inicial da negociação de treino com a Corretora de Treino.",
	},
	{
		id: "training-broker-persuade-response",
		npcId: BROKER_NPC_ID,
		label: "Resposta à persuasão",
		bodyText:
			"Ela considera a lógica do acordo e observa se há confiança real.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary:
			"Resposta de treino para um argumento de persuasão antes do apelo social.",
	},
	{
		id: "training-broker-bargain-response",
		npcId: BROKER_NPC_ID,
		label: "Resposta à barganha",
		bodyText: "Ela se inclina para frente ao ouvir a troca proposta.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary:
			"Resposta de treino para barganha comercial antes do apelo social.",
	},
	{
		id: "training-broker-threaten-response",
		npcId: BROKER_NPC_ID,
		label: "Resposta à pressão",
		bodyText: "O tom pesa na sala e a paciência da corretora diminui.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary: "Resposta de treino para pressão social antes do apelo social.",
	},
] satisfies readonly DialogueNodeRecord[];

const rawDialogueOptionCatalog = [
	{
		id: "training-broker-option-persuade",
		nodeId: OPENING_NODE_ID,
		label: "Persuadir",
		visibleText:
			"Apresente uma proposta baseada em confiança e benefício mútuo.",
		choiceId: "persuade",
		nextNodeId: "training-broker-persuade-response",
		sortOrder: 0,
		sourceFile: SOURCE_FILE,
		summary: "Opção de diálogo que prepara o argumento social Persuadir.",
	},
	{
		id: "training-broker-option-bargain",
		nodeId: OPENING_NODE_ID,
		label: "Barganhar",
		visibleText: "Ofereça uma troca objetiva para tornar o acordo atraente.",
		choiceId: "bargain",
		nextNodeId: "training-broker-bargain-response",
		sortOrder: 1,
		sourceFile: SOURCE_FILE,
		summary: "Opção de diálogo que prepara o argumento social Barganhar.",
	},
	{
		id: "training-broker-option-threaten",
		nodeId: OPENING_NODE_ID,
		label: "Pressionar",
		visibleText: "Pressione por uma concessão, aceitando risco social.",
		choiceId: "threaten",
		nextNodeId: "training-broker-threaten-response",
		sortOrder: 2,
		sourceFile: SOURCE_FILE,
		summary: "Opção de diálogo que prepara o argumento social Pressionar.",
	},
] satisfies readonly DialogueOptionRecord[];

export const DIALOGUE_NODE_CATALOG = rawDialogueNodeCatalog.map((record) =>
	dialogueNodeSelectSchema.parse(record),
) satisfies readonly DialogueNodeRecord[];

export const DIALOGUE_OPTION_CATALOG = rawDialogueOptionCatalog.map((record) =>
	dialogueOptionSelectSchema.parse(record),
) satisfies readonly DialogueOptionRecord[];
