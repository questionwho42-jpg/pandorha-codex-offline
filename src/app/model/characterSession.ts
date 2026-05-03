import {
	type CharacterClock,
	type CharacterIdProvider,
	CharacterService,
	SessionCharacterRepository,
} from "$lib/entities/character";

export type CharacterSession = Readonly<{
	repository: SessionCharacterRepository;
	service: CharacterService;
}>;

export function createCharacterSession(): CharacterSession {
	const repository = new SessionCharacterRepository();

	return {
		repository,
		service: new CharacterService(
			repository,
			createSessionCharacterIdProvider(),
			createSystemCharacterClock(),
		),
	};
}

function createSessionCharacterIdProvider(): CharacterIdProvider {
	let nextId = 1;

	return {
		generate: () => {
			const id = `session-character-${nextId}`;
			nextId += 1;
			return id;
		},
	};
}

function createSystemCharacterClock(): CharacterClock {
	return {
		now: () => new Date().toISOString(),
	};
}
