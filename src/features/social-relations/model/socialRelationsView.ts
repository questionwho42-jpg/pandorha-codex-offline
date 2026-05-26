import type { ClockRecord } from "$lib/entities/clock";
import type {
	FactionRecord,
	FactionStandingRecord,
} from "$lib/entities/faction";
import type {
	SocialStandingEvent,
	SocialStandingFailure,
} from "$lib/features/social-standing";

export interface SocialRelationRowView {
	readonly factionId: string;
	readonly label: string;
	readonly kindLabel: string;
	readonly summary: string;
	readonly fameLabel: string;
	readonly infamyLabel: string;
	readonly debtLabel: string;
	readonly favorLabel: string;
	readonly intrigueLabel: string;
	readonly retaliationClockLabel: string | null;
	readonly statusLabel: string;
	readonly canInvokeTierOneFavor: boolean;
	readonly canRedeemTierOneDebt: boolean;
}

export interface SocialRelationsView {
	readonly emptyStateLabel: string | null;
	readonly errorMessage: string | null;
	readonly logLines: readonly string[];
	readonly rows: readonly SocialRelationRowView[];
	readonly titleLabel: string;
}

export interface SocialRelationsViewInput {
	readonly clocks?: readonly ClockRecord[];
	readonly errorMessage: string | null;
	readonly events: readonly SocialStandingEvent[];
	readonly factions: readonly FactionRecord[];
	readonly standings: readonly FactionStandingRecord[];
}

export function createSocialRelationsView(
	input: SocialRelationsViewInput,
): SocialRelationsView {
	const standingsByFaction = new Map(
		input.standings.map((standing) => [standing.factionId, standing]),
	);
	const rows = input.factions.flatMap((faction) => {
		const standing = standingsByFaction.get(faction.id);
		return standing ? [createRow(faction, standing, input.clocks ?? [])] : [];
	});

	return {
		emptyStateLabel:
			rows.length === 0
				? "Nenhuma facção de treino está disponível nesta sessão."
				: null,
		errorMessage: input.errorMessage,
		logLines:
			input.events.length > 0
				? input.events.map((event) => event.message)
				: [
						"Escolha uma facção de treino para invocar favores ou abater dívida.",
					],
		rows,
		titleLabel: "Relações sociais",
	};
}

export function mapSocialStandingFailureToMessage(
	failure: SocialStandingFailure,
): string {
	switch (failure.code) {
		case "INVALID_SOCIAL_STANDING_INPUT":
			return "Revise os dados da relação antes de continuar.";
		case "FACTION_NOT_FOUND":
		case "FACTION_LOOKUP_FAILED":
			return "Não foi possível encontrar a facção desta relação.";
		case "DEBT_LIMIT_EXCEEDED":
			return "Este favor alcançaria o limite de Dívida de Sangue. Abata dívida antes de pedir outro favor.";
		case "INVALID_FAVOR_TIER":
			return "Este tier de favor ainda não está disponível.";
		case "OPERATION_NOT_ALLOWED":
			return "Esta facção não pode conceder favores no estado atual.";
	}
}

function createRow(
	faction: FactionRecord,
	standing: FactionStandingRecord,
	clocks: readonly ClockRecord[],
): SocialRelationRowView {
	const debtLimit = calculateDebtLimit(standing);
	const nextTierOneDebt = standing.bloodDebt + 1;
	const retaliationClock = findRetaliationClock(faction, clocks);

	return {
		factionId: faction.id,
		label: faction.label,
		kindLabel: mapFactionKind(faction.kind),
		summary: faction.summary,
		fameLabel: `Fama ${standing.fameLevel}`,
		infamyLabel: `Infâmia ${standing.infamyLevel}`,
		debtLabel: `Dívida ${standing.bloodDebt}/${debtLimit}`,
		favorLabel: `Favores ${standing.favorPoints}`,
		intrigueLabel: `Intriga ${standing.intriguePoints}`,
		retaliationClockLabel: retaliationClock
			? `${retaliationClock.label} - ${retaliationClock.currentSlices}/${retaliationClock.maxSlices} fatias`
			: null,
		statusLabel: mapStandingStatus(standing.status),
		canInvokeTierOneFavor:
			standing.status === "sponsored" && nextTierOneDebt < debtLimit,
		canRedeemTierOneDebt: standing.bloodDebt > 0,
	};
}

function findRetaliationClock(
	faction: FactionRecord,
	clocks: readonly ClockRecord[],
): ClockRecord | null {
	return (
		clocks.find(
			(clock) =>
				clock.source === "social-pressure" &&
				clock.status === "active" &&
				clock.id.startsWith(`retaliation-${faction.id}-`),
		) ?? null
	);
}

function calculateDebtLimit(standing: FactionStandingRecord): number {
	return standing.fameLevel * 3;
}

function mapFactionKind(kind: FactionRecord["kind"]): string {
	switch (kind) {
		case "guild":
			return "Guilda";
		case "temple":
			return "Templo";
		case "noble-house":
			return "Casa nobre";
		case "company":
			return "Companhia";
	}
}

function mapStandingStatus(status: FactionStandingRecord["status"]): string {
	switch (status) {
		case "unpledged":
			return "Sem juramento";
		case "sponsored":
			return "Patrocinada";
		case "ultimatum":
			return "Ultimato";
		case "hunted":
			return "Caçada";
	}
}
