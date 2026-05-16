import type { CharacterRecord } from "$lib/entities/character";
import {
	BasicSocialAttack,
	GroupSenseDecorator,
	type ISocialAttack,
	MysticCharmDecorator,
	VenomousFlatteryDecorator,
} from "$lib/features/social/domain/SocialManeuvers";
import {
	type BargainOffer,
	calculateOfferMarginBonus,
	type SocialAction,
	SocialCombatService,
	type SocialConflictState,
	type SocialTarget,
} from "$lib/features/social/model-api";
import { generateId } from "$lib/shared/lib/id";

export type SocialManeuverType =
	| "none"
	| "group_sense"
	| "venomous_flattery"
	| "mystic_charm";

export type SocialSession = Readonly<{
	playerCharacter: CharacterRecord;
	target: SocialTarget;
	conflictState: SocialConflictState;
	service: SocialCombatService;
	submitArgument: (
		axis: string,
		margin: number,
		maneuver?: SocialManeuverType,
	) => void;
	addBargainOffer: (offer: BargainOffer) => void;
}>;

// Temporário para desenvolvimento/teste local:
const dummyClock = { now: () => new Date().toISOString() };

export function createSocialSession(
	player: CharacterRecord,
	initialTarget: SocialTarget,
): SocialSession {
	const service = new SocialCombatService(dummyClock);

	let currentTarget = { ...initialTarget };

	let currentConflictState: SocialConflictState = {
		id: generateId(),
		participantIds: [player.id, initialTarget.id],
		currentRound: 1,
		maxRounds: 5, // Limite arbitrário de exemplo
		bargainOffers: [],
	};

	function submitArgument(
		axis: string,
		margin: number,
		maneuver: SocialManeuverType = "none",
	) {
		// Padrão Decorator: Construir a cebola de execução
		let attackChain: ISocialAttack = new BasicSocialAttack();

		if (maneuver === "group_sense") {
			attackChain = new GroupSenseDecorator(attackChain);
		} else if (maneuver === "venomous_flattery") {
			attackChain = new VenomousFlatteryDecorator(attackChain);
		} else if (maneuver === "mystic_charm") {
			attackChain = new MysticCharmDecorator(attackChain);
		}

		// O Bônus da Barganha aplica-se à margem inicial
		const bargainBonus = calculateOfferMarginBonus(
			currentConflictState.bargainOffers,
		);
		const initialMargin = margin + bargainBonus;

		// 1. O Decorador processa a mecânica, alterando a margem, gerando favores, etc.
		const attackContext = attackChain.execute({
			margin: initialMargin,
			target: currentTarget,
			generatedFavors: 0,
			log: [],
		});

		// 2. Aplicar favores gerados automaticamente pela manobra
		if (attackContext.generatedFavors > 0) {
			for (let i = 0; i < attackContext.generatedFavors; i++) {
				addBargainOffer({
					id: generateId(),
					type: "favor",
					favorType: "minor",
					valueInGold: 100,
					description: "Favor Menor (Manobra)",
				});
			}
		}

		// Atualizar o alvo (pode ter sofrido um Charme)
		currentTarget = attackContext.target;

		const action: SocialAction = {
			id: generateId(),
			type: "persuasion",
			baseAxis: axis,
			dc: 15, // Mockado
			performerId: player.id,
			targetId: currentTarget.id,
		};

		// 3. Executar o dano com o serviço de combate
		const result = service.applyArgument(
			currentTarget,
			action,
			attackContext.margin,
			[],
		);
		if (result.success) {
			currentTarget = result.data.target;

			console.log(attackContext.log.join("\n"));

			// Atualizar o conflito para a próxima rodada
			currentConflictState = {
				...currentConflictState,
				currentRound: currentConflictState.currentRound + 1,
			};
		}
	}

	function addBargainOffer(offer: BargainOffer) {
		currentConflictState = {
			...currentConflictState,
			bargainOffers: [...currentConflictState.bargainOffers, offer],
		};
	}

	return {
		get playerCharacter() {
			return player;
		},
		get target() {
			return currentTarget;
		},
		get conflictState() {
			return currentConflictState;
		},
		get service() {
			return service;
		},
		submitArgument,
		addBargainOffer,
	};
}
