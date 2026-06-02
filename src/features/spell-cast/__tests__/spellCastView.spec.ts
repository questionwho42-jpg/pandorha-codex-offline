import { describe, expect, it } from "vitest";
import { OFFICIAL_SPELLS, type SpellRecord } from "$lib/entities/spell";
import type { SpellCastBuildResult } from "../model/spellCastBuilderTypes";
import {
	createSpellCastPanelView,
	mapSpellCastFailureToMessage,
} from "../model/spellCastView";

describe("spell cast view", () => {
	it("shows the selected light spell with cost, components, resolution and source", () => {
		const view = createSpellCastPanelView({
			spells: OFFICIAL_SPELLS,
			selectedSpellId: "light",
			targetLabel: "Guarda de Treino",
			buildResult: null,
			errorMessage: null,
		});

		expect(view.selectedSpellLabel).toBe("Luz");
		expect(view.costLabel).toBe("0 EE");
		expect(view.componentsLabel).toBe("Componentes: V, M");
		expect(view.resolutionLabel).toBe("Sem rolagem de ataque ou resistência");
		expect(view.sourceLabel).toBe(
			"Fonte: docs/system/magic/12-02-grimorio-circulo-0.md",
		);
		expect(view.targetLabel).toBe("Alvo: Guarda de Treino");
		expect(view.initialInstruction).toBe(
			"Escolha uma magia e prepare a conjuração.",
		);
	});

	it("labels attack-roll and saving-throw spells in pt-BR", () => {
		const attackView = createSpellCastPanelView({
			spells: OFFICIAL_SPELLS,
			selectedSpellId: "ray-of-frost",
			targetLabel: "Guarda de Treino",
			buildResult: null,
			errorMessage: null,
		});
		const saveView = createSpellCastPanelView({
			spells: OFFICIAL_SPELLS,
			selectedSpellId: "sacred-flame",
			targetLabel: "Guarda de Treino",
			buildResult: null,
			errorMessage: null,
		});

		expect(attackView.resolutionLabel).toBe("Ataque mágico");
		expect(saveView.resolutionLabel).toBe("Teste de resistência");
	});

	it("falls back to the first spell when the selected id is unknown", () => {
		const view = createSpellCastPanelView({
			spells: OFFICIAL_SPELLS,
			selectedSpellId: "missing-spell",
			targetLabel: "Guarda de Treino",
			buildResult: null,
			errorMessage: null,
		});

		expect(view.selectedSpellId).toBe("light");
		expect(view.selectedSpellLabel).toBe("Luz");
	});

	it("shows prepared command feedback in pt-BR", () => {
		const view = createSpellCastPanelView({
			spells: OFFICIAL_SPELLS,
			selectedSpellId: "light",
			targetLabel: "Guarda de Treino",
			buildResult: createBuildResult(),
			errorMessage: null,
		});

		expect(view.resultTitle).toBe("Conjuração preparada");
		expect(view.resultDescription).toBe(
			"Comando cast-spell pronto para Luz contra Guarda de Treino. Custo total: 0 EE.",
		);
	});

	it("maps builder failures to useful user messages without technical codes", () => {
		const messages = [
			mapSpellCastFailureToMessage({
				code: "INVALID_SPELL_CAST_INPUT",
				message: "Technical failure.",
			}),
			mapSpellCastFailureToMessage({
				code: "SPELL_LOOKUP_FAILED",
				message: "Technical failure.",
			}),
			mapSpellCastFailureToMessage({
				code: "UNSUPPORTED_METAMAGIC",
				message: "Technical failure.",
			}),
			mapSpellCastFailureToMessage({
				code: "INVALID_SPELL_COMMAND",
				message: "Technical failure.",
			}),
		];
		const insufficientMessage = mapSpellCastFailureToMessage({
			code: "INSUFFICIENT_ETHER",
			message: "Technical failure.",
			details: { availableEther: 0, requiredEther: 1 },
		});
		const missingDetailsMessage = mapSpellCastFailureToMessage({
			code: "INSUFFICIENT_ETHER",
			message: "Technical failure.",
		});

		expect(messages).toEqual([
			"Confira conjurador, alvo e dados da conjuração antes de tentar novamente.",
			"A magia escolhida não foi encontrada no catálogo atual.",
			"Metamagia ainda não está disponível nesta versão.",
			"Não foi possível preparar o comando técnico da conjuração.",
		]);
		expect(insufficientMessage).toBe(
			"EE insuficiente: você tem 0 EE e precisa de 1 EE.",
		);
		expect(missingDetailsMessage).toBe(
			"EE insuficiente: você tem ? EE e precisa de ? EE.",
		);
		expect(
			[...messages, insufficientMessage, missingDetailsMessage].join(" "),
		).not.toContain("INSUFFICIENT_ETHER");
	});

	it("handles the empty catalog state without enabling preparation", () => {
		const view = createSpellCastPanelView({
			spells: [],
			selectedSpellId: "light",
			targetLabel: "Guarda de Treino",
			buildResult: null,
			errorMessage: "Não há magias disponíveis.",
		});

		expect(view.canPrepare).toBe(false);
		expect(view.selectedSpellLabel).toBe("Nenhuma magia disponível");
		expect(view.errorMessage).toBe("Não há magias disponíveis.");
	});

	it("keeps result details empty when a result is passed without catalog data", () => {
		const view = createSpellCastPanelView({
			spells: [],
			selectedSpellId: "light",
			targetLabel: "Guarda de Treino",
			buildResult: createBuildResult(),
			errorMessage: null,
		});

		expect(view.resultTitle).toBe("Conjuração preparada");
		expect(view.resultDescription).toBeNull();
		expect(view.resolutionLabel).toBe("Sem magia selecionada");
		expect(view.sourceLabel).toBe("Fonte: -");
		expect(view.summary).toBe("Nenhuma magia disponível.");
	});
});

function createBuildResult(): SpellCastBuildResult {
	const light = OFFICIAL_SPELLS[0] as SpellRecord;

	return {
		draft: {
			casterId: "training-caster",
			flow: "Commit",
			spellId: "light",
			spellLabel: light.label,
			targetId: "training-guard",
		},
		audit: {
			availableEther: 0,
			baseEtherCost: 0,
			metamagicEtherCost: 0,
			totalEtherCost: 0,
		},
		command: {
			id: "spell-cast-1",
			type: "cast-spell",
			source: "SpellCastBuilderService",
			createdAt: "2026-05-13T12:00:00.000Z",
			payload: {
				casterId: "training-caster",
				damageText: null,
				requiresAttackRoll: false,
				requiresSavingThrow: false,
				spellCircle: 0,
				spellId: "light",
				targetId: "training-guard",
				totalEtherCost: 0,
			},
		},
	};
}
