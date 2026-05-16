export interface CampSession {
	id: string;
	totalTime: number;
	sleepHours: number;
	availableActions: number;
	dangerCounter: number;
	activeActivities: CampActivity[];
}

export interface CampActivity {
	id: string;
	name: string;
	performerId: string;
	matrix: "Physical" | "Mental" | "Social";
	costCargas?: number;
	difficulty: number;
}

export interface CampSessionCreateOptions {
	totalTime: number;
	sleepHours?: number;
}
