import type { ClockRecord } from "$lib/entities/clock";
import type {
	FactionRecord,
	FactionStandingRecord,
} from "$lib/entities/faction";
import type { NpcRecord } from "$lib/entities/npc";
import type { NpcRelationshipRecord } from "$lib/entities/npc-relationship";
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

export type SocialRelationNpcFilterValue =
	| "all"
	| "attention"
	| "stable"
	| "allies"
	| "enemies";

export interface SocialRelationNpcFilterOptionView {
	readonly value: SocialRelationNpcFilterValue;
	readonly label: string;
	readonly countLabel: string;
}

export interface SocialRelationsView {
	readonly emptyStateLabel: string | null;
	readonly errorMessage: string | null;
	readonly logLines: readonly string[];
	readonly npcFilterEmptyStateLabel: string | null;
	readonly npcFilterLabel: string;
	readonly npcFilterOptions: readonly SocialRelationNpcFilterOptionView[];
	readonly npcGroups: readonly SocialRelationNpcGroupView[];
	readonly npcRows: readonly SocialRelationNpcRowView[];
	readonly rows: readonly SocialRelationRowView[];
	readonly titleLabel: string;
}

export interface SocialRelationNpcGroupView {
	readonly factionId: string;
	readonly factionLabel: string;
	readonly rows: readonly SocialRelationNpcRowView[];
	readonly totalRowsLabel: string;
}

export interface SocialRelationNpcRowView {
	readonly factionId: string;
	readonly npcId: string;
	readonly label: string;
	readonly factionLabel: string;
	readonly attitudeLabel: string;
	readonly statusLabel: string;
	readonly pressureDamageLabel: string;
}

export interface SocialRelationsViewInput {
	readonly clocks?: readonly ClockRecord[];
	readonly errorMessage: string | null;
	readonly events: readonly SocialStandingEvent[];
	readonly factions: readonly FactionRecord[];
	readonly npcRelationshipFilter?: SocialRelationNpcFilterValue;
	readonly npcRelationships?: readonly NpcRelationshipRecord[];
	readonly npcs?: readonly NpcRecord[];
	readonly standings: readonly FactionStandingRecord[];
}

interface SocialRelationNpcRowModel {
	readonly pressureDamage: number;
	readonly row: SocialRelationNpcRowView;
	readonly status: NpcRelationshipRecord["status"];
}

const NPC_FILTER_OPTIONS: readonly Omit<
	SocialRelationNpcFilterOptionView,
	"countLabel"
>[] = [
	{ value: "all", label: "Todos" },
	{ value: "attention", label: "Atenção" },
	{ value: "stable", label: "Estáveis" },
	{ value: "allies", label: "Aliados" },
	{ value: "enemies", label: "Inimigos" },
];

const NPC_FILTER_LABELS: Record<SocialRelationNpcFilterValue, string> = {
	all: "Todos",
	attention: "Atenção",
	stable: "Estáveis",
	allies: "Aliados",
	enemies: "Inimigos",
};

const NPC_GROUP_TOTAL_LABELS: Record<
	SocialRelationNpcFilterValue,
	readonly [singular: string, plural: string]
> = {
	all: ["NPC visível", "NPCs visíveis"],
	attention: ["NPC em atenção", "NPCs em atenção"],
	stable: ["NPC estável", "NPCs estáveis"],
	allies: ["aliado", "aliados"],
	enemies: ["inimigo", "inimigos"],
};

const NPC_ROW_FILTERS: Record<
	SocialRelationNpcFilterValue,
	(model: SocialRelationNpcRowModel) => boolean
> = {
	all: () => true,
	attention: (model) =>
		[
			model.pressureDamage > 0,
			model.status === "strained",
			model.status === "enemy",
		].includes(true),
	stable: (model) => model.status === "stable",
	allies: (model) => model.status === "ally",
	enemies: (model) => model.status === "enemy",
};

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
	const npcFilter = input.npcRelationshipFilter ?? "all";
	const npcRowModels = createNpcRowModels({
		factions: input.factions,
		npcRelationships: input.npcRelationships ?? [],
		npcs: input.npcs ?? [],
	});
	const filteredNpcRowModels = filterNpcRowModels(npcRowModels, npcFilter);
	const npcRows = filteredNpcRowModels.map((model) => model.row);

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
		npcFilterEmptyStateLabel:
			npcRowModels.length > 0 && npcRows.length === 0
				? "Nenhuma relação por NPC aparece neste filtro."
				: null,
		npcFilterLabel: createNpcFilterLabel(npcFilter),
		npcFilterOptions: createNpcFilterOptions(npcRowModels),
		npcGroups: createNpcGroups(npcRows, npcFilter),
		npcRows,
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

