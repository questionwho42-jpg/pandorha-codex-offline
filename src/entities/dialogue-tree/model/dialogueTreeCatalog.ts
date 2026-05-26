import {
	type DialogueNodeRecord,
	type DialogueOptionRecord,
	dialogueNodeSelectSchema,
	dialogueOptionSelectSchema,
} from "./dialogueTreeSchema";

const SOURCE_FILE = "docs/system/survival/regras-negociacao.md";
const CAPTAIN_SOURCE_FILE = "docs/system/survival/06-npcs-e-aliados.md";
const BROKER_NPC_ID = "training-broker";
const OPENING_NODE_ID = "training-broker-opening";
const INFORMANT_NPC_ID = "training-informant";
const INFORMANT_OPENING_NODE_ID = "training-informant-opening";
const CAPTAIN_NPC_ID = "training-captain";
const CAPTAIN_OPENING_NODE_ID = "training-captain-opening";

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
	{
		id: INFORMANT_OPENING_NODE_ID,
		npcId: INFORMANT_NPC_ID,
		label: "Abertura do informante",
		bodyText:
			"O informante pesa cada palavra e exige uma garantia antes de falar.",
		kind: "start",
		sourceFile: SOURCE_FILE,
		summary: "Nó inicial da negociação de treino com o Informante de Treino.",
	},
	{
		id: "training-informant-persuade-response",
		npcId: INFORMANT_NPC_ID,
		label: "Resposta à persuasão do informante",
		bodyText:
			"Ele aceita revelar uma pista pequena se sentir confiança no grupo.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary:
			"Resposta de treino para persuasão discreta antes do apelo social.",
	},
	{
		id: "training-informant-bargain-response",
		npcId: INFORMANT_NPC_ID,
		label: "Resposta à barganha do informante",
		bodyText:
			"Ele sorri ao perceber que a troca pode protegê-lo depois da conversa.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary:
			"Resposta de treino para barganha de informação antes do apelo social.",
	},
	{
		id: "training-informant-threaten-response",
		npcId: INFORMANT_NPC_ID,
		label: "Resposta à pressão do informante",
		bodyText: "Ele recua, calculando se sobreviverá ao risco de falar.",
		kind: "response",
		sourceFile: SOURCE_FILE,
		summary:
			"Resposta de treino para pressão contra informante antes do apelo social.",
	},
	{
		id: CAPTAIN_OPENING_NODE_ID,
		npcId: CAPTAIN_NPC_ID,
		label: "Abertura do capitão",
		bodyText:
			"O capitão mede o dever, o risco da escolta e a moral da tropa antes de responder.",
		kind: "start",
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary: "Nó inicial da negociação de treino com o Capitão de Treino.",
	},
	{
		id: "training-captain-persuade-response",
		npcId: CAPTAIN_NPC_ID,
		label: "Resposta ao dever",
		bodyText:
			"Ele pesa o argumento contra o dever de manter a linha e proteger os seus.",
		kind: "response",
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary:
			"Resposta de treino para persuasão baseada em dever e moral de tropa.",
	},
	{
		id: "training-captain-bargain-response",
		npcId: CAPTAIN_NPC_ID,
		label: "Resposta ao custo de escolta",
		bodyText:
			"Ele calcula o custo da escolta, as baixas prováveis e o que a tropa receberá em troca.",
		kind: "response",
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary:
			"Resposta de treino para barganha envolvendo custo de escolta e suprimentos.",
	},
	{
		id: "training-captain-threaten-response",
		npcId: CAPTAIN_NPC_ID,
		label: "Resposta à coerção",
		bodyText:
			"A ameaça atinge a hierarquia da unidade, e ele observa se a moral da tropa vai quebrar.",
		kind: "response",
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary:
			"Resposta de treino para pressão social contra autoridade militar.",
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
		minimumMentalHp: 6,
		blockedReason:
			"Exige HP mental 6 ou maior para sustentar a pressão social.",
		sortOrder: 2,
		sourceFile: SOURCE_FILE,
		summary: "Opção de diálogo que prepara o argumento social Pressionar.",
	},
	{
		id: "training-informant-option-persuade",
		nodeId: INFORMANT_OPENING_NODE_ID,
		label: "Persuadir",
		visibleText: "Prometa proteção discreta e um favor futuro.",
		choiceId: "persuade",
		nextNodeId: "training-informant-persuade-response",
		sortOrder: 0,
		sourceFile: SOURCE_FILE,
		summary:
			"Opção de diálogo que prepara persuasão cautelosa com o informante.",
	},
	{
		id: "training-informant-option-bargain",
		nodeId: INFORMANT_OPENING_NODE_ID,
		label: "Barganhar",
		visibleText: "Ofereça pagamento ou informação equivalente pela pista.",
		choiceId: "bargain",
		nextNodeId: "training-informant-bargain-response",
		sortOrder: 1,
		sourceFile: SOURCE_FILE,
		summary:
			"Opção de diálogo que prepara barganha de informação com o informante.",
	},
	{
		id: "training-informant-option-threaten",
		nodeId: INFORMANT_OPENING_NODE_ID,
		label: "Pressionar",
		visibleText: "Pressione por nomes, assumindo que ele pode se fechar.",
		choiceId: "threaten",
		nextNodeId: "training-informant-threaten-response",
		minimumMentalHp: 7,
		blockedReason:
			"Exige HP mental 7 ou maior para pressionar o informante sem quebrar a cena.",
		sortOrder: 2,
		sourceFile: SOURCE_FILE,
		summary:
			"Opção de diálogo bloqueável que prepara pressão social contra o informante.",
	},
	{
		id: "training-captain-option-persuade",
		nodeId: CAPTAIN_OPENING_NODE_ID,
		label: "Persuadir",
		visibleText: "Apele ao dever do capitão e à proteção da tropa.",
		choiceId: "persuade",
		nextNodeId: "training-captain-persuade-response",
		sortOrder: 0,
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary: "Opção de diálogo que prepara persuasão por dever militar.",
	},
	{
		id: "training-captain-option-bargain",
		nodeId: CAPTAIN_OPENING_NODE_ID,
		label: "Barganhar",
		visibleText: "Ofereça suprimentos ou pagamento pelo custo da escolta.",
		choiceId: "bargain",
		nextNodeId: "training-captain-bargain-response",
		sortOrder: 1,
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary: "Opção de diálogo que prepara barganha por escolta militar.",
	},
	{
		id: "training-captain-option-threaten",
		nodeId: CAPTAIN_OPENING_NODE_ID,
		label: "Pressionar",
		visibleText:
			"Force uma decisão, assumindo risco de quebrar a moral da tropa.",
		choiceId: "threaten",
		nextNodeId: "training-captain-threaten-response",
		minimumMentalHp: 8,
		blockedReason:
			"Exige HP mental 8 ou maior para pressionar o capitão sem quebrar a moral da tropa.",
		sortOrder: 2,
		sourceFile: CAPTAIN_SOURCE_FILE,
		summary:
			"Opção de diálogo bloqueável que prepara pressão contra autoridade militar.",
	},
] satisfies readonly DialogueOptionRecord[];

export const DIALOGUE_NODE_CATALOG = rawDialogueNodeCatalog.map((record) =>
	dialogueNodeSelectSchema.parse(record),
) satisfies readonly DialogueNodeRecord[];

export const DIALOGUE_OPTION_CATALOG = rawDialogueOptionCatalog.map((record) =>
	dialogueOptionSelectSchema.parse(record),
) satisfies readonly DialogueOptionRecord[];
