import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import { test } from "node:test";
import path from "node:path";
import Database from "better-sqlite3";
import {
	buildColumnMap,
	auditSaveMigrationMatrix,
	createAuditor,
	isReadOnlySql,
  openDatabase,
  resolveDbPath
} from "../dist/index.js";

function createFixtureDb() {
  const dbPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "pandorha-db-auditor-")), "test.db");
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE actors (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      base INTEGER NOT NULL,
      fisico INTEGER NOT NULL,
      mental INTEGER NOT NULL,
      social INTEGER NOT NULL,
      conflito INTEGER NOT NULL,
      interacao INTEGER NOT NULL,
      resistencia INTEGER NOT NULL,
      nivel INTEGER NOT NULL,
      hp INTEGER NOT NULL,
      ee INTEGER NOT NULL,
      fisico_conflito INTEGER NOT NULL,
      mental_resistencia INTEGER NOT NULL
    );
  `);
  db.prepare(`
    INSERT INTO actors (
      id, name, base, fisico, mental, social, conflito, interacao, resistencia,
      nivel, hp, ee, fisico_conflito, mental_resistencia
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(1, "Aelia", 10, 2, 3, 4, 1, 2, 3, 4, 60, 7, 5, 6);

  return db;
}

test("getActorStats returns actor identity, axes, applications, and matrix", () => {
  const db = createFixtureDb();
  const auditor = createAuditor(db);
  const result = auditor.getActorStats({ actor_name: "Aelia" });

  assert.equal(result.stats.identity.name, "Aelia");
  assert.equal(result.stats.axes.fisico, 2);
  assert.equal(result.stats.applications.resistencia, 3);
  assert.equal(result.stats.matrix.fisico.conflito, 5);
  assert.equal(result.stats.matrix.mental.resistencia, 6);

  db.close();
});

test("verifyMath validates HP and EE formulas from blueprint", () => {
  const db = createFixtureDb();
  const auditor = createAuditor(db);
  const result = auditor.verifyMath(1);

  assert.equal(result.hp.calculated, 60);
  assert.equal(result.hp.ok, true);
  assert.equal(result.ee.calculated, 7);
  assert.equal(result.ee.ok, true);
  assert.equal(result.ok, true);

  db.close();
});

test("verifyMath reports invalid persisted HP", () => {
  const db = createFixtureDb();
  db.prepare("UPDATE actors SET hp = 59 WHERE id = 1").run();
  const auditor = createAuditor(db);
  const result = auditor.verifyMath(1);

  assert.equal(result.hp.calculated, 60);
  assert.equal(result.hp.stored, 59);
  assert.equal(result.hp.ok, false);
  assert.equal(result.ok, false);

  db.close();
});

test("executeQuery allows read-only SQL and blocks writes", () => {
  const db = createFixtureDb();
  const auditor = createAuditor(db);
  const result = auditor.executeQuery("SELECT name FROM actors WHERE id = ?", [1]);

  assert.deepEqual(result.rows, [{ name: "Aelia" }]);
  assert.deepEqual(auditor.executeQuery("SELECT name FROM actors WHERE id = $id", { id: 1 }).rows, [{ name: "Aelia" }]);
  assert.throws(() => auditor.executeQuery("DELETE FROM actors"), /read-only/);
  assert.throws(() => auditor.executeQuery("SELECT 1; SELECT 2"), /read-only/);

  db.close();
});

test("fixture database stays read-only through the auditor query gate", () => {
  const db = createFixtureDb();
  const auditor = createAuditor(db);

  assert.deepEqual(auditor.executeQuery("SELECT COUNT(*) AS total FROM actors").rows, [{ total: 1 }]);
  assert.throws(() => auditor.executeQuery("INSERT INTO actors (name) VALUES ('Unsafe')"), /read-only/);
  assert.throws(() => auditor.executeQuery("PRAGMA journal_mode = WAL"), /read-only/);
  assert.deepEqual(auditor.executeQuery("SELECT COUNT(*) AS total FROM actors").rows, [{ total: 1 }]);

  db.close();
});

test("executeQuery rejects a prepared statement that SQLite marks as non-reader", () => {
  const fakeDb = {
    prepare() {
      return {
        reader: false
      };
    }
  };

  assert.throws(() => createAuditor(fakeDb).executeQuery("SELECT 1"), /non-reader/);
});

test("safe PRAGMA reads are allowed while write PRAGMAs are blocked", () => {
  assert.equal(isReadOnlySql("PRAGMA table_info(actors)"), true);
  assert.equal(isReadOnlySql("PRAGMA journal_mode = WAL"), false);
  assert.equal(isReadOnlySql("WITH actor_rows AS (SELECT 1) SELECT * FROM actor_rows"), true);
  assert.equal(isReadOnlySql("SELECT ';' AS literal"), true);
  assert.equal(isReadOnlySql("SELECT 'it'';s safe' AS literal"), true);
  assert.equal(isReadOnlySql(""), false);
});

