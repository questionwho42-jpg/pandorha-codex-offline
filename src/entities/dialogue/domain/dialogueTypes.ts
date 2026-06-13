export interface DialogueOption {
	id: string;
	playerText: string;
	nextNodeId: string;
	conditions?: {
		requiredClues?: string[];
		requiredMinEe?: number;
	};
	effects?: {
		consumeEe?: number;
		unlockClues?: string[];
		triggerEvent?: string;
		factionReputation?: {
			factionId: string;
			reputationChange: number;
		}[];
	};
	socialChallenge?: {
		matrix: "social" | "mental";
		difficultyClass: number;
		onSuccessNodeId: string;
		onFailureNodeId: string;
	};
}

export interface DialogueNode {
	id: string;
	npcText: string;
	options: DialogueOption[];
}

export interface DialogueTree {
	id: string;
	npcId: string;
	rootNodeId: string;
	nodes: Record<string, DialogueNode>;
}
