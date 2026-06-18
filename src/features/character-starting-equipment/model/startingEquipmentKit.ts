import { fail, ok, type Result } from "$lib/shared/lib/result";

export type StartingEquipmentKitItem =
	| {
			readonly catalogKind: "equipment";
			readonly catalogItemId: string;
			readonly count: number;
	  }
	| {
			readonly catalogKind: "consumable";
			readonly catalogItemId: string;
			readonly quantity: number;
	  };

export interface StartingEquipmentKit {
	readonly classId: string;
	readonly items: readonly StartingEquipmentKitItem[];
	readonly label: string;
}

export type StartingEquipmentKitFailureCode =
	"STARTING_EQUIPMENT_CLASS_NOT_SUPPORTED";

export interface StartingEquipmentKitFailure {
	readonly code: StartingEquipmentKitFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

const STARTING_EQUIPMENT_KITS: Readonly<Record<string, StartingEquipmentKit>> =
	{
		emissary: {
			classId: "emissary",
			label: "Emissario",
			items: [
				{ catalogKind: "equipment", catalogItemId: "rapier", count: 1 },
				{
					catalogKind: "equipment",
					catalogItemId: "luxury-padded-armor",
					count: 1,
				},
				{
					catalogKind: "consumable",
					catalogItemId: "nobility-letter-stack",
					quantity: 1,
				},
			],
		},
		hunter: {
			classId: "hunter",
			label: "Cacador",
			items: [
				{ catalogKind: "equipment", catalogItemId: "leather-armor", count: 1 },
				{ catalogKind: "equipment", catalogItemId: "shortbow", count: 1 },
				{ catalogKind: "equipment", catalogItemId: "dagger", count: 1 },
				{
					catalogKind: "consumable",
					catalogItemId: "adventurer-kit-stack",
					quantity: 1,
				},
			],
		},
		vanguard: {
			classId: "vanguard",
			label: "Vanguarda",
			items: [
				{ catalogKind: "equipment", catalogItemId: "chainmail", count: 1 },
				{ catalogKind: "equipment", catalogItemId: "longsword", count: 1 },
				{ catalogKind: "equipment", catalogItemId: "round-shield", count: 1 },
				{
					catalogKind: "consumable",
					catalogItemId: "adventurer-kit-stack",
					quantity: 1,
				},
			],
		},
		weaver: {
			classId: "weaver",
			label: "Tecelao de Sombras",
			items: [
				{ catalogKind: "equipment", catalogItemId: "staff", count: 1 },
				{
					catalogKind: "consumable",
					catalogItemId: "grimoire-stack",
					quantity: 1,
				},
				{ catalogKind: "equipment", catalogItemId: "dagger", count: 2 },
				{
					catalogKind: "consumable",
					catalogItemId: "adventurer-kit-stack",
					quantity: 1,
				},
			],
		},
	};

export function resolveStartingEquipmentKit(input: {
	readonly classId: string;
}): Result<StartingEquipmentKit, StartingEquipmentKitFailure> {
	const kit = STARTING_EQUIPMENT_KITS[input.classId];
	if (!kit) {
		return fail({
			code: "STARTING_EQUIPMENT_CLASS_NOT_SUPPORTED",
			message: "Starting equipment kit is not approved for this class.",
			details: { classId: input.classId },
		});
	}

	return ok(kit);
}