test("column aliases are normalized before mapping", () => {
  const map = buildColumnMap(["Físico", "Resistência", "Nível", "Energia Etérica"]);

  assert.equal(map.axes.fisico, "Físico");
  assert.equal(map.applications.resistencia, "Resistência");
  assert.equal(map.level, "Nível");
  assert.equal(map.ee, "Energia Etérica");
});

test("missing actors table returns a clear error", () => {
  const db = new Database(":memory:");
  const auditor = createAuditor(db);

  assert.throws(() => auditor.getActorStats({ actor_id: 1 }), /actors/);

  db.close();
});

test("resolveDbPath and openDatabase support explicit paths", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pandorha-db-path-"));
  const dbPath = path.join(root, "custom.db");

  assert.equal(resolveDbPath({ PANDORHA_DB_PATH: dbPath }), path.resolve(dbPath));
  assert.equal(resolveDbPath({ PANDORHA_PROJECT_ROOT: root }), path.join(root, "dev.db"));

  const db = openDatabase(dbPath);
  db.exec("CREATE TABLE sample (id INTEGER)");
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE name = 'sample'").get(), { name: "sample" });
  db.close();
});

test("actor lookup can fall back to rowid when no id column exists", () => {
  const db = new Database(":memory:");
  db.exec("CREATE TABLE actors (name TEXT, base INTEGER, fisico INTEGER, mental INTEGER, resistencia INTEGER, nivel INTEGER, hp INTEGER)");
  db.prepare("INSERT INTO actors VALUES (?, ?, ?, ?, ?, ?, ?)").run("SemId", 10, 1, 2, 3, 4, 56);

  const result = createAuditor(db).getActorStats({ actor_id: 1 });

  assert.equal(result.stats.identity.name, "SemId");
  db.close();
});

test("actor lookup by name requires a detected name column", () => {
  const db = new Database(":memory:");
  db.exec("CREATE TABLE actors (base INTEGER)");

  assert.throws(() => createAuditor(db).getActorStats({ actor_name: "Aelia" }), /name column/);
  db.close();
});

test("auditSaveMigrationMatrix validates snapshot metadata and required tables without mutation", () => {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE world_state_entries (key TEXT PRIMARY KEY, value_json TEXT NOT NULL);
    CREATE TABLE characters (id TEXT PRIMARY KEY);
  `);
  db.prepare("INSERT INTO world_state_entries VALUES (?, ?)").run(
    "system:save:primary:metadata",
    JSON.stringify({ version: 9, savedAt: "2026-01-01T00:00:00.000Z" })
  );

  const before = db.prepare("SELECT COUNT(*) AS total FROM world_state_entries").get();
  const result = auditSaveMigrationMatrix(db, {
    current_save_version: 9,
    required_tables: ["world_state_entries", "characters"]
  });
  const after = db.prepare("SELECT COUNT(*) AS total FROM world_state_entries").get();

  assert.equal(result.ok, true);
  assert.equal(result.issues.length, 0);
  assert.deepEqual(after, before);
  db.close();
});

test("auditSaveMigrationMatrix reports incompatible schema and future metadata", () => {
  const db = new Database(":memory:");
  db.exec("CREATE TABLE world_state_entries (key TEXT PRIMARY KEY, value_json TEXT NOT NULL);");
  db.prepare("INSERT INTO world_state_entries VALUES (?, ?)").run(
    "system:save:primary:metadata",
    JSON.stringify({ version: 10, savedAt: "2026-01-01T00:00:00.000Z" })
  );

  const result = auditSaveMigrationMatrix(db, {
    current_save_version: 9,
    required_tables: ["missing_table"]
  });

  assert.equal(result.ok, false);
  assert.ok(result.issues.some((issue) => issue.type === "missing-table"));
  assert.ok(result.issues.some((issue) => issue.type === "future-save-version"));
  db.close();
});

test("verifyMath reports missing formula inputs", () => {
  const db = new Database(":memory:");
  db.exec("CREATE TABLE actors (id INTEGER PRIMARY KEY, name TEXT)");
  db.prepare("INSERT INTO actors VALUES (?, ?)").run(1, "Incomplete");

  const result = createAuditor(db).verifyMath(1);

  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ["base", "fisico", "resistencia", "nivel", "hp"]);
  assert.equal(result.ee.ok, null);
  db.close();
});

test("missing actor returns a clear error", () => {
  const db = createFixtureDb();

  assert.throws(() => createAuditor(db).getActorStats({ actor_id: 999 }), /Actor not found/);
  assert.throws(() => createAuditor(db).getActorStats({}), /Provide actor_id/);
  db.close();
});
