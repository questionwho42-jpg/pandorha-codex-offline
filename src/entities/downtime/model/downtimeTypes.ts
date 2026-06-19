import type { Result } from "$lib/shared/lib/result";

export interface IDowntimeActor {
	getId(): string;
	getGold(): number;
	modifyGold(amount: number): Promise<Result<void, string>>;
	getLevel(): number;
	getStat(statName: string): number;
	hasIllnessOrNecroticLoss(): boolean;
	clearIllnessesAndNecroticLosses(): Promise<Result<void, string>>;
	hasTalent(talentId: string): boolean;
	retrainTalent(
		oldTalentId: string,
		newTalentId: string,
	): Promise<Result<void, string>>;
}

export interface IDowntimeFaction {
	getInfamy(regionId: string): number;
	modifyInfamy(regionId: string, amount: number): Promise<Result<void, string>>;
	getStanding(factionId: string): number;
	modifyStanding(
		factionId: string,
		amount: number,
	): Promise<Result<void, string>>;
	sealPact(
		factionId: string,
		artifactSpent: boolean,
	): Promise<Result<void, string>>;
}

export interface IDowntimeEquipment {
	getWeaponDurability(characterId: string): number;
	repairAllEquipment(characterId: string): Promise<Result<void, string>>;
}

export interface IDowntimeQuest {
	revealWeaknessOrImmunity(
		bossId: string,
		details: string,
	): Promise<Result<void, string>>;
}

export interface IDowntimeDice {
	rollD20(): number;
	rollWithAdvantage(): number;
	rollWithDisadvantage(): number;
}

export interface IDowntimeContext {
	getActor(characterId: string): Promise<Result<IDowntimeActor, string>>;
	getFaction(factionId: string): Promise<Result<IDowntimeFaction, string>>;
	getEquipment(
		characterId: string,
	): Promise<Result<IDowntimeEquipment, string>>;
	getQuest(): IDowntimeQuest;
	getDice(): IDowntimeDice;
}
