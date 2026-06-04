import type { CharacterCreateInput } from "../model/characterSchema";

type AxisPatch = Partial<
	Pick<CharacterCreateInput, "physical" | "mental" | "social">
>;
type ApplicationPatch = Partial<
	Pick<CharacterCreateInput, "conflict" | "interaction" | "resistance">
>;

export class CharacterBuilder {
	private constructor(private readonly state: CharacterCreateInput) {}

	public static valid(): CharacterBuilder {
		return new CharacterBuilder({
			name: "Kael de Almar",
			concept: "Vanguarda protetor da caravana",
			ancestryId: "human",
			classId: "vanguarda",
			backgroundId: "abrigo-da-fe",
			level: 1,
			tensionMeter: 0,
			physical: 3,
			mental: 1,
			social: 2,
			conflict: 2,
			interaction: 1,
			resistance: 3,
		});
	}

	public withLevel(level: number): CharacterBuilder {
		return new CharacterBuilder({ ...this.state, level });
	}

	public withName(name: string): CharacterBuilder {
		return new CharacterBuilder({ ...this.state, name });
	}

	public withAxes(values: AxisPatch): CharacterBuilder {
		return new CharacterBuilder({ ...this.state, ...values });
	}

	public withApplications(values: ApplicationPatch): CharacterBuilder {
		return new CharacterBuilder({ ...this.state, ...values });
	}

	public buildCreateInput(): CharacterCreateInput {
		return { ...this.state };
	}
}
