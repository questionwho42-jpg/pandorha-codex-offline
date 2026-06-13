import { describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import { InMemoryQuestRepository } from "../../quest/infrastructure/InMemoryQuestRepository";
import type {
	QuestRepository,
	QuestRepositoryFailure,
} from "../domain/QuestRepository";
import { QuestService } from "../domain/QuestService";
import type { QuestRecord } from "../model/questSchema";

describe("QuestService", () => {
	it("should accept a new quest successfully", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		const res = await service.acceptQuest(
			"quest_test",
			"Investigar o Bastião",
			"Explore as ruínas do antigo Bastião",
			["pista_bastiao"],
			{ gold: 100, renown: 5 },
		);

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.id).toBe("quest_test");
			expect(res.data.status).toBe("active");
			expect(JSON.parse(res.data.requirementsJson)).toContain("pista_bastiao");
			expect(JSON.parse(res.data.rewardsJson).gold).toBe(100);
		}
	});

	it("should fail to accept a quest if the id already exists", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		const res = await service.acceptQuest("q1", "Quest 1 Copy", "Desc 2");

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("QUEST_REPOSITORY_WRITE_FAILED");
		}
	});

	it("should complete an active quest successfully", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		const res = await service.completeQuest("q1");

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.status).toBe("completed");
		}
	});

	it("should fail to complete a quest that does not exist", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		const res = await service.completeQuest("non_existent");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("QUEST_NOT_FOUND");
		}
	});

	it("should fail to complete a quest that is already completed or failed", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		await service.completeQuest("q1");

		const res = await service.completeQuest("q1");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("QUEST_REPOSITORY_WRITE_FAILED");
		}
	});

	it("should fail an active quest successfully", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		const res = await service.failQuest("q1");

		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.status).toBe("failed");
		}
	});

	it("should fail to mark a quest as failed if it does not exist", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		const res = await service.failQuest("non_existent");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("QUEST_NOT_FOUND");
		}
	});

	it("should fail to mark a quest as failed if it is already failed or completed", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		await service.failQuest("q1");

		const res = await service.failQuest("q1");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("QUEST_REPOSITORY_WRITE_FAILED");
		}
	});

	it("should list all quests successfully", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc 1");
		await service.acceptQuest("q2", "Quest 2", "Desc 2");

		const res = await service.listQuests();
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.length).toBe(2);
			const first = res.data[0];
			const second = res.data[1];
			expect(first).toBeDefined();
			expect(second).toBeDefined();
			if (first && second) {
				expect(first.id).toBe("q1");
				expect(second.id).toBe("q2");
			}
		}
	});

	it("should propagate error if repository findById fails during acceptQuest", async () => {
		const mockRepo: QuestRepository = {
			save: async () => ok({} as QuestRecord),
			findById: async () =>
				fail({
					code: "QUEST_REPOSITORY_READ_FAILED",
					message: "Banco corrompido",
				} as QuestRepositoryFailure),
			findAll: async () => ok([]),
			delete: async () => ok(undefined),
			saveObjective: async () =>
				fail({
					code: "QUEST_REPOSITORY_READ_FAILED",
					message: "Not implemented",
				}),
			findObjectiveById: async () =>
				fail({
					code: "QUEST_REPOSITORY_READ_FAILED",
					message: "Not implemented",
				}),
			findObjectivesByQuestId: async () =>
				fail({
					code: "QUEST_REPOSITORY_READ_FAILED",
					message: "Not implemented",
				}),
			deleteObjective: async () =>
				fail({
					code: "QUEST_REPOSITORY_READ_FAILED",
					message: "Not implemented",
				}),
		};

		const service = new QuestService(mockRepo);
		const res = await service.acceptQuest("q1", "Quest 1", "Desc 1");
		expect(res.success).toBe(true);
	});

	it("should accept a guild quest successfully and set scope correctly", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		const res = await service.acceptQuest(
			"guild_q",
			"Limpar Esgotos",
			"Mate ratos",
			[],
			{},
			"guild",
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.scope).toBe("guild");
		}

		const defRes = await service.acceptQuest(
			"camp_q",
			"Ir ao Castelo",
			"Visite rei",
		);
		expect(defRes.success).toBe(true);
		if (defRes.success) {
			expect(defRes.data.scope).toBe("campaign");
		}
	});

	it("should add and retrieve quest objectives", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc");
		const objRes = await service.addObjective(
			"q1",
			"obj1",
			"Kill 3 goblins",
			"kill",
			"goblin",
			3,
		);

		expect(objRes.success).toBe(true);
		if (objRes.success) {
			expect(objRes.data.id).toBe("obj1");
			expect(objRes.data.questId).toBe("q1");
			expect(objRes.data.type).toBe("kill");
			expect(objRes.data.target).toBe("goblin");
			expect(objRes.data.requiredAmount).toBe(3);
			expect(objRes.data.currentAmount).toBe(0);
			expect(objRes.data.status).toBe("active");
		}

		const failRes = await service.addObjective(
			"missing_q",
			"obj2",
			"Desc",
			"custom",
			"target",
		);
		expect(failRes.success).toBe(false);
		if (!failRes.success) {
			expect(failRes.error.code).toBe("QUEST_NOT_FOUND");
		}

		const listRes = await service.listObjectives("q1");
		expect(listRes.success).toBe(true);
		if (listRes.success && listRes.data) {
			expect(listRes.data.length).toBe(1);
			const firstObj = listRes.data[0];
			expect(firstObj).toBeDefined();
			if (firstObj) {
				expect(firstObj.id).toBe("obj1");
			}
		}
	});

	it("should update objective progress and auto-complete quest when all objectives are completed", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc");
		await service.addObjective(
			"q1",
			"obj1",
			"Kill 2 goblins",
			"kill",
			"goblin",
			2,
		);
		await service.addObjective(
			"q1",
			"obj2",
			"Find clue",
			"clue",
			"pista_bastiao",
			1,
		);

		// Increment objective 1 by 1
		let res = await service.updateObjectiveProgress("obj1", 1);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.currentAmount).toBe(1);
			expect(res.data.status).toBe("active");
		}

		// Quest should still be active
		let qRes = await service.listQuests();
		expect(qRes.success).toBe(true);
		if (qRes.success) {
			expect(qRes.data.find((q) => q.id === "q1")?.status).toBe("active");
		}

		// Complete objective 1
		res = await service.updateObjectiveProgress("obj1", 1);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.currentAmount).toBe(2);
			expect(res.data.status).toBe("completed");
		}

		// Complete objective 2
		res = await service.updateObjectiveProgress("obj2", 1);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.status).toBe("completed");
		}

		// Quest should now be auto-completed
		qRes = await service.listQuests();
		expect(qRes.success).toBe(true);
		if (qRes.success) {
			expect(qRes.data.find((q) => q.id === "q1")?.status).toBe("completed");
		}
	});

	it("should fail updating progress of non-existent or inactive objective", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc");
		await service.addObjective("q1", "obj1", "Desc", "custom", "target", 1);

		const failRes = await service.updateObjectiveProgress("missing_obj", 1);
		expect(failRes.success).toBe(false);
		if (!failRes.success) {
			expect(failRes.error.code).toBe("QUEST_NOT_FOUND");
		}

		// Complete it
		await service.updateObjectiveProgress("obj1", 1);
		// Try to update again
		const inactiveRes = await service.updateObjectiveProgress("obj1", 1);
		expect(inactiveRes.success).toBe(false);
		if (!inactiveRes.success) {
			expect(inactiveRes.error.code).toBe("QUEST_REPOSITORY_WRITE_FAILED");
		}
	});

	it("should evaluate objectives reactively against world state", async () => {
		const repo = new InMemoryQuestRepository();
		const service = new QuestService(repo);

		await service.acceptQuest("q1", "Quest 1", "Desc");
		await service.addObjective(
			"q1",
			"obj1",
			"Kill 2 goblins",
			"kill",
			"goblin",
			2,
		);
		await service.addObjective(
			"q1",
			"obj2",
			"Find clue",
			"clue",
			"pista_bastiao",
			1,
		);

		// Evaluate against non-matching events
		let evalRes = await service.evaluateObjectivesAgainstWorldState(
			["other_clue"],
			{ dragon: 1 },
		);
		expect(evalRes.success).toBe(true);

		const objsRes1 = await service.listObjectives("q1");
		expect(objsRes1.success).toBe(true);
		if (objsRes1.success) {
			const objs = objsRes1.data;
			expect(objs.find((o) => o.id === "obj1")?.currentAmount).toBe(0);
			expect(objs.find((o) => o.id === "obj2")?.status).toBe("active");
		}

		// Evaluate against matching events
		evalRes = await service.evaluateObjectivesAgainstWorldState(
			["pista_bastiao"],
			{ goblin: 2 },
		);
		expect(evalRes.success).toBe(true);

		const objsRes2 = await service.listObjectives("q1");
		expect(objsRes2.success).toBe(true);
		if (objsRes2.success) {
			const objs = objsRes2.data;
			expect(objs.find((o) => o.id === "obj1")?.status).toBe("completed");
			expect(objs.find((o) => o.id === "obj2")?.status).toBe("completed");
		}

		// Quest should be auto-completed
		const qRes = await service.listQuests();
		expect(qRes.success).toBe(true);
		if (qRes.success) {
			const q = qRes.data.find((q) => q.id === "q1");
			expect(q?.status).toBe("completed");
		}
	});

	describe("QuestService - Uncovered Branches", () => {
		it("should handle failures in findObjectivesByQuestId and findAll", async () => {
			const mockRepo: QuestRepository = {
				save: async (q) => ok(q),
				// biome-ignore lint/suspicious/noExplicitAny: mock objects
				findById: async (id) => ok({ id, status: "active" } as any),
				findAll: async () =>
					fail({
						code: "QUEST_REPOSITORY_READ_FAILED",
						message: "Error",
					} as QuestRepositoryFailure),
				delete: async () => ok(undefined),
				saveObjective: async (o) => ok(o),
				findObjectiveById: async (id) =>
					ok({
						id,
						status: "active",
						questId: "q1",
						requiredAmount: 1,
						currentAmount: 0,
						// biome-ignore lint/suspicious/noExplicitAny: mock objects
					} as any),
				findObjectivesByQuestId: async () =>
					fail({
						code: "QUEST_REPOSITORY_READ_FAILED",
						message: "Error",
					} as QuestRepositoryFailure),
				deleteObjective: async () => ok(undefined),
			};

			const service = new QuestService(mockRepo);

			// 1. In updateObjectiveProgress, when allObjRes fails
			const progressRes = await service.updateObjectiveProgress("obj1", 1);
			expect(progressRes.success).toBe(true);

			// 2. In evaluateObjectivesAgainstWorldState, when findAll fails
			const evalRes1 = await service.evaluateObjectivesAgainstWorldState([
				"clue",
			]);
			expect(evalRes1.success).toBe(false);

			// 3. In evaluateObjectivesAgainstWorldState, when findObjectivesByQuestId fails but findAll succeeds
			const mockRepo2: QuestRepository = {
				...mockRepo,
				// biome-ignore lint/suspicious/noExplicitAny: mock objects
				findAll: async () => ok([{ id: "q1", status: "active" } as any]),
			};
			const service2 = new QuestService(mockRepo2);
			const evalRes2 = await service2.evaluateObjectivesAgainstWorldState([
				"clue",
			]);
			expect(evalRes2.success).toBe(true);

			// 4. In updateObjectiveProgress, when saveObjective fails
			const mockRepo3: QuestRepository = {
				...mockRepo,
				saveObjective: async () =>
					fail({
						code: "QUEST_REPOSITORY_WRITE_FAILED",
						message: "Error",
					} as QuestRepositoryFailure),
			};
			const service3 = new QuestService(mockRepo3);
			const progressRes2 = await service3.updateObjectiveProgress("obj1", 1);
			expect(progressRes2.success).toBe(false);
		});
	});
});
