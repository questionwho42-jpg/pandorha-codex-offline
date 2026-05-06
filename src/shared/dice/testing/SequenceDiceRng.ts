import type {
	DiceClock,
	DiceRng,
	DiceRollIdProvider,
} from "../model/diceTypes";

export class SequenceDiceRng implements DiceRng {
	private index = 0;

	public constructor(private readonly values: readonly number[]) {}

	public next(): number {
		const value = this.values[this.index];
		this.index += 1;

		return value ?? Number.NaN;
	}
}

export function createSequentialDiceRollIdProvider(
	prefix: string,
): DiceRollIdProvider {
	let nextId = 1;

	return {
		generate: () => {
			const id = `${prefix}-${nextId}`;
			nextId += 1;
			return id;
		},
	};
}

export function createDeterministicDiceClock(startIso: string): DiceClock {
	const startMs = Date.parse(startIso);
	let offsetSeconds = 0;

	return {
		now: () => {
			const createdAt = new Date(startMs + offsetSeconds * 1000).toISOString();
			offsetSeconds += 1;
			return createdAt;
		},
	};
}