function createNpcRowModels(input: {
	readonly factions: readonly FactionRecord[];
	readonly npcRelationships: readonly NpcRelationshipRecord[];
	readonly npcs: readonly NpcRecord[];
}): readonly SocialRelationNpcRowModel[] {
	const npcsById = new Map(input.npcs.map((npc) => [npc.id, npc]));
	const factionsById = new Map(
		input.factions.map((faction) => [faction.id, faction]),
	);

	return input.npcRelationships.map((relationship) => {
		const npc = npcsById.get(relationship.npcId);
		const faction = npc ? factionsById.get(npc.factionId) : null;
		return {
			pressureDamage: relationship.pressureDamage,
			row: {
				factionId: faction?.id ?? "unknown-faction",
				npcId: relationship.npcId,
				label: npc?.label ?? relationship.npcId,
				factionLabel: faction?.label ?? "Facção desconhecida",
				attitudeLabel: `Atitude ${mapNpcAttitude(relationship.attitude)}`,
				statusLabel: mapNpcRelationshipStatus(relationship.status),
				pressureDamageLabel: `Pressão ${relationship.pressureDamage}`,
			},
			status: relationship.status,
		};
	});
}

function createNpcFilterOptions(
	npcRowModels: readonly SocialRelationNpcRowModel[],
): readonly SocialRelationNpcFilterOptionView[] {
	return NPC_FILTER_OPTIONS.map((option) => ({
		...option,
		countLabel: String(filterNpcRowModels(npcRowModels, option.value).length),
	}));
}

function createNpcFilterLabel(filter: SocialRelationNpcFilterValue): string {
	return `Filtro de NPCs: ${NPC_FILTER_LABELS[filter]}`;
}

function filterNpcRowModels(
	npcRowModels: readonly SocialRelationNpcRowModel[],
	filter: SocialRelationNpcFilterValue,
): readonly SocialRelationNpcRowModel[] {
	return npcRowModels.filter(NPC_ROW_FILTERS[filter]);
}

function createNpcGroups(
	npcRows: readonly SocialRelationNpcRowView[],
	filter: SocialRelationNpcFilterValue,
): readonly SocialRelationNpcGroupView[] {
	const groups = new Map<string, SocialRelationNpcGroupView>();

	for (const row of npcRows) {
		const existing = groups.get(row.factionId);
		if (existing) {
			groups.set(row.factionId, {
				...existing,
				rows: [...existing.rows, row],
			});
			continue;
		}

		groups.set(row.factionId, {
			factionId: row.factionId,
			factionLabel: row.factionLabel,
			rows: [row],
			totalRowsLabel: createNpcGroupTotalRowsLabel(1, filter),
		});
	}

	return [...groups.values()].map((group) => ({
		...group,
		totalRowsLabel: createNpcGroupTotalRowsLabel(group.rows.length, filter),
	}));
}

function createNpcGroupTotalRowsLabel(
	count: number,
	filter: SocialRelationNpcFilterValue,
): string {
	return `${count} ${NPC_GROUP_TOTAL_LABELS[filter][Number(count !== 1)]}`;
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

function mapNpcAttitude(attitude: NpcRelationshipRecord["attitude"]): string {
	switch (attitude) {
		case "friendly":
			return "amistosa";
		case "neutral":
			return "neutra";
		case "skeptical":
			return "cética";
		case "hostile":
			return "hostil";
	}
}

function mapNpcRelationshipStatus(
	status: NpcRelationshipRecord["status"],
): string {
	switch (status) {
		case "stable":
			return "Relação estável";
		case "strained":
			return "Relação tensionada";
		case "ally":
			return "Aliado";
		case "enemy":
			return "Inimigo";
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
