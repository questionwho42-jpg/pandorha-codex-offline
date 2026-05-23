import type { DialogueTree } from "$lib/entities/dialogue";

export const DIALOGUE_TREES: DialogueTree[] = [
	{
		id: "tree-merchant-bargain",
		npcId: "npc-merchant",
		rootNodeId: "root",
		nodes: {
			root: {
				id: "root",
				npcText:
					"Saudações, andarilho. O ar da Baixada está pesado hoje, mas minhas mercadorias permanecem puras. O que deseja negociar?",
				options: [
					{
						id: "opt-buy-normal",
						playerText: "Gostaria de ver suas mercadorias comuns.",
						nextNodeId: "node-normal-store",
					},
					{
						id: "opt-bargain",
						playerText:
							"Acho que podemos negociar um desconto especial... (Barganha - Teste de SOCIAL CD 15)",
						nextNodeId: "node-bargain-success",
						socialChallenge: {
							matrix: "social",
							difficultyClass: 15,
							onSuccessNodeId: "node-bargain-success",
							onFailureNodeId: "node-bargain-failure",
						},
					},
					{
						id: "opt-buy-secret",
						playerText:
							"Ouvi dizer que você guarda relíquias sob o pano... (Requer pista de inventário secreto)",
						nextNodeId: "node-secret-store",
						conditions: {
							requiredClues: ["clue-secret-inventory"],
						},
					},
					{
						id: "opt-magic-meditate",
						playerText:
							"Canalizar percepção para examinar seus amuletos sob o balcão. (Requer 3 EE)",
						nextNodeId: "node-magic-details",
						conditions: {
							requiredMinEe: 3,
						},
						effects: {
							consumeEe: 3,
							unlockClues: ["clue-magic-amulet"],
							triggerEvent: "event-examine-amulets",
						},
					},
				],
			},
			"node-normal-store": {
				id: "node-normal-store",
				npcText:
					"Aqui estão as rações comuns e adagas de ferro. O básico para sobreviver nos pântanos. Algo mais?",
				options: [
					{
						id: "opt-back-merchant-normal",
						playerText: "Voltar ao início da conversa.",
						nextNodeId: "root",
					},
				],
			},
			"node-bargain-success": {
				id: "node-bargain-success",
				npcText:
					"Sua lábia é afiada como aço de anão. Tudo bem, aplico 15% de desconto nas provisões da bigorna.",
				options: [
					{
						id: "opt-back-merchant-bargain-ok",
						playerText: "Agradecer e voltar.",
						nextNodeId: "root",
					},
				],
			},
			"node-bargain-failure": {
				id: "node-bargain-failure",
				npcText:
					"Negócios são negócios na névoa de Pandorha. O preço está fixado pelo recesso. Sem barganhas adicionais.",
				options: [
					{
						id: "opt-back-merchant-bargain-fail",
						playerText: "Concordar de má vontade e voltar.",
						nextNodeId: "root",
					},
				],
			},
			"node-secret-store": {
				id: "node-secret-store",
				npcText:
					"Ah... então você desvendou as pistas das ruínas do sul. Aqui está a Runa de Conjunção e os minérios raros do Bastião.",
				options: [
					{
						id: "opt-back-merchant-secret",
						playerText: "Voltar à conversa.",
						nextNodeId: "root",
					},
				],
			},
			"node-magic-details": {
				id: "node-magic-details",
				npcText:
					"Seus olhos queimam com a febre de éter momentânea. Você percebe que o amuleto possui uma inscrição secreta que aponta para um cofre oculto nas ruínas do leste!",
				options: [
					{
						id: "opt-back-merchant-magic",
						playerText: "Recobrar o fôlego e voltar.",
						nextNodeId: "root",
					},
				],
			},
		},
	},
	{
		id: "tree-alchemist-secrets",
		npcId: "npc-alchemist",
		rootNodeId: "root",
		nodes: {
			root: {
				id: "root",
				npcText:
					"Cuidado onde pisa! Meus frascos de veneno de víbora são instáveis. O que traz um aventureiro ao meu laboratório úmido?",
				options: [
					{
						id: "opt-ask-cure",
						playerText: "Estou procurando uma cura para a febre de éter.",
						nextNodeId: "node-cure-info",
					},
					{
						id: "opt-examine-potions",
						playerText:
							"Analisar a composição química das poções borbulhantes. (Teste de MENTAL CD 14)",
						nextNodeId: "node-potions-success",
						socialChallenge: {
							matrix: "mental",
							difficultyClass: 14,
							onSuccessNodeId: "node-potions-success",
							onFailureNodeId: "node-potions-failure",
						},
					},
					{
						id: "opt-request-special-brew",
						playerText:
							"Pedir para ele preparar o Elixir das Névoas. (Requer pista do amuleto mágico)",
						nextNodeId: "node-special-brew",
						conditions: {
							requiredClues: ["clue-magic-amulet"],
						},
					},
				],
			},
			"node-cure-info": {
				id: "node-cure-info",
				npcText:
					"A cura exige flores raras dos pântanos e escamas de víbora limpas. Se trouxer os reagentes, posso destilar na farmácia alquímica.",
				options: [
					{
						id: "opt-back-alchemist-cure",
						playerText: "Entendido. Voltar.",
						nextNodeId: "root",
					},
				],
			},
			"node-potions-success": {
				id: "node-potions-success",
				npcText:
					"Seus olhos focados identificam o aroma exato: essência de éter destilado sob pressão. Você ganha a pista do inventário secreto do mercador!",
				options: [
					{
						id: "opt-back-alchemist-potions-ok",
						playerText: "Guardar o conhecimento e voltar.",
						nextNodeId: "root",
						effects: {
							unlockClues: ["clue-secret-inventory"],
						},
					},
				],
			},
			"node-potions-failure": {
				id: "node-potions-failure",
				npcText:
					"Não toque nisso! Você quase causou uma explosão de toxinas. Mantenha os dedos longe dos catalisadores.",
				options: [
					{
						id: "opt-back-alchemist-potions-fail",
						playerText: "Pedir desculpas e afastar-se.",
						nextNodeId: "root",
					},
				],
			},
			"node-special-brew": {
				id: "node-special-brew",
				npcText:
					"Incrível! As runas do amuleto revelam o catalisador perfeito. Distilei o Elixir! A névoa da floresta não mais afetará seu vigor físico.",
				options: [
					{
						id: "opt-back-alchemist-brew",
						playerText: "Agradecer ao alquimista.",
						nextNodeId: "root",
						effects: {
							unlockClues: ["clue-elixir-mastery"],
						},
					},
				],
			},
		},
	},
	{
		id: "tree-scribe-lore",
		npcId: "npc-scribe",
		rootNodeId: "root",
		nodes: {
			root: {
				id: "root",
				npcText:
					"As crônicas de Pandorha não se escrevem sozinhas, jovem. Cada hexágono explorado é um parágrafo de sangue. O que deseja saber dos arquivos?",
				options: [
					{
						id: "opt-ask-history",
						playerText:
							"Quero saber mais sobre a névoa e os perigos do Bastião.",
						nextNodeId: "node-history-lore",
					},
					{
						id: "opt-decipher-scroll",
						playerText:
							"Tentar traduzir o pergaminho antigo de runas exposto. (Requer 2 EE)",
						nextNodeId: "node-decipher-success",
						conditions: {
							requiredMinEe: 2,
						},
						effects: {
							consumeEe: 2,
							unlockClues: ["clue-bastion-location"],
						},
					},
				],
			},
			"node-history-lore": {
				id: "node-history-lore",
				npcText:
					"O Bastião original caiu há séculos quando a febre de éter corrompeu os sacerdotes. Agora, apenas os relógios de progresso marcam o fim da nossa era.",
				options: [
					{
						id: "opt-back-scribe-history",
						playerText: "Refletir sobre a história e voltar.",
						nextNodeId: "root",
					},
				],
			},
			"node-decipher-success": {
				id: "node-decipher-success",
				npcText:
					"Sua mente se cansa profundamente, mas o pergaminho revela a localização exata de um cofre oculto no Bastião. Você desvendou a pista da localização do Bastião antigo!",
				options: [
					{
						id: "opt-back-scribe-decipher",
						playerText: "Recobrar a atenção e voltar.",
						nextNodeId: "root",
					},
				],
			},
		},
	},
];
